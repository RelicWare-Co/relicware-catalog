import { Box, Stack, Text, Title } from "@mantine/core";
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
      <Box
        p="xl"
        style={{
          background: `color-mix(in srgb, ${colors.surface} 75%, transparent)`,
          backdropFilter: "blur(12px)",
          border: `1px solid color-mix(in srgb, ${colors.text} 10%, transparent)`,
          borderRadius: "1.25rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          width: "100%",
          maxWidth: 800,
        }}
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
            mx="auto"
            mt="md"
            style={{ color: colors.text, opacity: 0.85, textWrap: "pretty" }}
          >
            {catalog.description}
          </Text>
        )}
      </Box>
    </Stack>
  );
}
