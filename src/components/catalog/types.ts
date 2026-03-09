export type BrandColorTuple = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export type CatalogColors = {
  primary: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  gallery?: string[] | null;
  isFeatured: boolean;
  shortDescription: string | null;
  description?: string | null;
  basePriceAmount: number | null;
  categoryId?: string | null;
};

export type PublicCatalog = {
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  priceDisplayMode: "hidden" | "starting_at" | "exact";
  currencyCode: string;
};

export type BrandThemeConfig = {
  primaryColor?: string | null;
  backgroundColor?: string | null;
  surfaceColor?: string | null;
  textColor?: string | null;
  mutedTextColor?: string | null;
  accentColor?: string | null;
  borderRadius?: string | null;
  fontBody?: string | null;
  fontHeading?: string | null;
  cardStyle?: "flat" | "outlined" | "elevated" | null;
};
