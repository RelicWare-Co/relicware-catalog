import { and, asc, count, eq, inArray, like, ne } from "drizzle-orm";

import { db } from "#/db";
import {
  brandThemes,
  locations,
  siteLinks,
  siteSections,
  sites,
} from "#/db/schema/main.schema";
import { notFound, withPermission } from "#/orpc/base";
import {
  createBrandThemeSchema,
  createSiteLinkSchema,
  createSiteSchema,
  createSiteSectionSchema,
  idInputSchema,
  paginationSchema,
  reorderSchema,
  siteStatusSchema,
  updateBrandThemeSchema,
  updateSiteLinkSchema,
  updateSiteSchema,
  updateSiteSectionSchema,
} from "#/orpc/schema";
import {
  asNullableText,
  resolveSlug,
  rethrowAsBusinessError,
} from "#/orpc/utils";

async function getSiteOrThrow(siteId: string, organizationId: string) {
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.organizationId, organizationId)))
    .limit(1);

  if (!site) {
    notFound("No se encontró el sitio solicitado.");
  }

  return site;
}

async function getThemeOrThrow(themeId: string, organizationId: string) {
  const [theme] = await db
    .select()
    .from(brandThemes)
    .where(
      and(
        eq(brandThemes.id, themeId),
        eq(brandThemes.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!theme) {
    notFound("No se encontró el tema de marca solicitado.");
  }

  return theme;
}

async function getLocationOrThrow(locationId: string, organizationId: string) {
  const [location] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!location) {
    notFound("No se encontró la sede solicitada.");
  }

  return location;
}

async function getSectionOrThrow(sectionId: string, organizationId: string) {
  const [section] = await db
    .select({
      id: siteSections.id,
      siteId: siteSections.siteId,
      type: siteSections.type,
      title: siteSections.title,
      subtitle: siteSections.subtitle,
      body: siteSections.body,
      content: siteSections.content,
      sortOrder: siteSections.sortOrder,
      isVisible: siteSections.isVisible,
      createdAt: siteSections.createdAt,
      updatedAt: siteSections.updatedAt,
    })
    .from(siteSections)
    .innerJoin(sites, eq(sites.id, siteSections.siteId))
    .where(
      and(
        eq(siteSections.id, sectionId),
        eq(sites.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!section) {
    notFound("No se encontró la sección solicitada.");
  }

  return section;
}

async function getLinkOrThrow(linkId: string, organizationId: string) {
  const [link] = await db
    .select({
      id: siteLinks.id,
      siteSectionId: siteLinks.siteSectionId,
      label: siteLinks.label,
      url: siteLinks.url,
      type: siteLinks.type,
      icon: siteLinks.icon,
      thumbnailUrl: siteLinks.thumbnailUrl,
      analyticsKey: siteLinks.analyticsKey,
      sortOrder: siteLinks.sortOrder,
      isHighlighted: siteLinks.isHighlighted,
      isActive: siteLinks.isActive,
      createdAt: siteLinks.createdAt,
      updatedAt: siteLinks.updatedAt,
    })
    .from(siteLinks)
    .innerJoin(siteSections, eq(siteSections.id, siteLinks.siteSectionId))
    .innerJoin(sites, eq(sites.id, siteSections.siteId))
    .where(
      and(eq(siteLinks.id, linkId), eq(sites.organizationId, organizationId)),
    )
    .limit(1);

  if (!link) {
    notFound("No se encontró el enlace solicitado.");
  }

  return link;
}

async function ensureSiteSlugAvailable(slug: string, excludeId?: string) {
  const conditions = [eq(sites.slug, slug)];

  if (excludeId) {
    conditions.push(ne(sites.id, excludeId));
  }

  const [existing] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    throw new Error("slug-conflict");
  }
}

async function ensureThemeNameAvailable(
  organizationId: string,
  name: string,
  excludeId?: string,
) {
  const conditions = [
    eq(brandThemes.organizationId, organizationId),
    eq(brandThemes.name, name),
  ];

  if (excludeId) {
    conditions.push(ne(brandThemes.id, excludeId));
  }

  const [existing] = await db
    .select({ id: brandThemes.id })
    .from(brandThemes)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    throw new Error("theme-conflict");
  }
}

async function reorderWithOffset(
  ids: string[],
  updater: (id: string, sortOrder: number) => Promise<unknown>,
) {
  for (let index = 0; index < ids.length; index += 1) {
    await updater(ids[index], 10_000 + index);
  }

  for (let index = 0; index < ids.length; index += 1) {
    await updater(ids[index], index);
  }
}

const readBrandProcedure = withPermission({ brandTheme: ["read"] });
const createBrandProcedure = withPermission({ brandTheme: ["create"] });
const updateBrandProcedure = withPermission({ brandTheme: ["update"] });
const deleteBrandProcedure = withPermission({ brandTheme: ["delete"] });

const readSiteProcedure = withPermission({ site: ["read"] });
const createSiteProcedure = withPermission({ site: ["create"] });
const updateSiteProcedure = withPermission({ site: ["update"] });
const deleteSiteProcedure = withPermission({ site: ["delete"] });
const publishSiteProcedure = withPermission({ site: ["publish"] });

const readSectionProcedure = withPermission({ siteSection: ["read"] });
const createSectionProcedure = withPermission({ siteSection: ["create"] });
const updateSectionProcedure = withPermission({ siteSection: ["update"] });
const deleteSectionProcedure = withPermission({ siteSection: ["delete"] });
const reorderSectionProcedure = withPermission({ siteSection: ["reorder"] });

const readLinkProcedure = withPermission({ siteLink: ["read"] });
const createLinkProcedure = withPermission({ siteLink: ["create"] });
const updateLinkProcedure = withPermission({ siteLink: ["update"] });
const deleteLinkProcedure = withPermission({ siteLink: ["delete"] });
const reorderLinkProcedure = withPermission({ siteLink: ["reorder"] });

export const listThemes = readBrandProcedure
  .input(paginationSchema)
  .handler(async ({ input, context }) => {
    const conditions = [
      eq(brandThemes.organizationId, context.activeOrganizationId),
    ];

    if (input.search) {
      conditions.push(like(brandThemes.name, `%${input.search}%`));
    }

    const items = await db
      .select()
      .from(brandThemes)
      .where(and(...conditions))
      .orderBy(asc(brandThemes.name))
      .limit(input.limit)
      .offset(input.offset);

    const [total] = await db
      .select({ value: count() })
      .from(brandThemes)
      .where(and(...conditions));

    return { items, total: total?.value ?? 0 };
  });

export const createTheme = createBrandProcedure
  .input(createBrandThemeSchema)
  .handler(async ({ input, context }) => {
    await ensureThemeNameAvailable(context.activeOrganizationId, input.name);

    try {
      const [created] = await db
        .insert(brandThemes)
        .values({
          organizationId: context.activeOrganizationId,
          name: input.name,
          preset: input.preset,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor ?? null,
          accentColor: input.accentColor ?? null,
          backgroundColor: input.backgroundColor,
          surfaceColor: input.surfaceColor ?? null,
          textColor: input.textColor,
          mutedTextColor: input.mutedTextColor ?? null,
          fontHeading: asNullableText(input.fontHeading),
          fontBody: asNullableText(input.fontBody),
          borderRadius: input.borderRadius,
          buttonStyle: input.buttonStyle,
          cardStyle: input.cardStyle,
          styleOverrides: input.styleOverrides ?? null,
          isDefault: input.isDefault,
        })
        .returning();

      return created;
    } catch (error) {
      rethrowAsBusinessError(error, "Ya existe un tema con ese nombre.");
    }
  });

export const updateTheme = updateBrandProcedure
  .input(updateBrandThemeSchema)
  .handler(async ({ input, context }) => {
    const current = await getThemeOrThrow(
      input.id,
      context.activeOrganizationId,
    );

    if (input.name) {
      await ensureThemeNameAvailable(
        context.activeOrganizationId,
        input.name,
        current.id,
      );
    }

    const [updated] = await db
      .update(brandThemes)
      .set({
        name: input.name ?? current.name,
        preset: input.preset ?? current.preset,
        primaryColor: input.primaryColor ?? current.primaryColor,
        secondaryColor:
          input.secondaryColor === undefined
            ? current.secondaryColor
            : (input.secondaryColor ?? null),
        accentColor:
          input.accentColor === undefined
            ? current.accentColor
            : (input.accentColor ?? null),
        backgroundColor: input.backgroundColor ?? current.backgroundColor,
        surfaceColor:
          input.surfaceColor === undefined
            ? current.surfaceColor
            : (input.surfaceColor ?? null),
        textColor: input.textColor ?? current.textColor,
        mutedTextColor:
          input.mutedTextColor === undefined
            ? current.mutedTextColor
            : (input.mutedTextColor ?? null),
        fontHeading:
          input.fontHeading === undefined
            ? current.fontHeading
            : asNullableText(input.fontHeading),
        fontBody:
          input.fontBody === undefined
            ? current.fontBody
            : asNullableText(input.fontBody),
        borderRadius: input.borderRadius ?? current.borderRadius,
        buttonStyle: input.buttonStyle ?? current.buttonStyle,
        cardStyle: input.cardStyle ?? current.cardStyle,
        styleOverrides:
          input.styleOverrides === undefined
            ? current.styleOverrides
            : (input.styleOverrides ?? null),
        isDefault: input.isDefault ?? current.isDefault,
      })
      .where(eq(brandThemes.id, current.id))
      .returning();

    return updated;
  });

export const removeTheme = deleteBrandProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getThemeOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(brandThemes)
      .where(eq(brandThemes.id, input.id))
      .returning();

    return deleted;
  });

