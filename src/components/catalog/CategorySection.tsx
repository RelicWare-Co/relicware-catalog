import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
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
}: {
  category: { id: string; name: string; description?: string | null } | null;
  items: CatalogItem[];
  catalog: PublicCatalog;
  colors: CatalogColors;
  brandTheme: BrandThemeConfig | null;
  categoryIndex: number; // for animation calculation offset
  reducedMotion: boolean;
  onItemClick: (item: CatalogItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <Stack gap="lg" mt={16} style={getEnterMotionStyle(categoryIndex + 1, reducedMotion, 220)}>
      <Stack gap={4}>
        <Title order={2} size="h3" style={{ color: colors.text }}>
          {category ? category.name : "Otros productos"}
        </Title>
        {category?.description && (
          <Text size="sm" style={{ color: colors.mutedText }}>
            {category.description}
          </Text>
        )}
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
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
    </Stack>
  );
}
