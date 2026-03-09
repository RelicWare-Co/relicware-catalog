import { and, asc, count, eq, inArray, like, ne } from "drizzle-orm";

import { db } from "#/db";
import {
  brandThemes,
  catalogCategories,
  catalogItems,
  catalogItemVariants,
  catalogs,
  locations,
  sites,
} from "#/db/schema/main.schema";
import { removeProductImageByUrl } from "#/lib/product-image-storage";
import { ensurePermission, notFound, withPermission } from "#/orpc/base";
import {
  catalogStatusSchema,
  createCatalogSchema,
  createCategorySchema,
  createItemSchema,
  createVariantSchema,
  idInputSchema,
  paginationSchema,
  reorderSchema,
  updateCatalogSchema,
  updateCategorySchema,
  updateItemSchema,
  updateVariantSchema,
} from "#/orpc/schema";
import {
  asNullableArray,
  asNullableText,
  resolveSlug,
  rethrowAsBusinessError,
} from "#/orpc/utils";

async function getCatalogOrThrow(catalogId: string, organizationId: string) {
  const [catalog] = await db
    .select()
    .from(catalogs)
    .where(
      and(
        eq(catalogs.id, catalogId),
        eq(catalogs.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!catalog) {
    notFound("No se encontró el catálogo solicitado.");
  }

  return catalog;
}

async function getSiteOrThrow(siteId: string, organizationId: string) {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.organizationId, organizationId)))
    .limit(1);

  if (!site) {
    notFound("No se encontró el sitio indicado para el catálogo.");
  }

  return site;
}

async function getLocationOrThrow(locationId: string, organizationId: string) {
  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!location) {
    notFound("No se encontró la sede indicada para el catálogo.");
  }

  return location;
}

