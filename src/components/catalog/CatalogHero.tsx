import { Stack, Text, Title } from "@mantine/core";
import type { CatalogColors, PublicCatalog } from "./types";
import { getEnterMotionStyle } from "./utils";

export function CatalogHero({
  catalog,
  colors,
  reducedMotion,
}: {
  catalog: PublicCatalog;
  colors: CatalogColors;
  reducedMotion: boolean;
}) {
  return (
    <Stack
      className="catalog-hero"
      gap="md"
      align="center"
      ta="center"
      mb={24}
      style={getEnterMotionStyle(0, reducedMotion, 140)}
    >
      <Title
        order={1}
        c={colors.text}
        style={{
          textWrap: "balance",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          lineHeight: 1.1,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {catalog.name}
      </Title>
      {catalog.description && (
        <Text
          size="lg"
          maw={600}
          style={{ color: colors.mutedText, textWrap: "pretty" }}
        >
          {catalog.description}
        </Text>
      )}
    </Stack>
  );
}
