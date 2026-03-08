import { relations, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { organization } from "./auth.schema.ts";

type JsonObject = Record<string, unknown>;

const idColumn = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestampColumns = () => ({
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date()),
});

export const locations = sqliteTable(
  "locations",
  {
    id: idColumn(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    district: text("district"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    countryCode: text("country_code").notNull().default("MX"),
    phone: text("phone"),
    whatsappPhone: text("whatsapp_phone"),
    contactEmail: text("contact_email"),
    mapUrl: text("map_url"),
    businessHours: text("business_hours", { mode: "json" }).$type<JsonObject>(),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestampColumns(),
  },
  (table) => [
    index("locations_organization_id_idx").on(table.organizationId),
    uniqueIndex("locations_org_slug_uidx").on(table.organizationId, table.slug),
  ],
);

export const brandThemes = sqliteTable(
  "brand_themes",
  {
    id: idColumn(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    preset: text("preset", {
      enum: ["custom", "minimal", "bold", "editorial", "warm"],
    })
      .notNull()
      .default("custom"),
    primaryColor: text("primary_color").notNull().default("#1F6FEB"),
    secondaryColor: text("secondary_color"),
    accentColor: text("accent_color"),
    backgroundColor: text("background_color").notNull().default("#FFF8F1"),
    surfaceColor: text("surface_color"),
    textColor: text("text_color").notNull().default("#1B1B18"),
    mutedTextColor: text("muted_text_color"),
    fontHeading: text("font_heading"),
    fontBody: text("font_body"),
    borderRadius: text("border_radius", {
      enum: ["none", "sm", "md", "lg", "xl", "full"],
    })
      .notNull()
      .default("lg"),
    buttonStyle: text("button_style", {
      enum: ["solid", "soft", "outline"],
    })
      .notNull()
      .default("solid"),
    cardStyle: text("card_style", {
      enum: ["flat", "outlined", "elevated"],
    })
      .notNull()
      .default("elevated"),
    styleOverrides: text("style_overrides", {
      mode: "json",
    }).$type<JsonObject>(),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestampColumns(),
  },
  (table) => [
    index("brand_themes_organization_id_idx").on(table.organizationId),
    uniqueIndex("brand_themes_org_name_uidx").on(
      table.organizationId,
      table.name,
    ),
  ],
);

export const sites = sqliteTable(
  "sites",
  {
    id: idColumn(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    locationId: text("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    brandThemeId: text("brand_theme_id").references(() => brandThemes.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type", { enum: ["catalog", "links", "hybrid"] })
      .notNull()
      .default("hybrid"),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    subdomain: text("subdomain"),
    customDomain: text("custom_domain"),
    headline: text("headline"),
    subheadline: text("subheadline"),
    description: text("description"),
    logoUrl: text("logo_url"),
    heroImageUrl: text("hero_image_url"),
    coverImageUrl: text("cover_image_url"),
    primaryCtaLabel: text("primary_cta_label"),
    primaryCtaUrl: text("primary_cta_url"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    socialLinks: text("social_links", { mode: "json" }).$type<JsonObject>(),
    settings: text("settings", { mode: "json" }).$type<JsonObject>(),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    ...timestampColumns(),
  },
  (table) => [
    index("sites_organization_id_idx").on(table.organizationId),
    index("sites_location_id_idx").on(table.locationId),
    uniqueIndex("sites_slug_uidx").on(table.slug),
    uniqueIndex("sites_subdomain_uidx").on(table.subdomain),
    uniqueIndex("sites_custom_domain_uidx").on(table.customDomain),
  ],
);

export const siteSections = sqliteTable(
  "site_sections",
  {
    id: idColumn(),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "hero",
        "featured_links",
        "catalog_preview",
        "about",
        "contact",
        "hours",
        "social",
        "custom_text",
      ],
    })
      .notNull()
      .default("hero"),
    title: text("title"),
    subtitle: text("subtitle"),
    body: text("body"),
    content: text("content", { mode: "json" }).$type<JsonObject>(),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: integer("is_visible", { mode: "boolean" })
      .notNull()
      .default(true),
    ...timestampColumns(),
  },
  (table) => [
    index("site_sections_site_id_idx").on(table.siteId),
    uniqueIndex("site_sections_site_sort_uidx").on(
      table.siteId,
      table.sortOrder,
    ),
  ],
);

export const siteLinks = sqliteTable(
  "site_links",
  {
    id: idColumn(),
    siteSectionId: text("site_section_id")
      .notNull()
      .references(() => siteSections.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    type: text("type", {
      enum: [
        "custom",
        "website",
        "whatsapp",
        "instagram",
        "facebook",
        "tiktok",
        "menu",
        "reservation",
      ],
    })
      .notNull()
      .default("custom"),
    icon: text("icon"),
    thumbnailUrl: text("thumbnail_url"),
    analyticsKey: text("analytics_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    isHighlighted: integer("is_highlighted", { mode: "boolean" })
      .notNull()
      .default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestampColumns(),
  },
  (table) => [
    index("site_links_site_section_id_idx").on(table.siteSectionId),
    uniqueIndex("site_links_section_sort_uidx").on(
      table.siteSectionId,
      table.sortOrder,
    ),
  ],
);

export const catalogs = sqliteTable(
  "catalogs",
  {
    id: idColumn(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    siteId: text("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    locationId: text("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    brandThemeId: text("brand_theme_id").references(() => brandThemes.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    currencyCode: text("currency_code").notNull().default("COP"),
    status: text("status", { enum: ["draft", "active", "archived"] })
      .notNull()
      .default("draft"),
    priceDisplayMode: text("price_display_mode", {
      enum: ["exact", "starting_at", "hidden"],
    })
      .notNull()
      .default("exact"),
    coverImageUrl: text("cover_image_url"),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
    settings: text("settings", { mode: "json" }).$type<JsonObject>(),
    ...timestampColumns(),
  },
  (table) => [
    index("catalogs_organization_id_idx").on(table.organizationId),
    index("catalogs_site_id_idx").on(table.siteId),
    uniqueIndex("catalogs_org_slug_uidx").on(table.organizationId, table.slug),
  ],
);

export const catalogCategories = sqliteTable(
  "catalog_categories",
  {
    id: idColumn(),
    catalogId: text("catalog_id")
      .notNull()
      .references(() => catalogs.id, { onDelete: "cascade" }),
    parentCategoryId: text("parent_category_id").references(
      (): AnySQLiteColumn => catalogCategories.id,
      { onDelete: "set null" },
    ),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: integer("is_visible", { mode: "boolean" })
      .notNull()
      .default(true),
    ...timestampColumns(),
  },
  (table) => [
    index("catalog_categories_catalog_id_idx").on(table.catalogId),
    index("catalog_categories_parent_id_idx").on(table.parentCategoryId),
    uniqueIndex("catalog_categories_catalog_slug_uidx").on(
      table.catalogId,
      table.slug,
    ),
  ],
);

export const catalogItems = sqliteTable(
  "catalog_items",
  {
    id: idColumn(),
    catalogId: text("catalog_id")
      .notNull()
      .references(() => catalogs.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => catalogCategories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku"),
    shortDescription: text("short_description"),
    description: text("description"),
    imageUrl: text("image_url"),
    gallery: text("gallery", { mode: "json" }).$type<string[]>(),
    status: text("status", { enum: ["draft", "active", "archived"] })
      .notNull()
      .default("draft"),
    basePriceAmount: integer("base_price_amount"),
    compareAtPriceAmount: integer("compare_at_price_amount"),
    inventoryQuantity: integer("inventory_quantity"),
    hasVariants: integer("has_variants", { mode: "boolean" })
      .notNull()
      .default(false),
    trackInventory: integer("track_inventory", { mode: "boolean" })
      .notNull()
      .default(false),
    isFeatured: integer("is_featured", { mode: "boolean" })
      .notNull()
      .default(false),
    isAvailable: integer("is_available", { mode: "boolean" })
      .notNull()
      .default(true),
    tags: text("tags", { mode: "json" }).$type<string[]>(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    index("catalog_items_catalog_id_idx").on(table.catalogId),
    index("catalog_items_category_id_idx").on(table.categoryId),
    index("catalog_items_sku_idx").on(table.sku),
    uniqueIndex("catalog_items_catalog_slug_uidx").on(
      table.catalogId,
      table.slug,
    ),
  ],
);

export const catalogItemVariants = sqliteTable(
  "catalog_item_variants",
  {
    id: idColumn(),
    catalogItemId: text("catalog_item_id")
      .notNull()
      .references(() => catalogItems.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku"),
    optionValues: text("option_values", { mode: "json" }).$type<JsonObject>(),
    priceAmount: integer("price_amount"),
    compareAtPriceAmount: integer("compare_at_price_amount"),
    inventoryQuantity: integer("inventory_quantity"),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    isAvailable: integer("is_available", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    index("catalog_item_variants_item_id_idx").on(table.catalogItemId),
    index("catalog_item_variants_sku_idx").on(table.sku),
    uniqueIndex("catalog_item_variants_item_sort_uidx").on(
      table.catalogItemId,
      table.sortOrder,
    ),
  ],
);

export const leadRequests = sqliteTable(
  "lead_requests",
  {
    id: idColumn(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    siteId: text("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    locationId: text("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    source: text("source", {
      enum: ["site", "catalog", "link", "qr", "manual"],
    })
      .notNull()
      .default("site"),
    status: text("status", {
      enum: ["new", "contacted", "qualified", "closed", "archived"],
    })
      .notNull()
      .default("new"),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    companyName: text("company_name"),
    preferredContactMethod: text("preferred_contact_method", {
      enum: ["whatsapp", "phone", "email"],
    }),
    message: text("message"),
    context: text("context", { mode: "json" }).$type<JsonObject>(),
    ...timestampColumns(),
  },
  (table) => [
    index("lead_requests_organization_id_idx").on(table.organizationId),
    index("lead_requests_site_id_idx").on(table.siteId),
    index("lead_requests_status_idx").on(table.status),
  ],
);

export const reservationRequests = sqliteTable(
  "reservation_requests",
  {
    id: idColumn(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    siteId: text("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    source: text("source", {
      enum: ["site", "catalog", "link", "qr", "manual"],
    })
      .notNull()
      .default("site"),
    status: text("status", {
      enum: ["pending", "confirmed", "declined", "cancelled", "completed"],
    })
      .notNull()
      .default("pending"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email"),
    customerPhone: text("customer_phone"),
    partySize: integer("party_size").notNull().default(1),
    requestedAt: integer("requested_at", { mode: "timestamp_ms" }).notNull(),
    notes: text("notes"),
    metadata: text("metadata", { mode: "json" }).$type<JsonObject>(),
    ...timestampColumns(),
  },
  (table) => [
    index("reservation_requests_organization_id_idx").on(table.organizationId),
    index("reservation_requests_location_id_idx").on(table.locationId),
    index("reservation_requests_requested_at_idx").on(table.requestedAt),
    index("reservation_requests_status_idx").on(table.status),
  ],
);

export const locationRelations = relations(locations, ({ one, many }) => ({
  organization: one(organization, {
    fields: [locations.organizationId],
    references: [organization.id],
  }),
  sites: many(sites),
  catalogs: many(catalogs),
  leadRequests: many(leadRequests),
  reservationRequests: many(reservationRequests),
}));

export const brandThemeRelations = relations(brandThemes, ({ one, many }) => ({
  organization: one(organization, {
    fields: [brandThemes.organizationId],
    references: [organization.id],
  }),
  sites: many(sites),
  catalogs: many(catalogs),
}));

export const siteRelations = relations(sites, ({ one, many }) => ({
  organization: one(organization, {
    fields: [sites.organizationId],
    references: [organization.id],
  }),
  location: one(locations, {
    fields: [sites.locationId],
    references: [locations.id],
  }),
  brandTheme: one(brandThemes, {
    fields: [sites.brandThemeId],
    references: [brandThemes.id],
  }),
  sections: many(siteSections),
  catalogs: many(catalogs),
  leadRequests: many(leadRequests),
  reservationRequests: many(reservationRequests),
}));

export const siteSectionRelations = relations(
  siteSections,
  ({ one, many }) => ({
    site: one(sites, {
      fields: [siteSections.siteId],
      references: [sites.id],
    }),
    links: many(siteLinks),
  }),
);

export const siteLinkRelations = relations(siteLinks, ({ one }) => ({
  section: one(siteSections, {
    fields: [siteLinks.siteSectionId],
    references: [siteSections.id],
  }),
}));

export const catalogRelations = relations(catalogs, ({ one, many }) => ({
  organization: one(organization, {
    fields: [catalogs.organizationId],
    references: [organization.id],
  }),
  site: one(sites, {
    fields: [catalogs.siteId],
    references: [sites.id],
  }),
  location: one(locations, {
    fields: [catalogs.locationId],
    references: [locations.id],
  }),
  brandTheme: one(brandThemes, {
    fields: [catalogs.brandThemeId],
    references: [brandThemes.id],
  }),
  categories: many(catalogCategories),
  items: many(catalogItems),
}));

export const catalogCategoryRelations = relations(
  catalogCategories,
  ({ one, many }) => ({
    catalog: one(catalogs, {
      fields: [catalogCategories.catalogId],
      references: [catalogs.id],
    }),
    parent: one(catalogCategories, {
      fields: [catalogCategories.parentCategoryId],
      references: [catalogCategories.id],
      relationName: "catalog_category_parent",
    }),
    children: many(catalogCategories, {
      relationName: "catalog_category_parent",
    }),
    items: many(catalogItems),
  }),
);

export const catalogItemRelations = relations(
  catalogItems,
  ({ one, many }) => ({
    catalog: one(catalogs, {
      fields: [catalogItems.catalogId],
      references: [catalogs.id],
    }),
    category: one(catalogCategories, {
      fields: [catalogItems.categoryId],
      references: [catalogCategories.id],
    }),
    variants: many(catalogItemVariants),
  }),
);

export const catalogItemVariantRelations = relations(
  catalogItemVariants,
  ({ one }) => ({
    item: one(catalogItems, {
      fields: [catalogItemVariants.catalogItemId],
      references: [catalogItems.id],
    }),
  }),
);

export const leadRequestRelations = relations(leadRequests, ({ one }) => ({
  organization: one(organization, {
    fields: [leadRequests.organizationId],
    references: [organization.id],
  }),
  site: one(sites, {
    fields: [leadRequests.siteId],
    references: [sites.id],
  }),
  location: one(locations, {
    fields: [leadRequests.locationId],
    references: [locations.id],
  }),
}));

export const reservationRequestRelations = relations(
  reservationRequests,
  ({ one }) => ({
    organization: one(organization, {
      fields: [reservationRequests.organizationId],
      references: [organization.id],
    }),
    site: one(sites, {
      fields: [reservationRequests.siteId],
      references: [sites.id],
    }),
    location: one(locations, {
      fields: [reservationRequests.locationId],
      references: [locations.id],
    }),
  }),
);
