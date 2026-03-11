import { Card, Group, Image, Stack, Text } from "@mantine/core";
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
      className="catalog-card catalog-card-responsive"
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
        position: "relative",
        overflow: "hidden",
        opacity: reducedMotion ? 1 : 0,
        transform: reducedMotion ? "none" : "translate3d(0, 14px, 0)",
        animation: reducedMotion
          ? undefined
          : "catalog-enter 520ms var(--catalog-ease-out-expo) forwards",
        animationDelay: reducedMotion ? undefined : `${260 + animationIndex * 60}ms`,
        willChange: reducedMotion ? undefined : "transform, opacity",
      }}
    >
      {item.isFeatured && (
        <div
          className="catalog-featured-ribbon"
          style={{
            position: "absolute",
            top: "14px",
            right: "-32px",
            width: "120px",
            backgroundColor: colors.accent,
            color: "#ffffff",
            padding: "4px 0",
            transform: "rotate(45deg)",
            textAlign: "center",
            fontSize: "0.6rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        >
          Destacado
        </div>
      )}

      {item.imageUrl && (
        <div className="catalog-card-image-wrapper catalog-card-image-section">
          <Image
            src={item.imageUrl}
            alt={item.name}
            height={220}
            fit="cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="catalog-card-wrapper">
        <Stack gap={4}>
          <Group justify="space-between" align="start" wrap="nowrap">
            <Text fw={600} size="md" style={{ color: colors.text, lineHeight: 1.3, paddingRight: item.isFeatured ? '1.5rem' : 0 }}>
              {item.name}
            </Text>
          </Group>

          {item.shortDescription && (
            <Text
              size="sm"
              lineClamp={2}
              style={{ color: colors.mutedText, marginTop: 2, fontSize: "0.85rem" }}
            >
              {item.shortDescription}
            </Text>
          )}
        </Stack>

        {price && (
          <Text fw={700} size="lg" mt={{ base: "xs", sm: "xl" }} style={{ color: colors.primary }}>
            {catalog.priceDisplayMode === "starting_at" ? `Desde ${price}` : price}
          </Text>
        )}
      </div>
    </Card>
  );
}
