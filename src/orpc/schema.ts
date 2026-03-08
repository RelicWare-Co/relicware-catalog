// TODO: use drizzle zod when Drizzle gets to 1.0
import { z } from "zod";

const idSchema = z.string().min(1);
const colorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
const jsonRecordSchema = z.record(z.string(), z.unknown());
const trimmedString = z.string().trim();
const nullableText = trimmedString.min(1).max(5000).nullable().optional();

export const siteTypeValues = ["catalog", "links", "hybrid"] as const;
export const siteStatusValues = ["draft", "published", "archived"] as const;
export const siteSectionTypeValues = [
  "hero",
  "featured_links",
  "catalog_preview",
  "about",
  "contact",
  "hours",
  "social",
  "custom_text",
] as const;
export const siteLinkTypeValues = [
  "custom",
  "website",
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "menu",
  "reservation",
] as const;
export const themePresetValues = [
  "custom",
  "minimal",
  "bold",
  "editorial",
  "warm",
] as const;
export const borderRadiusValues = ["none", "sm", "md", "lg", "xl", "full"] as const;
export const buttonStyleValues = ["solid", "soft", "outline"] as const;
export const cardStyleValues = ["flat", "outlined", "elevated"] as const;
export const catalogStatusValues = ["draft", "active", "archived"] as const;
export const priceDisplayModeValues = ["exact", "starting_at", "hidden"] as const;
export const itemStatusValues = ["draft", "active", "archived"] as const;
export const leadSourceValues = ["site", "catalog", "link", "qr", "manual"] as const;
export const leadStatusValues = ["new", "contacted", "qualified", "closed", "archived"] as const;
export const reservationStatusValues = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
] as const;
export const preferredContactMethodValues = ["whatsapp", "phone", "email"] as const;

export const idInputSchema = z.object({ id: idSchema });
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
  search: z.string().trim().max(120).optional(),
});
export const reorderSchema = z.object({
  ids: z.array(idSchema).min(1).max(200),
});

