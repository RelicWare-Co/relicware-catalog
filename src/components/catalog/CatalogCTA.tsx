import { Avatar, Box, Button, Text, Title } from "@mantine/core";
import { MessageCircle } from "lucide-react";
import type { CatalogColors } from "./types";
import { getEnterMotionStyle } from "./utils";

export function CatalogCTA({
  colors,
  borderRadius,
  animationIndex,
  reducedMotion,
  whatsappEnabled = true,
  coverImageUrl,
  catalogName,
}: {
  colors: CatalogColors;
  borderRadius: string;
  animationIndex: number;
  reducedMotion: boolean;
  whatsappEnabled?: boolean;
  coverImageUrl?: string | null;
  catalogName?: string;
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
      {!whatsappEnabled && coverImageUrl && (
        <Avatar src={coverImageUrl} size={80} radius={borderRadius === 'full' ? 'xl' : borderRadius} mx="auto" mb="md" />
      )}
      <Title order={3} size="h4" mb={8} style={{ color: colors.text }}>
        {whatsappEnabled ? "¿Te interesa algún producto?" : "Gracias por tu visita"}
      </Title>
      <Text mb="md" style={{ color: colors.mutedText }}>
        {whatsappEnabled 
          ? "Contáctanos directamente para más información o para hacer tu pedido."
          : `Gracias por visitar ${catalogName || 'nuestro catálogo'}.`}
      </Text>
      
      {whatsappEnabled && (
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
      )}
    </Box>
  );
}