async function getBrandThemeOrThrow(
  brandThemeId: string,
  organizationId: string,
) {
  const [brandTheme] = await db
    .select({ id: brandThemes.id })
    .from(brandThemes)
    .where(
      and(
        eq(brandThemes.id, brandThemeId),
        eq(brandThemes.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!brandTheme) {
    notFound("No se encontró el tema de marca indicado para el catálogo.");
  }

  return brandTheme;
}

async function ensureCatalogSlugAvailable(
  organizationId: string,
  slug: string,
  excludeId?: string,
) {
  const conditions = [
    eq(catalogs.organizationId, organizationId),
    eq(catalogs.slug, slug),
  ];

  if (excludeId) {
    conditions.push(ne(catalogs.id, excludeId));
  }

  const [existing] = await db
    .select({ id: catalogs.id })
    .from(catalogs)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    throw new Error("slug-conflict");
  }
}

async function getCategoryOrThrow(categoryId: string, organizationId: string) {
  const [category] = await db
    .select({
      id: catalogCategories.id,
      catalogId: catalogCategories.catalogId,
      parentCategoryId: catalogCategories.parentCategoryId,
      name: catalogCategories.name,
      slug: catalogCategories.slug,
      description: catalogCategories.description,
      imageUrl: catalogCategories.imageUrl,
      sortOrder: catalogCategories.sortOrder,
      isVisible: catalogCategories.isVisible,
      createdAt: catalogCategories.createdAt,
      updatedAt: catalogCategories.updatedAt,
    })
    .from(catalogCategories)
    .innerJoin(catalogs, eq(catalogs.id, catalogCategories.catalogId))
    .where(
      and(
        eq(catalogCategories.id, categoryId),
        eq(catalogs.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!category) {
    notFound("No se encontró la categoría solicitada.");
  }

  return category;
}

async function getItemOrThrow(itemId: string, organizationId: string) {
  const [item] = await db
    .select({
      id: catalogItems.id,
      catalogId: catalogItems.catalogId,
      categoryId: catalogItems.categoryId,
      name: catalogItems.name,
      slug: catalogItems.slug,
      sku: catalogItems.sku,
      shortDescription: catalogItems.shortDescription,
      description: catalogItems.description,
      imageUrl: catalogItems.imageUrl,
      gallery: catalogItems.gallery,
      status: catalogItems.status,
      basePriceAmount: catalogItems.basePriceAmount,
      compareAtPriceAmount: catalogItems.compareAtPriceAmount,
      inventoryQuantity: catalogItems.inventoryQuantity,
      hasVariants: catalogItems.hasVariants,
      trackInventory: catalogItems.trackInventory,
      isFeatured: catalogItems.isFeatured,
      isAvailable: catalogItems.isAvailable,
      tags: catalogItems.tags,
      sortOrder: catalogItems.sortOrder,
      createdAt: catalogItems.createdAt,
      updatedAt: catalogItems.updatedAt,
    })
    .from(catalogItems)
    .innerJoin(catalogs, eq(catalogs.id, catalogItems.catalogId))
    .where(
      and(
        eq(catalogItems.id, itemId),
        eq(catalogs.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!item) {
    notFound("No se encontró el producto solicitado.");
  }

  return item;
}

async function getVariantOrThrow(variantId: string, organizationId: string) {
  const [variant] = await db
    .select({
      id: catalogItemVariants.id,
      catalogItemId: catalogItemVariants.catalogItemId,
      name: catalogItemVariants.name,
      sku: catalogItemVariants.sku,
      optionValues: catalogItemVariants.optionValues,
      priceAmount: catalogItemVariants.priceAmount,
      compareAtPriceAmount: catalogItemVariants.compareAtPriceAmount,
      inventoryQuantity: catalogItemVariants.inventoryQuantity,
      isDefault: catalogItemVariants.isDefault,
      isAvailable: catalogItemVariants.isAvailable,
      sortOrder: catalogItemVariants.sortOrder,
      createdAt: catalogItemVariants.createdAt,
      updatedAt: catalogItemVariants.updatedAt,
    })
    .from(catalogItemVariants)
    .innerJoin(
      catalogItems,
      eq(catalogItems.id, catalogItemVariants.catalogItemId),
    )
    .innerJoin(catalogs, eq(catalogs.id, catalogItems.catalogId))
    .where(
      and(
        eq(catalogItemVariants.id, variantId),
        eq(catalogs.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!variant) {
    notFound("No se encontró la variante solicitada.");
  }

  return variant;
}

async function ensureCategoryBelongsToCatalog(
  categoryId: string | null | undefined,
  catalogId: string,
  organizationId: string,
) {
  if (!categoryId) {
    return null;
  }

  const category = await getCategoryOrThrow(categoryId, organizationId);

  if (category.catalogId !== catalogId) {
    notFound("La categoría indicada no pertenece al catálogo seleccionado.");
  }

  return category;
}

async function ensureCategorySlugAvailable(
  catalogId: string,
  slug: string,
  excludeId?: string,
) {
  const conditions = [
    eq(catalogCategories.catalogId, catalogId),
    eq(catalogCategories.slug, slug),
  ];

  if (excludeId) {
    conditions.push(ne(catalogCategories.id, excludeId));
  }

  const [existing] = await db
    .select({ id: catalogCategories.id })
    .from(catalogCategories)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    throw new Error("slug-conflict");
  }
}

async function ensureItemSlugAvailable(
  catalogId: string,
  slug: string,
  excludeId?: string,
) {
  const conditions = [
    eq(catalogItems.catalogId, catalogId),
    eq(catalogItems.slug, slug),
  ];

  if (excludeId) {
    conditions.push(ne(catalogItems.id, excludeId));
  }

  const [existing] = await db
    .select({ id: catalogItems.id })
    .from(catalogItems)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    throw new Error("slug-conflict");
  }
}

async function reorderWithOffset<TId extends string>(
  entries: TId[],
  updater: (id: TId, sortOrder: number) => Promise<unknown>,
) {
  for (let index = 0; index < entries.length; index += 1) {
    await updater(entries[index], 10_000 + index);
  }

  for (let index = 0; index < entries.length; index += 1) {
    await updater(entries[index], index);
  }
}

const readCatalogProcedure = withPermission({ catalog: ["read"] });
const createCatalogProcedure = withPermission({ catalog: ["create"] });
const updateCatalogProcedure = withPermission({ catalog: ["update"] });
const deleteCatalogProcedure = withPermission({ catalog: ["delete"] });
const publishCatalogProcedure = withPermission({ catalog: ["publish"] });

const readCategoryProcedure = withPermission({ catalogCategory: ["read"] });
const createCategoryProcedure = withPermission({ catalogCategory: ["create"] });
const updateCategoryProcedure = withPermission({ catalogCategory: ["update"] });
const deleteCategoryProcedure = withPermission({ catalogCategory: ["delete"] });
const reorderCategoryProcedure = withPermission({
  catalogCategory: ["reorder"],
});

const readItemProcedure = withPermission({ catalogItem: ["read"] });
const createItemProcedure = withPermission({ catalogItem: ["create"] });
const updateItemProcedure = withPermission({ catalogItem: ["update"] });
const deleteItemProcedure = withPermission({ catalogItem: ["delete"] });
const reorderItemProcedure = withPermission({ catalogItem: ["reorder"] });

const readVariantProcedure = withPermission({ catalogItemVariant: ["read"] });
const createVariantProcedure = withPermission({
  catalogItemVariant: ["create"],
});
const updateVariantProcedure = withPermission({
  catalogItemVariant: ["update"],
});
const deleteVariantProcedure = withPermission({
  catalogItemVariant: ["delete"],
});

export const list = readCatalogProcedure
  .input(paginationSchema)
  .handler(async ({ input, context }) => {
    const conditions = [
      eq(catalogs.organizationId, context.activeOrganizationId),
    ];

    if (input.search) {
      conditions.push(like(catalogs.name, `%${input.search}%`));
    }

    const items = await db
      .select()
      .from(catalogs)
      .where(and(...conditions))
      .orderBy(asc(catalogs.name))
      .limit(input.limit)
      .offset(input.offset);

    const [total] = await db
      .select({ value: count() })
      .from(catalogs)
      .where(and(...conditions));

    return {
      items,
      total: total?.value ?? 0,
    };
  });

export const getById = readCatalogProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    const catalog = await getCatalogOrThrow(
      input.id,
      context.activeOrganizationId,
    );
    const categories = await db
      .select()
      .from(catalogCategories)
      .where(eq(catalogCategories.catalogId, catalog.id))
      .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name));

    const items = await db
      .select()
      .from(catalogItems)
      .where(eq(catalogItems.catalogId, catalog.id))
      .orderBy(asc(catalogItems.sortOrder), asc(catalogItems.name));

    return {
      catalog,
      categories,
      items,
    };
  });

export const create = createCatalogProcedure
  .input(createCatalogSchema)
  .handler(async ({ input, context }) => {
    if (input.siteId) {
      await getSiteOrThrow(input.siteId, context.activeOrganizationId);
    }

    if (input.locationId) {
      await getLocationOrThrow(input.locationId, context.activeOrganizationId);
    }

    if (input.brandThemeId) {
      await getBrandThemeOrThrow(
        input.brandThemeId,
        context.activeOrganizationId,
      );
    }

    const slug = resolveSlug(input.slug, input.name);
    await ensureCatalogSlugAvailable(context.activeOrganizationId, slug);

    try {
      const [created] = await db
        .insert(catalogs)
        .values({
          organizationId: context.activeOrganizationId,
          siteId: input.siteId ?? null,
          locationId: input.locationId ?? null,
          brandThemeId: input.brandThemeId ?? null,
          name: input.name,
          slug,
          description: asNullableText(input.description),
          currencyCode: input.currencyCode.toUpperCase(),
          status: input.status,
          priceDisplayMode: input.priceDisplayMode,
          coverImageUrl: input.coverImageUrl ?? null,
          isPublic: input.isPublic,
          settings: input.settings ?? null,
        })
        .returning();

      return created;
    } catch (error) {
      rethrowAsBusinessError(error, "Ya existe un catálogo con ese slug.");
    }
  });

export const update = updateCatalogProcedure
  .input(updateCatalogSchema)
  .handler(async ({ input, context }) => {
    const current = await getCatalogOrThrow(
      input.id,
      context.activeOrganizationId,
    );

    if (input.siteId) {
      await getSiteOrThrow(input.siteId, context.activeOrganizationId);
    }

    if (input.locationId) {
      await getLocationOrThrow(input.locationId, context.activeOrganizationId);
    }

    if (input.brandThemeId) {
      await getBrandThemeOrThrow(
        input.brandThemeId,
        context.activeOrganizationId,
      );
    }

    const slug = input.slug ? resolveSlug(input.slug, current.name) : undefined;

    if (slug) {
      await ensureCatalogSlugAvailable(
        context.activeOrganizationId,
        slug,
        current.id,
      );
    }

    try {
      const [updated] = await db
        .update(catalogs)
        .set({
          siteId:
            input.siteId === undefined
              ? current.siteId
              : (input.siteId ?? null),
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
          description:
            input.description === undefined
              ? current.description
              : asNullableText(input.description),
          currencyCode:
            input.currencyCode?.toUpperCase() ?? current.currencyCode,
          status: input.status ?? current.status,
          priceDisplayMode: input.priceDisplayMode ?? current.priceDisplayMode,
          coverImageUrl:
            input.coverImageUrl === undefined
              ? current.coverImageUrl
              : (input.coverImageUrl ?? null),
          isPublic: input.isPublic ?? current.isPublic,
          settings:
            input.settings === undefined
              ? current.settings
              : (input.settings ?? null),
        })
        .where(eq(catalogs.id, current.id))
        .returning();

      return updated;
    } catch (error) {
      rethrowAsBusinessError(error, "No se pudo actualizar el catálogo.");
    }
  });

export const setStatus = publishCatalogProcedure
  .input(catalogStatusSchema)
  .handler(async ({ input, context }) => {
    await getCatalogOrThrow(input.id, context.activeOrganizationId);

    const [updated] = await db
      .update(catalogs)
      .set({ status: input.status })
      .where(eq(catalogs.id, input.id))
      .returning();

    return updated;
  });

export const remove = deleteCatalogProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getCatalogOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(catalogs)
      .where(eq(catalogs.id, input.id))
      .returning();

    return deleted;
  });

