import { Box, Button, Text, Title } from "@mantine/core";
import { MessageCircle } from "lucide-react";
import type { CatalogColors } from "./types";
import { getEnterMotionStyle } from "./utils";

export function CatalogCTA({
  colors,
  borderRadius,
  animationIndex,
  reducedMotion,
}: {
  colors: CatalogColors;
  borderRadius: string;
  animationIndex: number;
  reducedMotion: boolean;
}) {
  return (
    <Box
      className="catalog-cta"
      mt={40}
      p="xl"
      style={{
        backgroundColor: colors.surface,
        borderRadius,
        border: `1px solid ${colors.primary}15`,
        textAlign: "center",
        ...getEnterMotionStyle(animationIndex, reducedMotion, 260),
      }}
    >
      <Title order={3} size="h4" mb={8} style={{ color: colors.text }}>
        ¿Te interesa algún producto?
      </Title>
      <Text mb="md" style={{ color: colors.mutedText }}>
        Contáctanos directamente para más información o para hacer tu pedido.
      </Text>
      <Button
        component="a"
        href="https://wa.me/"
        target="_blank"
        rel="noreferrer"
        size="md"
        className="catalog-whatsapp-button"
        leftSection={<MessageCircle size={20} />}
        style={{
          backgroundColor: colors.primary,
          color: "#f8f8f6",
          borderRadius,
        }}
      >
        Escribir por WhatsApp
      </Button>
    </Box>
  );
}
