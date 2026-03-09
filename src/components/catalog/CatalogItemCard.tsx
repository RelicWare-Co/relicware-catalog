import { Badge, Card, Group, Image, Stack, Text } from "@mantine/core";
import type { BrandThemeConfig, CatalogColors, CatalogItem, PublicCatalog } from "./types";
import { formatMoney } from "./utils";

export function CatalogItemCard({
  item,
  catalog,
  colors,
  brandTheme,
  animationIndex,
  reducedMotion,
  onClick,
}: {
  item: CatalogItem;
  catalog: PublicCatalog;
  colors: CatalogColors;
  brandTheme: BrandThemeConfig | null;
  animationIndex: number;
  reducedMotion: boolean;
  onClick: () => void;
}) {
  const price =
    catalog.priceDisplayMode !== "hidden"
      ? formatMoney(item.basePriceAmount, catalog.currencyCode)
      : null;

  const cardHoverShadow =
    brandTheme?.cardStyle === "flat" || brandTheme?.cardStyle === "outlined"
      ? "none"
      : "0 16px 32px rgba(0, 0, 0, 0.12)";

  return (
    <Card
      className="catalog-card"
      p="md"
      radius="var(--catalog-radius)"
      onClick={onClick}
      style={{
        cursor: "pointer",
        backgroundColor: "var(--catalog-surface)",
        border:
          brandTheme?.cardStyle === "flat"
            ? "none"
            : brandTheme?.cardStyle === "outlined"
              ? `1px solid ${colors.mutedText}25`
              : "none",
        boxShadow:
          brandTheme?.cardStyle === "elevated" || !brandTheme?.cardStyle
            ? "0 8px 30px rgba(0, 0, 0, 0.04)"
            : "none",
        "--catalog-card-hover-shadow": cardHoverShadow,
        transition:
          "transform 220ms var(--catalog-ease-out-quart), box-shadow 220ms var(--catalog-ease-out-quart)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: reducedMotion ? 1 : 0,
        transform: reducedMotion ? "none" : "translate3d(0, 14px, 0)",
        animation: reducedMotion
          ? undefined
          : "catalog-enter 520ms var(--catalog-ease-out-expo) forwards",
        animationDelay: reducedMotion ? undefined : `${260 + animationIndex * 60}ms`,
        willChange: reducedMotion ? undefined : "transform, opacity",
      }}
    >
      {item.imageUrl && (
        <Card.Section mb="sm">
          <Image
            src={item.imageUrl}
            alt={item.name}
            height={200}
            fit="cover"
            loading="lazy"
          />
        </Card.Section>
      )}

      <Stack gap={4} flex={1}>
        <Group justify="space-between" align="start" wrap="nowrap">
          <Text fw={600} size="lg" style={{ color: colors.text, lineHeight: 1.3 }}>
            {item.name}
          </Text>
          {item.isFeatured && (
            <Badge
              className="catalog-featured-badge"
              variant="filled"
              size="sm"
              style={{ backgroundColor: colors.accent, color: "#fff" }}
            >
              Destacado
            </Badge>
          )}
        </Group>

        {item.shortDescription && (
          <Text
            size="sm"
            lineClamp={2}
            style={{ color: colors.mutedText, marginTop: 4 }}
          >
            {item.shortDescription}
          </Text>
        )}
      </Stack>

      {price && (
        <Text fw={700} size="xl" mt="xl" style={{ color: colors.primary }}>
          {catalog.priceDisplayMode === "starting_at" ? `Desde ${price}` : price}
        </Text>
      )}
    </Card>
  );
}