export const listCategories = readCategoryProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getCatalogOrThrow(input.id, context.activeOrganizationId);
    return db
      .select()
      .from(catalogCategories)
      .where(eq(catalogCategories.catalogId, input.id))
      .orderBy(asc(catalogCategories.sortOrder), asc(catalogCategories.name));
  });

export const createCategory = createCategoryProcedure
  .input(createCategorySchema)
  .handler(async ({ input, context }) => {
    await getCatalogOrThrow(input.catalogId, context.activeOrganizationId);

    if (input.parentCategoryId) {
      await ensureCategoryBelongsToCatalog(
        input.parentCategoryId,
        input.catalogId,
        context.activeOrganizationId,
      );
    }

    const slug = resolveSlug(input.slug, input.name);
    await ensureCategorySlugAvailable(input.catalogId, slug);

    try {
      const [created] = await db
        .insert(catalogCategories)
        .values({
          catalogId: input.catalogId,
          parentCategoryId: input.parentCategoryId ?? null,
          name: input.name,
          slug,
          description: asNullableText(input.description),
          imageUrl: input.imageUrl ?? null,
          sortOrder: input.sortOrder ?? 0,
          isVisible: input.isVisible,
        })
        .returning();

      return created;
    } catch (error) {
      rethrowAsBusinessError(error, "Ya existe una categoría con ese slug.");
    }
  });

