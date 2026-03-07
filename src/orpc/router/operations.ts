import { and, asc, count, eq, like } from "drizzle-orm";

import { db } from "#/db";
import { organization } from "#/db/schema/auth.schema";
import {
  catalogCategories,
  catalogItems,
  catalogs,
  leadRequests,
  locations,
  reservationRequests,
  siteLinks,
  siteSections,
  sites,
} from "#/db/schema/main.schema";
import {
  ensurePermission,
  notFound,
  publicProcedure,
  withPermission,
} from "#/orpc/base";
import {
  createLeadRequestSchema,
  createLocationSchema,
  createReservationRequestSchema,
  idInputSchema,
  listLeadRequestsSchema,
  listReservationRequestsSchema,
  paginationSchema,
  publicCatalogLookupSchema,
  publicSiteLookupSchema,
  updateLeadRequestSchema,
  updateLocationSchema,
  updateReservationRequestSchema,
} from "#/orpc/schema";
import { asNullableText, resolveSlug } from "#/orpc/utils";

async function getLocationOrThrow(locationId: string, organizationId: string) {
  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, locationId), eq(locations.organizationId, organizationId)))
    .limit(1);

  if (!location) {
    notFound("No se encontró la sede solicitada.");
  }

  return location;
}

const readLocationProcedure = withPermission({ location: ["read"] });
const createLocationProcedure = withPermission({ location: ["create"] });
const updateLocationProcedure = withPermission({ location: ["update"] });
const deleteLocationProcedure = withPermission({ location: ["delete"] });

const readLeadProcedure = withPermission({ leadRequest: ["read"] });
const updateLeadProcedure = withPermission({ leadRequest: ["update"] });

const readReservationProcedure = withPermission({ reservationRequest: ["read"] });
const updateReservationProcedure = withPermission({ reservationRequest: ["update"] });

export const listLocations = readLocationProcedure
  .input(paginationSchema)
  .handler(async ({ input, context }) => {
    const conditions = [eq(locations.organizationId, context.activeOrganizationId)];

    if (input.search) {
      conditions.push(like(locations.name, `%${input.search}%`));
    }

    const items = await db
      .select()
      .from(locations)
      .where(and(...conditions))
      .orderBy(asc(locations.name))
      .limit(input.limit)
      .offset(input.offset);

    const [total] = await db
      .select({ value: count() })
      .from(locations)
      .where(and(...conditions));

    return { items, total: total?.value ?? 0 };
  });

export const createLocation = createLocationProcedure
  .input(createLocationSchema)
  .handler(async ({ input, context }) => {
    const slug = resolveSlug(input.slug, input.name);
    const [created] = await db
      .insert(locations)
      .values({
        organizationId: context.activeOrganizationId,
        name: input.name,
        slug,
        addressLine1: asNullableText(input.addressLine1),
        addressLine2: asNullableText(input.addressLine2),
        district: asNullableText(input.district),
        city: asNullableText(input.city),
        state: asNullableText(input.state),
        postalCode: asNullableText(input.postalCode),
        countryCode: input.countryCode.toUpperCase(),
        phone: asNullableText(input.phone),
        whatsappPhone: asNullableText(input.whatsappPhone),
        contactEmail: input.contactEmail ?? null,
        mapUrl: input.mapUrl ?? null,
        businessHours: input.businessHours ?? null,
        isPrimary: input.isPrimary,
        isActive: input.isActive,
      })
      .returning();

    return created;
  });

export const updateLocation = updateLocationProcedure
  .input(updateLocationSchema)
  .handler(async ({ input, context }) => {
    const current = await getLocationOrThrow(input.id, context.activeOrganizationId);
    const [updated] = await db
      .update(locations)
      .set({
        name: input.name ?? current.name,
        slug: input.slug ? resolveSlug(input.slug, input.name ?? current.name) : current.slug,
        addressLine1:
          input.addressLine1 === undefined
            ? current.addressLine1
            : asNullableText(input.addressLine1),
        addressLine2:
          input.addressLine2 === undefined
            ? current.addressLine2
            : asNullableText(input.addressLine2),
        district:
          input.district === undefined ? current.district : asNullableText(input.district),
        city: input.city === undefined ? current.city : asNullableText(input.city),
        state: input.state === undefined ? current.state : asNullableText(input.state),
        postalCode:
          input.postalCode === undefined
            ? current.postalCode
            : asNullableText(input.postalCode),
        countryCode: input.countryCode?.toUpperCase() ?? current.countryCode,
        phone: input.phone === undefined ? current.phone : asNullableText(input.phone),
        whatsappPhone:
          input.whatsappPhone === undefined
            ? current.whatsappPhone
            : asNullableText(input.whatsappPhone),
        contactEmail:
          input.contactEmail === undefined ? current.contactEmail : input.contactEmail ?? null,
        mapUrl: input.mapUrl === undefined ? current.mapUrl : input.mapUrl ?? null,
        businessHours:
          input.businessHours === undefined
            ? current.businessHours
            : input.businessHours ?? null,
        isPrimary: input.isPrimary ?? current.isPrimary,
        isActive: input.isActive ?? current.isActive,
      })
      .where(eq(locations.id, current.id))
      .returning();

    return updated;
  });