export const createLocationSchema = z.object({
  name: trimmedString.min(1).max(120),
  slug: trimmedString.min(1).max(140).optional(),
  addressLine1: nullableText,
  addressLine2: nullableText,
  district: nullableText,
  city: trimmedString.min(1).max(120).nullable().optional(),
  state: nullableText,
  postalCode: nullableText,
  countryCode: trimmedString.length(2).default("MX"),
  phone: nullableText,
  whatsappPhone: nullableText,
  contactEmail: z.email().nullable().optional(),
  mapUrl: z.string().url().nullable().optional(),
  businessHours: jsonRecordSchema.nullable().optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export const updateLocationSchema = createLocationSchema.partial().extend({
  id: idSchema,
});

export const createBrandThemeSchema = z.object({
  name: trimmedString.min(1).max(120),
  preset: z.enum(themePresetValues).default("custom"),
  primaryColor: colorSchema.default("#1F6FEB"),
  secondaryColor: colorSchema.nullable().optional(),
  accentColor: colorSchema.nullable().optional(),
  backgroundColor: colorSchema.default("#FFF8F1"),
  surfaceColor: colorSchema.nullable().optional(),
  textColor: colorSchema.default("#1B1B18"),
  mutedTextColor: colorSchema.nullable().optional(),
  fontHeading: nullableText,
  fontBody: nullableText,
  borderRadius: z.enum(borderRadiusValues).default("lg"),
  buttonStyle: z.enum(buttonStyleValues).default("solid"),
  cardStyle: z.enum(cardStyleValues).default("elevated"),
  styleOverrides: jsonRecordSchema.nullable().optional(),
  isDefault: z.boolean().default(false),
});
export const updateBrandThemeSchema = createBrandThemeSchema.partial().extend({
  id: idSchema,
});

export const createSiteSchema = z.object({
  locationId: idSchema.nullable().optional(),
  brandThemeId: idSchema.nullable().optional(),
  name: trimmedString.min(1).max(120),
  slug: trimmedString.min(1).max(140).optional(),
  type: z.enum(siteTypeValues).default("hybrid"),
  status: z.enum(siteStatusValues).default("draft"),
  subdomain: trimmedString.min(3).max(63).nullable().optional(),
  customDomain: trimmedString.min(3).max(255).nullable().optional(),
  headline: nullableText,
  subheadline: nullableText,
  description: nullableText,
  logoUrl: z.string().url().nullable().optional(),
  heroImageUrl: z.string().url().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  primaryCtaLabel: nullableText,
  primaryCtaUrl: z.string().url().nullable().optional(),
  seoTitle: nullableText,
  seoDescription: nullableText,
  socialLinks: jsonRecordSchema.nullable().optional(),
  settings: jsonRecordSchema.nullable().optional(),
  isPublic: z.boolean().default(true),
});
export const updateSiteSchema = createSiteSchema.partial().extend({
  id: idSchema,
});
export const siteStatusSchema = z.object({
  id: idSchema,
  status: z.enum(siteStatusValues),
});

export const createSiteSectionSchema = z.object({
  siteId: idSchema,
  type: z.enum(siteSectionTypeValues).default("hero"),
  title: nullableText,
  subtitle: nullableText,
  body: nullableText,
  content: jsonRecordSchema.nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().default(true),
});
export const updateSiteSectionSchema = createSiteSectionSchema
  .partial()
  .extend({ id: idSchema });

export const createSiteLinkSchema = z.object({
  siteSectionId: idSchema,
  label: trimmedString.min(1).max(120),
  url: trimmedString.min(1).max(2048),
  type: z.enum(siteLinkTypeValues).default("custom"),
  icon: nullableText,
  thumbnailUrl: z.string().url().nullable().optional(),
  analyticsKey: nullableText,
  sortOrder: z.number().int().min(0).optional(),
  isHighlighted: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export const updateSiteLinkSchema = createSiteLinkSchema.partial().extend({
  id: idSchema,
});

export const createCatalogSchema = z.object({
  siteId: idSchema.nullable().optional(),
  locationId: idSchema.nullable().optional(),
  brandThemeId: idSchema.nullable().optional(),
  name: trimmedString.min(1).max(120),
  slug: trimmedString.min(1).max(140).optional(),
  description: nullableText,
  currencyCode: trimmedString.length(3).default("COP"),
  status: z.enum(catalogStatusValues).default("draft"),
  priceDisplayMode: z.enum(priceDisplayModeValues).default("exact"),
  coverImageUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().default(true),
  settings: jsonRecordSchema.nullable().optional(),
});
export const updateCatalogSchema = createCatalogSchema.partial().extend({
  id: idSchema,
});
export const catalogStatusSchema = z.object({
  id: idSchema,
  status: z.enum(catalogStatusValues),
});

export const createCategorySchema = z.object({
  catalogId: idSchema,
  parentCategoryId: idSchema.nullable().optional(),
  name: trimmedString.min(1).max(120),
  slug: trimmedString.min(1).max(140).optional(),
  description: nullableText,
  imageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().default(true),
});
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: idSchema,
});

export const createItemSchema = z.object({
  catalogId: idSchema,
  categoryId: idSchema.nullable().optional(),
  name: trimmedString.min(1).max(160),
  slug: trimmedString.min(1).max(160).optional(),
  sku: nullableText,
  shortDescription: nullableText,
  description: nullableText,
  imageUrl: z.string().url().nullable().optional(),
  gallery: z.array(z.string().url()).max(20).nullable().optional(),
  status: z.enum(itemStatusValues).default("draft"),
  basePriceAmount: z.number().int().min(0).nullable().optional(),
  compareAtPriceAmount: z.number().int().min(0).nullable().optional(),
  inventoryQuantity: z.number().int().min(0).nullable().optional(),
  hasVariants: z.boolean().default(false),
  trackInventory: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  tags: z.array(trimmedString.min(1).max(50)).max(20).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export const updateItemSchema = createItemSchema.partial().extend({
  id: idSchema,
});

export const createVariantSchema = z.object({
  catalogItemId: idSchema,
  name: trimmedString.min(1).max(120),
  sku: nullableText,
  optionValues: jsonRecordSchema.nullable().optional(),
  priceAmount: z.number().int().min(0).nullable().optional(),
  compareAtPriceAmount: z.number().int().min(0).nullable().optional(),
  inventoryQuantity: z.number().int().min(0).nullable().optional(),
  isDefault: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).optional(),
});
export const updateVariantSchema = createVariantSchema.partial().extend({
  id: idSchema,
});

export const listLeadRequestsSchema = paginationSchema.extend({
  status: z.enum(leadStatusValues).optional(),
  siteId: idSchema.optional(),
  locationId: idSchema.optional(),
});
export const listReservationRequestsSchema = paginationSchema.extend({
  status: z.enum(reservationStatusValues).optional(),
  siteId: idSchema.optional(),
  locationId: idSchema.optional(),
});

export const createLeadRequestSchema = z
  .object({
    siteId: idSchema.optional(),
    locationId: idSchema.optional(),
    source: z.enum(leadSourceValues).default("site"),
    name: trimmedString.min(1).max(120),
    email: z.email().nullable().optional(),
    phone: nullableText,
    companyName: nullableText,
    preferredContactMethod: z.enum(preferredContactMethodValues).nullable().optional(),
    message: nullableText,
    context: jsonRecordSchema.nullable().optional(),
  })
  .refine((value) => Boolean(value.siteId || value.locationId), {
    message: "Debes indicar un sitio o una sede para registrar el lead.",
    path: ["siteId"],
  });

export const updateLeadRequestSchema = z.object({
  id: idSchema,
  status: z.enum(leadStatusValues).optional(),
});

export const createReservationRequestSchema = z.object({
  locationId: idSchema,
  siteId: idSchema.nullable().optional(),
  source: z.enum(leadSourceValues).default("site"),
  customerName: trimmedString.min(1).max(120),
  customerEmail: z.email().nullable().optional(),
  customerPhone: nullableText,
  partySize: z.number().int().min(1).max(100).default(1),
  requestedAt: z.coerce.date(),
  notes: nullableText,
  metadata: jsonRecordSchema.nullable().optional(),
});

export const updateReservationRequestSchema = z.object({
  id: idSchema,
  status: z.enum(reservationStatusValues).optional(),
  notes: nullableText,
});

export const publicSiteLookupSchema = z.object({
  slug: trimmedString.min(1).max(140),
});

export const publicCatalogLookupSchema = z.object({
  organizationSlug: trimmedString.min(1).max(140),
  catalogSlug: trimmedString.min(1).max(140),
});

