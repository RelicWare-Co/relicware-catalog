import { and, count, eq } from "drizzle-orm";

import { db } from "#/db";
import { member as memberTable, organization } from "#/db/schema/auth.schema";
import {
  brandThemes,
  catalogs,
  leadRequests,
  locations,
  reservationRequests,
  sites,
} from "#/db/schema/main.schema";
import { authenticatedProcedure, notFound, organizationProcedure } from "#/orpc/base";

export const getSession = authenticatedProcedure.handler(async ({ context }) => {
  const activeOrganizationId = context.session.activeOrganizationId ?? null;

  if (!activeOrganizationId) {
    return {
      user: context.user,
      session: context.session,
      activeOrganization: null,
      membership: null,
    };
  }

  const [activeOrganization] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, activeOrganizationId))
    .limit(1);

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

  return {
    user: context.user,
    session: context.session,
    activeOrganization: activeOrganization ?? null,
    membership: membership ?? null,
  };
});

export const getDashboard = organizationProcedure.handler(async ({ context }) => {
  const [activeOrganization] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, context.activeOrganizationId))
    .limit(1);

  if (!activeOrganization) {
    notFound("No se encontró la organización activa.");
  }

  const [locationCount] = await db
    .select({ value: count() })
    .from(locations)
    .where(eq(locations.organizationId, context.activeOrganizationId));

  const [brandThemeCount] = await db
    .select({ value: count() })
    .from(brandThemes)
    .where(eq(brandThemes.organizationId, context.activeOrganizationId));

  const [siteCount] = await db
    .select({ value: count() })
    .from(sites)
    .where(eq(sites.organizationId, context.activeOrganizationId));

  const [catalogCount] = await db
    .select({ value: count() })
    .from(catalogs)
    .where(eq(catalogs.organizationId, context.activeOrganizationId));

  const [leadCount] = await db
    .select({ value: count() })
    .from(leadRequests)
    .where(eq(leadRequests.organizationId, context.activeOrganizationId));

  const [reservationCount] = await db
    .select({ value: count() })
    .from(reservationRequests)
    .where(eq(reservationRequests.organizationId, context.activeOrganizationId));

  return {
    organization: activeOrganization,
    membership: context.membership,
    roles: context.roles,
    metrics: {
      locations: locationCount?.value ?? 0,
      brandThemes: brandThemeCount?.value ?? 0,
      sites: siteCount?.value ?? 0,
      catalogs: catalogCount?.value ?? 0,
      leadRequests: leadCount?.value ?? 0,
      reservationRequests: reservationCount?.value ?? 0,
    },
  };
});

export default {
  getSession,
  getDashboard,
};