export const list = readSiteProcedure
  .input(paginationSchema)
  .handler(async ({ input, context }) => {
    const conditions = [eq(sites.organizationId, context.activeOrganizationId)];

    if (input.search) {
      conditions.push(like(sites.name, `%${input.search}%`));
    }

    const items = await db
      .select()
      .from(sites)
      .where(and(...conditions))
      .orderBy(asc(sites.name))
      .limit(input.limit)
      .offset(input.offset);

    const [total] = await db
      .select({ value: count() })
      .from(sites)
      .where(and(...conditions));

    return { items, total: total?.value ?? 0 };
  });

export const getById = readSiteProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    const site = await getSiteOrThrow(input.id, context.activeOrganizationId);
    const sections = await db
      .select()
      .from(siteSections)
      .where(eq(siteSections.siteId, site.id))
      .orderBy(asc(siteSections.sortOrder), asc(siteSections.createdAt));

    const links = await db
      .select()
      .from(siteLinks)
      .innerJoin(siteSections, eq(siteSections.id, siteLinks.siteSectionId))
      .where(eq(siteSections.siteId, site.id))
      .orderBy(asc(siteLinks.sortOrder), asc(siteLinks.createdAt));

    return {
      site,
      sections,
      links,
    };
  });

export const create = createSiteProcedure
  .input(createSiteSchema)
  .handler(async ({ input, context }) => {
    if (input.locationId) {
      await getLocationOrThrow(input.locationId, context.activeOrganizationId);
    }

    if (input.brandThemeId) {
      await getThemeOrThrow(input.brandThemeId, context.activeOrganizationId);
    }

    const slug = resolveSlug(input.slug, input.name);
    await ensureSiteSlugAvailable(slug);

    try {
      const [created] = await db
        .insert(sites)
        .values({
          organizationId: context.activeOrganizationId,
          locationId: input.locationId ?? null,
          brandThemeId: input.brandThemeId ?? null,
          name: input.name,
          slug,
          type: input.type,
          status: input.status,
          subdomain: asNullableText(input.subdomain),
          customDomain: asNullableText(input.customDomain),
          headline: asNullableText(input.headline),
          subheadline: asNullableText(input.subheadline),
          description: asNullableText(input.description),
          logoUrl: input.logoUrl ?? null,
          heroImageUrl: input.heroImageUrl ?? null,
          coverImageUrl: input.coverImageUrl ?? null,
          primaryCtaLabel: asNullableText(input.primaryCtaLabel),
          primaryCtaUrl: input.primaryCtaUrl ?? null,
          seoTitle: asNullableText(input.seoTitle),
          seoDescription: asNullableText(input.seoDescription),
          socialLinks: input.socialLinks ?? null,
          settings: input.settings ?? null,
          isPublic: input.isPublic,
          publishedAt: input.status === "published" ? new Date() : null,
        })
        .returning();

      return created;
    } catch (error) {
      rethrowAsBusinessError(
        error,
        "No se pudo crear el sitio. Revisa slug o dominios.",
      );
    }
  });