export const removeLocation = deleteLocationProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getLocationOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(locations)
      .where(eq(locations.id, input.id))
      .returning();

    return deleted;
  });

export const listLeadRequests = readLeadProcedure
  .input(listLeadRequestsSchema)
  .handler(async ({ input, context }) => {
    const conditions = [eq(leadRequests.organizationId, context.activeOrganizationId)];

    if (input.search) {
      conditions.push(like(leadRequests.name, `%${input.search}%`));
    }

    if (input.status) {
      conditions.push(eq(leadRequests.status, input.status));
    }

    if (input.siteId) {
      conditions.push(eq(leadRequests.siteId, input.siteId));
    }

    if (input.locationId) {
      conditions.push(eq(leadRequests.locationId, input.locationId));
    }

    const items = await db
      .select()
      .from(leadRequests)
      .where(and(...conditions))
      .orderBy(asc(leadRequests.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    const [total] = await db
      .select({ value: count() })
      .from(leadRequests)
      .where(and(...conditions));

    return { items, total: total?.value ?? 0 };
  });

export const updateLeadRequest = updateLeadProcedure
  .input(updateLeadRequestSchema)
  .handler(async ({ input, context }) => {
    const [current] = await db
      .select()
      .from(leadRequests)
      .where(
        and(
          eq(leadRequests.id, input.id),
          eq(leadRequests.organizationId, context.activeOrganizationId),
        ),
      )
      .limit(1);

    if (!current) {
      notFound("No se encontró el lead solicitado.");
    }

    const [updated] = await db
      .update(leadRequests)
      .set({ status: input.status ?? current.status })
      .where(eq(leadRequests.id, current.id))
      .returning();

    return updated;
  });

export const listReservationRequests = readReservationProcedure
  .input(listReservationRequestsSchema)
  .handler(async ({ input, context }) => {
    const conditions = [eq(reservationRequests.organizationId, context.activeOrganizationId)];

    if (input.search) {
      conditions.push(
        like(reservationRequests.customerName, `%${input.search}%`),
      );
    }

    if (input.status) {
      conditions.push(eq(reservationRequests.status, input.status));
    }

    if (input.siteId) {
      conditions.push(eq(reservationRequests.siteId, input.siteId));
    }

    if (input.locationId) {
      conditions.push(eq(reservationRequests.locationId, input.locationId));
    }

    const items = await db
      .select()
      .from(reservationRequests)
      .where(and(...conditions))
      .orderBy(asc(reservationRequests.requestedAt))
      .limit(input.limit)
      .offset(input.offset);

    const [total] = await db
      .select({ value: count() })
      .from(reservationRequests)
      .where(and(...conditions));

    return { items, total: total?.value ?? 0 };
  });

export const updateReservationRequest = updateReservationProcedure
  .input(updateReservationRequestSchema)
  .handler(async ({ input, context }) => {
    const [current] = await db
      .select()
      .from(reservationRequests)
      .where(
        and(
          eq(reservationRequests.id, input.id),
          eq(reservationRequests.organizationId, context.activeOrganizationId),
        ),
      )
      .limit(1);

    if (!current) {
      notFound("No se encontró la reservación solicitada.");
    }

    if (input.status === "confirmed") {
      ensurePermission(context.roles, { reservationRequest: ["confirm"] });
    }

    if (input.status === "cancelled") {
      ensurePermission(context.roles, { reservationRequest: ["cancel"] });
    }

    const [updated] = await db
      .update(reservationRequests)
      .set({
        status: input.status ?? current.status,
        notes: input.notes === undefined ? current.notes : asNullableText(input.notes),
      })
      .where(eq(reservationRequests.id, current.id))
      .returning();

    return updated;
  });

export const getPublicSite = publicProcedure
  .input(publicSiteLookupSchema)
  .handler(async ({ input }) => {
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.slug, input.slug), eq(sites.isPublic, true)))
      .limit(1);

    if (!site) {
      notFound("No se encontró un sitio público con ese slug.");
    }

    const sections = await db
      .select()
      .from(siteSections)
      .where(and(eq(siteSections.siteId, site.id), eq(siteSections.isVisible, true)))
      .orderBy(asc(siteSections.sortOrder));

    const links = await db
      .select()
      .from(siteLinks)
      .innerJoin(siteSections, eq(siteSections.id, siteLinks.siteSectionId))
      .where(
        and(
          eq(siteSections.siteId, site.id),
          eq(siteLinks.isActive, true),
          eq(siteSections.isVisible, true),
        ),
      )
      .orderBy(asc(siteLinks.sortOrder));

    return { site, sections, links };
  });

