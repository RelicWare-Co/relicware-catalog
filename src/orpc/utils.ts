import { ORPCError } from "@orpc/server";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function resolveSlug(value: string | null | undefined, fallback: string) {
  const candidate = slugify(value?.trim() || fallback);

  if (!candidate) {
    throw new ORPCError("BAD_REQUEST", {
      message: "No se pudo generar un slug válido para este registro.",
    });
  }

  return candidate;
}

export function asNullableText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function asNullableArray<T>(value: T[] | null | undefined) {
  return value && value.length > 0 ? value : null;
}

export function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("UNIQUE constraint failed") ||
      error.message.includes("SQLITE_CONSTRAINT_UNIQUE") ||
      error.message.includes("SQLITE_CONSTRAINT"))
  );
}

export function rethrowAsBusinessError(error: unknown, message: string): never {
  if (isUniqueConstraintError(error)) {
    throw new ORPCError("BAD_REQUEST", { message });
  }

  throw error;
}