export const updateCategory = updateCategoryProcedure
  .input(updateCategorySchema)
  .handler(async ({ input, context }) => {
    const current = await getCategoryOrThrow(
      input.id,
      context.activeOrganizationId,
    );
    const nextCatalogId = input.catalogId ?? current.catalogId;
    await getCatalogOrThrow(nextCatalogId, context.activeOrganizationId);

    const nextParentCategoryId =
      input.parentCategoryId === undefined
        ? current.parentCategoryId
        : (input.parentCategoryId ?? null);

    if (nextParentCategoryId) {
      await ensureCategoryBelongsToCatalog(
        nextParentCategoryId,
        nextCatalogId,
        context.activeOrganizationId,
      );
    }

    const slug = input.slug
      ? resolveSlug(input.slug, input.name ?? current.name)
      : undefined;

    if (slug) {
      await ensureCategorySlugAvailable(nextCatalogId, slug, current.id);
    }

    const [updated] = await db
      .update(catalogCategories)
      .set({
        catalogId: nextCatalogId,
        parentCategoryId:
          input.parentCategoryId === undefined
            ? current.parentCategoryId
            : (input.parentCategoryId ?? null),
        name: input.name ?? current.name,
        slug: slug ?? current.slug,
        description:
          input.description === undefined
            ? current.description
            : asNullableText(input.description),
        imageUrl:
          input.imageUrl === undefined
            ? current.imageUrl
            : (input.imageUrl ?? null),
        sortOrder: input.sortOrder ?? current.sortOrder,
        isVisible: input.isVisible ?? current.isVisible,
      })
      .where(eq(catalogCategories.id, current.id))
      .returning();

    return updated;
  });