export const update = updateSiteProcedure
  .input(updateSiteSchema)
  .handler(async ({ input, context }) => {
    const current = await getSiteOrThrow(
      input.id,
      context.activeOrganizationId,
    );

    if (input.locationId) {
      await getLocationOrThrow(input.locationId, context.activeOrganizationId);
    }

    if (input.brandThemeId) {
      await getThemeOrThrow(input.brandThemeId, context.activeOrganizationId);
    }

    const slug = input.slug
      ? resolveSlug(input.slug, input.name ?? current.name)
      : undefined;

    if (slug) {
      await ensureSiteSlugAvailable(slug, current.id);
    }

    try {
      const [updated] = await db
        .update(sites)
        .set({
          locationId:
            input.locationId === undefined
              ? current.locationId
              : (input.locationId ?? null),
          brandThemeId:
            input.brandThemeId === undefined
              ? current.brandThemeId
              : (input.brandThemeId ?? null),
          name: input.name ?? current.name,
          slug: slug ?? current.slug,
          type: input.type ?? current.type,
          status: input.status ?? current.status,
          subdomain:
            input.subdomain === undefined
              ? current.subdomain
              : asNullableText(input.subdomain),
          customDomain:
            input.customDomain === undefined
              ? current.customDomain
              : asNullableText(input.customDomain),
          headline:
            input.headline === undefined
              ? current.headline
              : asNullableText(input.headline),
          subheadline:
            input.subheadline === undefined
              ? current.subheadline
              : asNullableText(input.subheadline),
          description:
            input.description === undefined
              ? current.description
              : asNullableText(input.description),
          logoUrl:
            input.logoUrl === undefined
              ? current.logoUrl
              : (input.logoUrl ?? null),
          heroImageUrl:
            input.heroImageUrl === undefined
              ? current.heroImageUrl
              : (input.heroImageUrl ?? null),
          coverImageUrl:
            input.coverImageUrl === undefined
              ? current.coverImageUrl
              : (input.coverImageUrl ?? null),
          primaryCtaLabel:
            input.primaryCtaLabel === undefined
              ? current.primaryCtaLabel
              : asNullableText(input.primaryCtaLabel),
          primaryCtaUrl:
            input.primaryCtaUrl === undefined
              ? current.primaryCtaUrl
              : (input.primaryCtaUrl ?? null),
          seoTitle:
            input.seoTitle === undefined
              ? current.seoTitle
              : asNullableText(input.seoTitle),
          seoDescription:
            input.seoDescription === undefined
              ? current.seoDescription
              : asNullableText(input.seoDescription),
          socialLinks:
            input.socialLinks === undefined
              ? current.socialLinks
              : (input.socialLinks ?? null),
          settings:
            input.settings === undefined
              ? current.settings
              : (input.settings ?? null),
          isPublic: input.isPublic ?? current.isPublic,
        })
        .where(eq(sites.id, current.id))
        .returning();

      return updated;
    } catch (error) {
      rethrowAsBusinessError(
        error,
        "No se pudo actualizar el sitio. Revisa slug o dominios.",
      );
    }
  });

