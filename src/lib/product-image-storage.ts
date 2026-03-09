import "@tanstack/react-start/server-only";

import { S3Client } from "bun";
import sharp from "sharp";

const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL ?? "https://catalog-bucket.relicware.co";

const PRODUCT_IMAGE_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PRODUCT_IMAGE_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;
const PRODUCT_IMAGE_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type ProductImageUploadResult = {
  key: string;
  url: string;
  contentType: "image/webp";
  bytes: number;
  width: number | null;
  height: number | null;
};

type ProcessedImage = {
  bytes: Buffer;
  width: number | null;
  height: number | null;
};

export class ProductImageStorageError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ProductImageStorageError";
  }
}

const globalForProductImageStorage = globalThis as typeof globalThis & {
  __relicwareProductImageS3Client?: S3Client;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new ProductImageStorageError(
      `Falta la variable de entorno ${name}.`,
      500,
    );
  }

  return value;
}

function getProductImageClient() {
  if (!globalForProductImageStorage.__relicwareProductImageS3Client) {
    globalForProductImageStorage.__relicwareProductImageS3Client =
      new S3Client({
        accessKeyId: getRequiredEnv("R2_ACCESS_KEY"),
        secretAccessKey: getRequiredEnv("R2_SECRET_KEY"),
        bucket: getRequiredEnv("R2_BUCKET_NAME"),
        endpoint: getRequiredEnv("R2_ENDPOINT_URL"),
        region: "auto",
      });
  }

  return globalForProductImageStorage.__relicwareProductImageS3Client;
}

function getPublicBaseUrl() {
  return R2_PUBLIC_BASE_URL.endsWith("/")
    ? R2_PUBLIC_BASE_URL.slice(0, -1)
    : R2_PUBLIC_BASE_URL;
}

function toPublicUrl(key: string) {
  return `${getPublicBaseUrl()}/${key}`;
}

function toStorageKey(url: string) {
  try {
    const parsedUrl = new URL(url);
    const publicBaseUrl = new URL(`${getPublicBaseUrl()}/`);

    if (parsedUrl.origin !== publicBaseUrl.origin) {
      return null;
    }

    const normalizedPath = parsedUrl.pathname.replace(/^\/+/, "");
    return normalizedPath.length > 0 ? normalizedPath : null;
  } catch {
    return null;
  }
}

function buildStorageKey(organizationId: string) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `products/${organizationId}/${year}/${month}/${crypto.randomUUID()}.webp`;
}

async function optimizeImage(input: Buffer) {
  const profiles = [
    { width: PRODUCT_IMAGE_MAX_DIMENSION, quality: 82 },
    { width: 1440, quality: 74 },
    { width: 1280, quality: 68 },
  ] as const;

  for (const profile of profiles) {
    const transformed = sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: profile.width,
        height: profile.width,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: profile.quality, effort: 4, smartSubsample: true });

    const { data, info } = await transformed.toBuffer({
      resolveWithObject: true,
    });

    if (data.byteLength <= PRODUCT_IMAGE_MAX_OUTPUT_BYTES) {
      return {
        bytes: data,
        width: info.width ?? null,
        height: info.height ?? null,
      } satisfies ProcessedImage;
    }
  }

  throw new ProductImageStorageError(
    "La imagen optimizada sigue siendo muy pesada. Usa una imagen más ligera.",
    400,
  );
}

async function processImage(file: File) {
  if (!PRODUCT_IMAGE_ALLOWED_TYPES.has(file.type)) {
    throw new ProductImageStorageError(
      "Solo se permiten imágenes JPG, PNG o WebP.",
      400,
    );
  }

  if (file.size > PRODUCT_IMAGE_MAX_UPLOAD_BYTES) {
    throw new ProductImageStorageError(
      "La imagen no puede superar 10 MB antes de optimizarse.",
      400,
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  if (input.byteLength === 0) {
    throw new ProductImageStorageError(
      "La imagen enviada está vacía.",
      400,
    );
  }

  try {
    return await optimizeImage(input);
  } catch (error) {
    if (error instanceof ProductImageStorageError) {
      throw error;
    }

    throw new ProductImageStorageError(
      "No se pudo procesar la imagen. Verifica que el archivo sea válido.",
      400,
    );
  }
}

export async function uploadProductImage(input: {
  organizationId: string;
  file: File;
}) {
  const processed = await processImage(input.file);
  const key = buildStorageKey(input.organizationId);
  const client = getProductImageClient();

  try {
    await client.write(key, processed.bytes, {
      type: "image/webp",
    });
  } catch (error) {
    console.error("No se pudo subir la imagen de producto a R2", {
      error,
      key,
      organizationId: input.organizationId,
    });

    throw new ProductImageStorageError(
      "No se pudo almacenar la imagen del producto. Intenta de nuevo.",
      502,
    );
  }

  return {
    key,
    url: toPublicUrl(key),
    contentType: "image/webp",
    bytes: processed.bytes.byteLength,
    width: processed.width,
    height: processed.height,
  } satisfies ProductImageUploadResult;
}

export async function removeProductImageByUrl(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  const key = toStorageKey(url);

  if (!key) {
    return false;
  }

  try {
    await getProductImageClient().delete(key);
    return true;
  } catch (error) {
    console.error("No se pudo eliminar la imagen de producto en R2", error);
    return false;
  }
}
