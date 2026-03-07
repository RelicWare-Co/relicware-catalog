const PUBLIC_CATALOG_BASE_PATH = "/c";

export function getPublicCatalogPath(
  organizationSlug: string,
  catalogSlug: string,
) {
  return `${PUBLIC_CATALOG_BASE_PATH}/${encodeURIComponent(organizationSlug)}/${encodeURIComponent(catalogSlug)}`;
}

export function getPublicCatalogUrl(
  organizationSlug: string,
  catalogSlug: string,
  origin = typeof window !== "undefined" ? window.location.origin : "",
) {
  const path = getPublicCatalogPath(organizationSlug, catalogSlug);

  return origin ? `${origin}${path}` : path;
}