export const setStatus = publishSiteProcedure
  .input(siteStatusSchema)
  .handler(async ({ input, context }) => {
    const current = await getSiteOrThrow(
      input.id,
      context.activeOrganizationId,
    );
    const [updated] = await db
      .update(sites)
      .set({
        status: input.status,
        publishedAt:
          input.status === "published"
            ? (current.publishedAt ?? new Date())
            : input.status === "draft"
              ? null
              : current.publishedAt,
      })
      .where(eq(sites.id, input.id))
      .returning();

    return updated;
  });

export const remove = deleteSiteProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getSiteOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(sites)
      .where(eq(sites.id, input.id))
      .returning();
    return deleted;
  });

export const listSections = readSectionProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getSiteOrThrow(input.id, context.activeOrganizationId);
    return db
      .select()
      .from(siteSections)
      .where(eq(siteSections.siteId, input.id))
      .orderBy(asc(siteSections.sortOrder), asc(siteSections.createdAt));
  });

export const createSection = createSectionProcedure
  .input(createSiteSectionSchema)
  .handler(async ({ input, context }) => {
    await getSiteOrThrow(input.siteId, context.activeOrganizationId);
    const [created] = await db
      .insert(siteSections)
      .values({
        siteId: input.siteId,
        type: input.type,
        title: asNullableText(input.title),
        subtitle: asNullableText(input.subtitle),
        body: asNullableText(input.body),
        content: input.content ?? null,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible,
      })
      .returning();

    return created;
  });

export const updateSection = updateSectionProcedure
  .input(updateSiteSectionSchema)
  .handler(async ({ input, context }) => {
    const current = await getSectionOrThrow(
      input.id,
      context.activeOrganizationId,
    );

    if (input.siteId) {
      await getSiteOrThrow(input.siteId, context.activeOrganizationId);
    }

    const [updated] = await db
      .update(siteSections)
      .set({
        siteId: input.siteId ?? current.siteId,
        type: input.type ?? current.type,
        title:
          input.title === undefined
            ? current.title
            : asNullableText(input.title),
        subtitle:
          input.subtitle === undefined
            ? current.subtitle
            : asNullableText(input.subtitle),
        body:
          input.body === undefined ? current.body : asNullableText(input.body),
        content:
          input.content === undefined
            ? current.content
            : (input.content ?? null),
        sortOrder: input.sortOrder ?? current.sortOrder,
        isVisible: input.isVisible ?? current.isVisible,
      })
      .where(eq(siteSections.id, current.id))
      .returning();

    return updated;
  });

