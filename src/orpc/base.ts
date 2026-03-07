import { ORPCError, os } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import { db } from "#/db";
import { member as memberTable } from "#/db/schema/auth.schema";
import { auth } from "#/lib/auth";
import type { organizationStatements } from "#/lib/organization-permissions";
import {
  organizationRoles,
  parseOrganizationRoles,
} from "#/lib/organization-permissions";

type SessionPayload = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthenticatedSession = NonNullable<SessionPayload>;
type OrganizationRoleKey = keyof typeof organizationRoles;
type OrganizationPermissionMap = Partial<{
  [K in keyof typeof organizationStatements]: Array<
    (typeof organizationStatements)[K][number]
  >;
}>;

const base = os
  .$config({
    initialInputValidationIndex: Number.NEGATIVE_INFINITY,
    initialOutputValidationIndex: Number.NEGATIVE_INFINITY,
  })
  .$context<{ headers: Headers }>();

const isOrganizationRoleKey = (value: string): value is OrganizationRoleKey =>
  value in organizationRoles;

export const toDefinedRoles = (roles: string[]) =>
  roles.filter(isOrganizationRoleKey);

export const ensurePermission = (
  roles: string[],
  permissions: OrganizationPermissionMap,
) => {
  const matched = toDefinedRoles(roles).some((role) => {
    const statements = organizationRoles[role].statements as Record<
      string,
      readonly string[] | undefined
    >;

    return Object.entries(permissions).every(([resource, actions]) => {
      if (!actions || actions.length === 0) {
        return true;
      }

      const allowedActions = statements[resource] ?? [];
      return actions.every((action) => allowedActions.includes(action));
    });
  });

  if (!matched) {
    throw new ORPCError("FORBIDDEN", {
      message: "No tienes permisos suficientes para realizar esta acción.",
    });
  }
};

export const authenticatedProcedure = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });

  if (!session?.session || !session.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Debes iniciar sesión para continuar.",
    });
  }

  return next({
    context: {
      session: session.session,
      user: session.user,
    },
  });
});

export const organizationProcedure = authenticatedProcedure.use(
  async ({ context, next }) => {
    const activeOrganizationId = context.session.activeOrganizationId;

    if (!activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay una organización activa seleccionada.",
      });
    }

    const [membership] = await db
      .select()
      .from(memberTable)
      .where(
        and(
          eq(memberTable.organizationId, activeOrganizationId),
          eq(memberTable.userId, context.user.id),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new ORPCError("FORBIDDEN", {
        message: "Tu sesión no pertenece a la organización activa.",
      });
    }

    const roles = toDefinedRoles(parseOrganizationRoles(membership.role));

    if (roles.length === 0) {
      throw new ORPCError("FORBIDDEN", {
        message: "Tu membresía no tiene roles válidos asignados.",
      });
    }

    return next({
      context: {
        activeOrganizationId,
        membership,
        roles,
      },
    });
  },
);

export const withPermission = (permissions: OrganizationPermissionMap) =>
  organizationProcedure.use(async ({ context, next }) => {
    ensurePermission(context.roles, permissions);
    return next();
  });

export const publicProcedure = base;

export const notFound = (message: string): never => {
  throw new ORPCError("NOT_FOUND", { message });
};

export const badRequest = (message: string): never => {
  throw new ORPCError("BAD_REQUEST", { message });
};

export const conflict = (message: string): never => {
  throw new ORPCError("CONFLICT", { message });
};

export type ORPCAuthenticatedContext = {
  session: AuthenticatedSession["session"];
  user: AuthenticatedSession["user"];
};

export type ORPCOrganizationContext = ORPCAuthenticatedContext & {
  activeOrganizationId: string;
  membership: typeof memberTable.$inferSelect;
  roles: OrganizationRoleKey[];
};
