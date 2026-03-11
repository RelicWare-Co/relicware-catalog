import { Box, Button, Group, Image, Modal, Stack, Text, Title } from "@mantine/core";
import { ShoppingBag, X } from "lucide-react";
import type { CatalogColors, CatalogItem, PublicCatalog } from "./types";
import { formatMoney } from "./utils";

export function ProductModal({
  opened,
  close,
  selectedItem,
  catalog,
  colors,
  borderRadius,
  whatsappEnabled = true,
}: {
  opened: boolean;
  close: () => void;
  selectedItem: CatalogItem | null;
  catalog: PublicCatalog;
  colors: CatalogColors;
  borderRadius: string;
  whatsappEnabled?: boolean;
}) {
  if (!selectedItem) return null;

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="lg"
      padding="xl"
      radius={borderRadius}
      withCloseButton={false}
      centered
      styles={{
        content: { backgroundColor: colors.surface, color: colors.text },
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Title order={3} size="h3" style={{ lineHeight: 1.2 }}>
            {selectedItem.name}
          </Title>
          <button
            type="button"
            onClick={close}
            style={{
              cursor: "pointer",
              display: "flex",
              background: "none",
              border: "none",
              padding: 0,
            }}
            aria-label="Cerrar modal"
          >
            <X size={24} color={colors.mutedText} />
          </button>
        </Group>

        {(selectedItem.imageUrl || (selectedItem.gallery && selectedItem.gallery.length > 0)) && (
          <Box style={{ overflow: "hidden", borderRadius }}>
            <Image
              src={selectedItem.imageUrl || selectedItem.gallery?.[0] || ""}
              alt={selectedItem.name}
              height={300}
              fit="cover"
            />
          </Box>
        )}

        {selectedItem.description && (
          <Text style={{ whiteSpace: "pre-wrap", color: colors.text }}>
            {selectedItem.description}
          </Text>
        )}
        
        {!selectedItem.description && selectedItem.shortDescription && (
          <Text style={{ whiteSpace: "pre-wrap", color: colors.text }}>
            {selectedItem.shortDescription}
          </Text>
        )}

        <Group justify="space-between" align="center" mt="md">
          {catalog.priceDisplayMode !== "hidden" && selectedItem.basePriceAmount ? (
            <Text fw={800} size="xl" style={{ color: colors.primary }}>
              {catalog.priceDisplayMode === "starting_at" ? "Desde " : ""}
              {formatMoney(selectedItem.basePriceAmount, catalog.currencyCode)}
            </Text>
          ) : (
            <div />
          )}
          
          {whatsappEnabled && (
            <Button
              component="a"
              href={`https://wa.me/?text=${encodeURIComponent(`Hola, me interesa el producto: ${selectedItem.name}`)}`}
              target="_blank"
              rel="noreferrer"
              leftSection={<ShoppingBag size={18} />}
              style={{
                backgroundColor: colors.primary,
                color: "#f8f8f6",
                borderRadius,
              }}
            >
              Pedir producto
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