export const reorderCategories = reorderCategoryProcedure
  .input(reorderSchema)
  .handler(async ({ input, context }) => {
    const categories = await db
      .select({ id: catalogCategories.id })
      .from(catalogCategories)
      .innerJoin(catalogs, eq(catalogs.id, catalogCategories.catalogId))
      .where(
        and(
          inArray(catalogCategories.id, input.ids),
          eq(catalogs.organizationId, context.activeOrganizationId),
        ),
      );

    if (categories.length !== input.ids.length) {
      notFound("Una o más categorías no pertenecen a la organización activa.");
    }

    await reorderWithOffset(input.ids, (id, sortOrder) =>
      db
        .update(catalogCategories)
        .set({ sortOrder })
        .where(eq(catalogCategories.id, id)),
    );

    return { success: true };
  });

export const removeCategory = deleteCategoryProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getCategoryOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(catalogCategories)
      .where(eq(catalogCategories.id, input.id))
      .returning();

    return deleted;
  });

export const listItems = readItemProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getCatalogOrThrow(input.id, context.activeOrganizationId);
    return db
      .select()
      .from(catalogItems)
      .where(eq(catalogItems.catalogId, input.id))
      .orderBy(asc(catalogItems.sortOrder), asc(catalogItems.name));
  });

export const getItem = readItemProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    const item = await getItemOrThrow(input.id, context.activeOrganizationId);
    const variants = await db
      .select()
      .from(catalogItemVariants)
      .where(eq(catalogItemVariants.catalogItemId, item.id))
      .orderBy(
        asc(catalogItemVariants.sortOrder),
        asc(catalogItemVariants.name),
      );

    return {
      item,
      variants,
    };
  });