export const getPublicCatalog = publicProcedure
  .input(publicCatalogLookupSchema)
  .handler(async ({ input }) => {
    const [catalog] = await db
      .select({
        id: catalogs.id,
        organizationId: catalogs.organizationId,
        siteId: catalogs.siteId,
        locationId: catalogs.locationId,
        brandThemeId: catalogs.brandThemeId,
        name: catalogs.name,
        slug: catalogs.slug,
        description: catalogs.description,
        currencyCode: catalogs.currencyCode,
        status: catalogs.status,
        priceDisplayMode: catalogs.priceDisplayMode,
        coverImageUrl: catalogs.coverImageUrl,
        isPublic: catalogs.isPublic,
        settings: catalogs.settings,
        createdAt: catalogs.createdAt,
        updatedAt: catalogs.updatedAt,
      })
      .from(catalogs)
      .innerJoin(organization, eq(organization.id, catalogs.organizationId))
      .where(
        and(
          eq(organization.slug, input.organizationSlug),
          eq(catalogs.slug, input.catalogSlug),
          eq(catalogs.isPublic, true),
          eq(catalogs.status, "active"),
        ),
      )
      .limit(1);

    if (!catalog) {
      notFound("No se encontró un catálogo público con esos datos.");
    }

    const categories = await db
      .select()
      .from(catalogCategories)
      .where(and(eq(catalogCategories.catalogId, catalog.id), eq(catalogCategories.isVisible, true)))
      .orderBy(asc(catalogCategories.sortOrder));

    const items = await db
      .select()
      .from(catalogItems)
      .where(
        and(
          eq(catalogItems.catalogId, catalog.id),
          eq(catalogItems.status, "active"),
          eq(catalogItems.isAvailable, true),
        ),
      )
      .orderBy(asc(catalogItems.sortOrder));

    return { catalog, categories, items };
  });

export const createLeadRequest = publicProcedure
  .input(createLeadRequestSchema)
  .handler(async ({ input }) => {
    let organizationId: string | null = null;
    let siteId: string | null = input.siteId ?? null;
    let locationId: string | null = input.locationId ?? null;

    if (siteId) {
      const [site] = await db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
      if (!site || !site.isPublic) {
        notFound("No se encontró el sitio público indicado.");
      }
      organizationId = site.organizationId;
      locationId = locationId ?? site.locationId ?? null;
    }

    if (!organizationId && locationId) {
      const [location] = await db
        .select()
        .from(locations)
        .where(and(eq(locations.id, locationId), eq(locations.isActive, true)))
        .limit(1);

      if (!location) {
        notFound("No se encontró la sede indicada para el lead.");
      }

      organizationId = location.organizationId;
    }

    const resolvedOrganizationId: string =
      organizationId ?? notFound("No fue posible determinar la organización del lead.");

    const [created] = await db
      .insert(leadRequests)
      .values({
        organizationId: resolvedOrganizationId,
        siteId,
        locationId,
        source: input.source,
        name: input.name,
        email: input.email ?? null,
        phone: asNullableText(input.phone),
        companyName: asNullableText(input.companyName),
        preferredContactMethod: input.preferredContactMethod ?? null,
        message: asNullableText(input.message),
        context: input.context ?? null,
      })
      .returning();

    return created;
  });

export const createReservationRequest = publicProcedure
  .input(createReservationRequestSchema)
  .handler(async ({ input }) => {
    const [location] = await db
      .select()
      .from(locations)
      .where(and(eq(locations.id, input.locationId), eq(locations.isActive, true)))
      .limit(1);

    if (!location) {
      notFound("No se encontró una sede disponible para esta reservación.");
    }

    if (input.siteId) {
      const [site] = await db
        .select()
        .from(sites)
        .where(and(eq(sites.id, input.siteId), eq(sites.organizationId, location.organizationId)))
        .limit(1);

      if (!site) {
        notFound("El sitio indicado no pertenece a la sede seleccionada.");
      }
    }

    const [created] = await db
      .insert(reservationRequests)
      .values({
        organizationId: location.organizationId,
        siteId: input.siteId ?? null,
        locationId: location.id,
        source: input.source,
        status: "pending",
        customerName: input.customerName,
        customerEmail: input.customerEmail ?? null,
        customerPhone: asNullableText(input.customerPhone),
        partySize: input.partySize,
        requestedAt: input.requestedAt,
        notes: asNullableText(input.notes),
        metadata: input.metadata ?? null,
      })
      .returning();

    return created;
  });

export default {
  listLocations,
  createLocation,
  updateLocation,
  removeLocation,
  listLeadRequests,
  updateLeadRequest,
  listReservationRequests,
  updateReservationRequest,
  getPublicSite,
  getPublicCatalog,
  createLeadRequest,
  createReservationRequest,
};
