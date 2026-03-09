export type CatalogFormValues = {
  name: string;
  description: string;
  currencyCode: string;
  status: string;
  priceDisplayMode: string;
  siteId: string;
  locationId: string;
  brandThemeId: string;
  isPublic: boolean;
};

export type CategoryFormValues = {
  name: string;
  description: string;
  parentCategoryId: string;
  isVisible: boolean;
};