export const reorderSections = reorderSectionProcedure
  .input(reorderSchema)
  .handler(async ({ input, context }) => {
    const items = await db
      .select({ id: siteSections.id })
      .from(siteSections)
      .innerJoin(sites, eq(sites.id, siteSections.siteId))
      .where(
        and(
          inArray(siteSections.id, input.ids),
          eq(sites.organizationId, context.activeOrganizationId),
        ),
      );

    if (items.length !== input.ids.length) {
      notFound("Una o más secciones no pertenecen a la organización activa.");
    }

    await reorderWithOffset(input.ids, (id, sortOrder) =>
      db.update(siteSections).set({ sortOrder }).where(eq(siteSections.id, id)),
    );

    return { success: true };
  });

export const removeSection = deleteSectionProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getSectionOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(siteSections)
      .where(eq(siteSections.id, input.id))
      .returning();

    return deleted;
  });

export const listLinks = readLinkProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getSectionOrThrow(input.id, context.activeOrganizationId);
    return db
      .select()
      .from(siteLinks)
      .where(eq(siteLinks.siteSectionId, input.id))
      .orderBy(asc(siteLinks.sortOrder), asc(siteLinks.createdAt));
  });

export const createLink = createLinkProcedure
  .input(createSiteLinkSchema)
  .handler(async ({ input, context }) => {
    await getSectionOrThrow(input.siteSectionId, context.activeOrganizationId);
    const [created] = await db
      .insert(siteLinks)
      .values({
        siteSectionId: input.siteSectionId,
        label: input.label,
        url: input.url,
        type: input.type,
        icon: asNullableText(input.icon),
        thumbnailUrl: input.thumbnailUrl ?? null,
        analyticsKey: asNullableText(input.analyticsKey),
        sortOrder: input.sortOrder ?? 0,
        isHighlighted: input.isHighlighted,
        isActive: input.isActive,
      })
      .returning();

    return created;
  });

export const updateLink = updateLinkProcedure
  .input(updateSiteLinkSchema)
  .handler(async ({ input, context }) => {
    const current = await getLinkOrThrow(
      input.id,
      context.activeOrganizationId,
    );

    if (input.siteSectionId) {
      await getSectionOrThrow(
        input.siteSectionId,
        context.activeOrganizationId,
      );
    }

    const [updated] = await db
      .update(siteLinks)
      .set({
        siteSectionId: input.siteSectionId ?? current.siteSectionId,
        label: input.label ?? current.label,
        url: input.url ?? current.url,
        type: input.type ?? current.type,
        icon:
          input.icon === undefined ? current.icon : asNullableText(input.icon),
        thumbnailUrl:
          input.thumbnailUrl === undefined
            ? current.thumbnailUrl
            : (input.thumbnailUrl ?? null),
        analyticsKey:
          input.analyticsKey === undefined
            ? current.analyticsKey
            : asNullableText(input.analyticsKey),
        sortOrder: input.sortOrder ?? current.sortOrder,
        isHighlighted: input.isHighlighted ?? current.isHighlighted,
        isActive: input.isActive ?? current.isActive,
      })
      .where(eq(siteLinks.id, current.id))
      .returning();

    return updated;
  });

export const reorderLinks = reorderLinkProcedure
  .input(reorderSchema)
  .handler(async ({ input, context }) => {
    const items = await db
      .select({ id: siteLinks.id })
      .from(siteLinks)
      .innerJoin(siteSections, eq(siteSections.id, siteLinks.siteSectionId))
      .innerJoin(sites, eq(sites.id, siteSections.siteId))
      .where(
        and(
          inArray(siteLinks.id, input.ids),
          eq(sites.organizationId, context.activeOrganizationId),
        ),
      );

    if (items.length !== input.ids.length) {
      notFound("Uno o más enlaces no pertenecen a la organización activa.");
    }

    await reorderWithOffset(input.ids, (id, sortOrder) =>
      db.update(siteLinks).set({ sortOrder }).where(eq(siteLinks.id, id)),
    );

    return { success: true };
  });

export const removeLink = deleteLinkProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getLinkOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(siteLinks)
      .where(eq(siteLinks.id, input.id))
      .returning();
    return deleted;
  });

export default {
  listThemes,
  createTheme,
  updateTheme,
  removeTheme,
  list,
  getById,
  create,
  update,
  setStatus,
  remove,
  listSections,
  createSection,
  updateSection,
  reorderSections,
  removeSection,
  listLinks,
  createLink,
  updateLink,
  reorderLinks,
  removeLink,
};
