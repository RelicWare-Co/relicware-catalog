import { Box, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { CatalogItemCard } from "./CatalogItemCard";
import type { BrandThemeConfig, CatalogColors, CatalogItem, PublicCatalog } from "./types";
import { getEnterMotionStyle } from "./utils";

export function CategorySection({
  category,
  items,
  catalog,
  colors,
  brandTheme,
  categoryIndex,
  reducedMotion,
  onItemClick,
  hideHeader = false,
}: {
  category: { id: string; name: string; description?: string | null } | null;
  items: CatalogItem[];
  catalog: PublicCatalog;
  colors: CatalogColors;
  brandTheme: BrandThemeConfig | null;
  categoryIndex: number;
  reducedMotion: boolean;
  onItemClick: (item: CatalogItem) => void;
  hideHeader?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <Box 
      component="section" 
      mt={10} 
      mb={24}
      style={getEnterMotionStyle(categoryIndex + 1, reducedMotion, 220)}
    >
      {!hideHeader && (
        <Paper 
          className="catalog-category-header"
          p="sm" 
          radius="md" 
          mb="xl"
          mt={categoryIndex > 0 ? "xl" : 0}
          style={{ 
            background: `color-mix(in srgb, ${colors.surface} 60%, transparent)`,
            backdropFilter: "blur(8px)",
            borderLeft: `3px solid ${colors.primary}`,
            borderBottom: `1px solid ${colors.mutedText}15`,
            boxShadow: "none"
          }}
        >
          <Title order={3} size="h4" style={{ color: colors.text, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {category ? category.name : "Otros productos"}
          </Title>
          {category?.description && (
            <Text size="sm" mt={4} style={{ color: colors.mutedText }}>
              {category.description}
            </Text>
          )}
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="lg">
        {items.map((item, itemIndex) => (
          <CatalogItemCard
            key={item.id}
            item={item}
            catalog={catalog}
            colors={colors}
            brandTheme={brandTheme}
            animationIndex={categoryIndex * 3 + itemIndex}
            reducedMotion={reducedMotion}
            onClick={() => onItemClick(item)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
