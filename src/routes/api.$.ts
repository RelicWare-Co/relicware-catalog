import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";

import { db } from "#/db";
import { member as memberTable } from "#/db/schema/auth.schema";
import { auth } from "#/lib/auth";
import {
  organizationRoles,
  parseOrganizationRoles,
} from "#/lib/organization-permissions";
import {
  ProductImageStorageError,
  removeProductImageByUrl,
  uploadProductImage,
} from "#/lib/product-image-storage";
import router from "#/orpc/router";

type OrganizationRoleKey = keyof typeof organizationRoles;

const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "Relicware Catalog API",
          version: "1.0.0",
        },
        commonSchemas: {
          UndefinedError: { error: "UndefinedError" },
        },
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: "default-token",
            },
          },
        },
      },
    }),
  ],
});

function jsonResponse(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function isOrganizationRoleKey(value: string): value is OrganizationRoleKey {
  return value in organizationRoles;
}

function canManageProductImages(roles: OrganizationRoleKey[]) {
  return roles.some((role) => {
    const catalogItemPermissions = organizationRoles[role].statements.catalogItem;
    return (
      catalogItemPermissions?.includes("create") ||
      catalogItemPermissions?.includes("update") ||
      false
    );
  });
}

async function authorizeProductImageRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.session || !session.user) {
    return {
      response: jsonResponse(
        { message: "Debes iniciar sesión para continuar." },
        { status: 401 },
      ),
    };
  }

  const activeOrganizationId = session.session.activeOrganizationId;

  if (!activeOrganizationId) {
    return {
      response: jsonResponse(
        { message: "No hay una organización activa seleccionada." },
        { status: 400 },
      ),
    };
  }

  const [membership] = await db
    .select()
    .from(memberTable)
    .where(
      and(
        eq(memberTable.organizationId, activeOrganizationId),
        eq(memberTable.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!membership) {
    return {
      response: jsonResponse(
        { message: "Tu sesión no pertenece a la organización activa." },
        { status: 403 },
      ),
    };
  }

  const roles = parseOrganizationRoles(membership.role).filter(
    isOrganizationRoleKey,
  );

  if (!canManageProductImages(roles)) {
    return {
      response: jsonResponse(
        {
          message:
            "No tienes permisos para subir o eliminar imágenes de productos.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    activeOrganizationId,
    response: null,
  };
}

async function handleProductImages(request: Request) {
  const authorization = await authorizeProductImageRequest(request);

  if (authorization.response) {
    return authorization.response;
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonResponse(
        { message: "Debes enviar un archivo de imagen válido." },
        { status: 400 },
      );
    }

    const uploaded = await uploadProductImage({
      organizationId: authorization.activeOrganizationId,
      file,
    });

    return jsonResponse(uploaded, { status: 201 });
  }

  if (request.method === "DELETE") {
    const body = (await request.json().catch(() => null)) as
      | { url?: unknown }
      | null;

    if (!body || typeof body.url !== "string" || body.url.trim().length === 0) {
      return jsonResponse(
        { message: "Debes indicar la URL de la imagen a eliminar." },
        { status: 400 },
      );
    }

    await removeProductImageByUrl(body.url);

    return jsonResponse({ success: true });
  }

  return new Response(null, {
    status: 405,
    headers: {
      Allow: "POST, DELETE",
    },
  });
}

async function handle({ request }: { request: Request }) {
  const pathname = new URL(request.url).pathname;

  if (pathname === "/api/product-images") {
    try {
      return await handleProductImages(request);
    } catch (error) {
      if (error instanceof ProductImageStorageError) {
        return jsonResponse(
          { message: error.message },
          { status: error.status },
        );
      }

      console.error(error);

      return jsonResponse(
        { message: "No se pudo procesar la imagen del producto." },
        { status: 500 },
      );
    }
  }

  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers: request.headers,
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