export const createItem = createItemProcedure
  .input(createItemSchema)
  .handler(async ({ input, context }) => {
    await getCatalogOrThrow(input.catalogId, context.activeOrganizationId);
    await ensureCategoryBelongsToCatalog(
      input.categoryId,
      input.catalogId,
      context.activeOrganizationId,
    );

    ensurePermission(context.roles, {
      catalogItem: ["create"],
      ...(input.basePriceAmount !== undefined ||
      input.compareAtPriceAmount !== undefined
        ? { catalogItem: ["create", "pricing"] }
        : {}),
      ...(input.inventoryQuantity !== undefined
        ? { catalogItem: ["create", "inventory"] }
        : {}),
    });

    const slug = resolveSlug(input.slug, input.name);
    await ensureItemSlugAvailable(input.catalogId, slug);

    try {
      const [created] = await db
        .insert(catalogItems)
        .values({
          catalogId: input.catalogId,
          categoryId: input.categoryId ?? null,
          name: input.name,
          slug,
          sku: asNullableText(input.sku),
          shortDescription: asNullableText(input.shortDescription),
          description: asNullableText(input.description),
          imageUrl: input.imageUrl ?? null,
          gallery: asNullableArray(input.gallery),
          status: input.status,
          basePriceAmount: input.basePriceAmount ?? null,
          compareAtPriceAmount: input.compareAtPriceAmount ?? null,
          inventoryQuantity: input.inventoryQuantity ?? null,
          hasVariants: input.hasVariants,
          trackInventory: input.trackInventory,
          isFeatured: input.isFeatured,
          isAvailable: input.isAvailable,
          tags: asNullableArray(input.tags),
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();

      return created;
    } catch (error) {
      rethrowAsBusinessError(error, "Ya existe un producto con ese slug.");
    }
  });

export const updateItem = updateItemProcedure
  .input(updateItemSchema)
  .handler(async ({ input, context }) => {
    const current = await getItemOrThrow(
      input.id,
      context.activeOrganizationId,
    );
    const nextCatalogId = input.catalogId ?? current.catalogId;

    await getCatalogOrThrow(nextCatalogId, context.activeOrganizationId);
    await ensureCategoryBelongsToCatalog(
      input.categoryId ?? current.categoryId,
      nextCatalogId,
      context.activeOrganizationId,
    );

    if (
      input.basePriceAmount !== undefined ||
      input.compareAtPriceAmount !== undefined
    ) {
      ensurePermission(context.roles, { catalogItem: ["pricing"] });
    }

    if (input.inventoryQuantity !== undefined) {
      ensurePermission(context.roles, { catalogItem: ["inventory"] });
    }

    const slug = input.slug
      ? resolveSlug(input.slug, input.name ?? current.name)
      : undefined;

    if (slug) {
      await ensureItemSlugAvailable(nextCatalogId, slug, current.id);
    }

    const nextImageUrl =
      input.imageUrl === undefined ? current.imageUrl : (input.imageUrl ?? null);

    const [updated] = await db
      .update(catalogItems)
      .set({
        catalogId: nextCatalogId,
        categoryId:
          input.categoryId === undefined
            ? current.categoryId
            : (input.categoryId ?? null),
        name: input.name ?? current.name,
        slug: slug ?? current.slug,
        sku: input.sku === undefined ? current.sku : asNullableText(input.sku),
        shortDescription:
          input.shortDescription === undefined
            ? current.shortDescription
            : asNullableText(input.shortDescription),
        description:
          input.description === undefined
            ? current.description
            : asNullableText(input.description),
        imageUrl: nextImageUrl,
        gallery:
          input.gallery === undefined
            ? current.gallery
            : asNullableArray(input.gallery),
        status: input.status ?? current.status,
        basePriceAmount:
          input.basePriceAmount === undefined
            ? current.basePriceAmount
            : (input.basePriceAmount ?? null),
        compareAtPriceAmount:
          input.compareAtPriceAmount === undefined
            ? current.compareAtPriceAmount
            : (input.compareAtPriceAmount ?? null),
        inventoryQuantity:
          input.inventoryQuantity === undefined
            ? current.inventoryQuantity
            : (input.inventoryQuantity ?? null),
        hasVariants: input.hasVariants ?? current.hasVariants,
        trackInventory: input.trackInventory ?? current.trackInventory,
        isFeatured: input.isFeatured ?? current.isFeatured,
        isAvailable: input.isAvailable ?? current.isAvailable,
        tags:
          input.tags === undefined ? current.tags : asNullableArray(input.tags),
        sortOrder: input.sortOrder ?? current.sortOrder,
      })
      .where(eq(catalogItems.id, current.id))
      .returning();

    if (current.imageUrl && current.imageUrl !== nextImageUrl) {
      void removeProductImageByUrl(current.imageUrl);
    }

    return updated;
  });

export const reorderItems = reorderItemProcedure
  .input(reorderSchema)
  .handler(async ({ input, context }) => {
    const items = await db
      .select({ id: catalogItems.id })
      .from(catalogItems)
      .innerJoin(catalogs, eq(catalogs.id, catalogItems.catalogId))
      .where(
        and(
          inArray(catalogItems.id, input.ids),
          eq(catalogs.organizationId, context.activeOrganizationId),
        ),
      );

    if (items.length !== input.ids.length) {
      notFound("Uno o más productos no pertenecen a la organización activa.");
    }

    await reorderWithOffset(input.ids, (id, sortOrder) =>
      db.update(catalogItems).set({ sortOrder }).where(eq(catalogItems.id, id)),
    );

    return { success: true };
  });

export const removeItem = deleteItemProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    const current = await getItemOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(catalogItems)
      .where(eq(catalogItems.id, input.id))
      .returning();

    if (current.imageUrl) {
      void removeProductImageByUrl(current.imageUrl);
    }

    return deleted;
  });

export const listVariants = readVariantProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getItemOrThrow(input.id, context.activeOrganizationId);
    return db
      .select()
      .from(catalogItemVariants)
      .where(eq(catalogItemVariants.catalogItemId, input.id))
      .orderBy(
        asc(catalogItemVariants.sortOrder),
        asc(catalogItemVariants.name),
      );
  });

export const createVariant = createVariantProcedure
  .input(createVariantSchema)
  .handler(async ({ input, context }) => {
    await getItemOrThrow(input.catalogItemId, context.activeOrganizationId);

    if (
      input.priceAmount !== undefined ||
      input.compareAtPriceAmount !== undefined
    ) {
      ensurePermission(context.roles, { catalogItemVariant: ["pricing"] });
    }

    if (input.inventoryQuantity !== undefined) {
      ensurePermission(context.roles, { catalogItemVariant: ["inventory"] });
    }

    const [created] = await db
      .insert(catalogItemVariants)
      .values({
        catalogItemId: input.catalogItemId,
        name: input.name,
        sku: asNullableText(input.sku),
        optionValues: input.optionValues ?? null,
        priceAmount: input.priceAmount ?? null,
        compareAtPriceAmount: input.compareAtPriceAmount ?? null,
        inventoryQuantity: input.inventoryQuantity ?? null,
        isDefault: input.isDefault,
        isAvailable: input.isAvailable,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning();

    return created;
  });

export const updateVariant = updateVariantProcedure
  .input(updateVariantSchema)
  .handler(async ({ input, context }) => {
    const current = await getVariantOrThrow(
      input.id,
      context.activeOrganizationId,
    );

    if (input.catalogItemId) {
      await getItemOrThrow(input.catalogItemId, context.activeOrganizationId);
    }

    if (
      input.priceAmount !== undefined ||
      input.compareAtPriceAmount !== undefined
    ) {
      ensurePermission(context.roles, { catalogItemVariant: ["pricing"] });
    }

    if (input.inventoryQuantity !== undefined) {
      ensurePermission(context.roles, { catalogItemVariant: ["inventory"] });
    }

    const [updated] = await db
      .update(catalogItemVariants)
      .set({
        catalogItemId: input.catalogItemId ?? current.catalogItemId,
        name: input.name ?? current.name,
        sku: input.sku === undefined ? current.sku : asNullableText(input.sku),
        optionValues:
          input.optionValues === undefined
            ? current.optionValues
            : (input.optionValues ?? null),
        priceAmount:
          input.priceAmount === undefined
            ? current.priceAmount
            : (input.priceAmount ?? null),
        compareAtPriceAmount:
          input.compareAtPriceAmount === undefined
            ? current.compareAtPriceAmount
            : (input.compareAtPriceAmount ?? null),
        inventoryQuantity:
          input.inventoryQuantity === undefined
            ? current.inventoryQuantity
            : (input.inventoryQuantity ?? null),
        isDefault: input.isDefault ?? current.isDefault,
        isAvailable: input.isAvailable ?? current.isAvailable,
        sortOrder: input.sortOrder ?? current.sortOrder,
      })
      .where(eq(catalogItemVariants.id, current.id))
      .returning();

    return updated;
  });

export const removeVariant = deleteVariantProcedure
  .input(idInputSchema)
  .handler(async ({ input, context }) => {
    await getVariantOrThrow(input.id, context.activeOrganizationId);
    const [deleted] = await db
      .delete(catalogItemVariants)
      .where(eq(catalogItemVariants.id, input.id))
      .returning();

    return deleted;
  });

export default {
  list,
  getById,
  create,
  update,
  setStatus,
  remove,
  listCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  removeCategory,
  listItems,
  getItem,
  createItem,
  updateItem,
  reorderItems,
  removeItem,
  listVariants,
  createVariant,
  updateVariant,
  removeVariant,
};
