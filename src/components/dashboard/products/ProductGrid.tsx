import { ActionIcon, Alert, Badge, Card, Grid, Group, Menu, Stack, Text } from "@mantine/core";
import { Edit, MoreVertical, Trash } from "lucide-react";
import type { ProductItem } from "./types";
import { formatPrice, getStatusBadgeColor } from "./utils";

type ProductGridProps = {
  items: ProductItem[];
  categories: { id: string; name: string }[];
  isFetching: boolean;
  onEdit: (item: ProductItem) => void;
  onDelete: (itemId: string) => void;
};

export function ProductGrid({
  items,
  categories,
  isFetching,
  onEdit,
  onDelete,
}: ProductGridProps) {
  if (isFetching) {
    return <Text c="dimmed">Actualizando productos...</Text>;
  }

  if (items.length === 0) {
    return (
      <Alert color="gray">
        No hay productos que coincidan con los filtros actuales para este
        catalogo.
      </Alert>
    );
  }

  return (
    <Grid gutter="lg">
      {items.map((item) => {
        const categoryName =
          categories.find((category) => category.id === item.categoryId)
            ?.name || "Sin categoria";

        return (
          <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="sm" h="100%">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div>
                    <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                      {categoryName}
                    </Text>
                    <Text fw={700} fz="lg" c="dark.8" mt={4}>
                      {item.name}
                    </Text>
                  </div>

                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label="Opciones del producto"
                      >
                        <MoreVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Edit size={14} />}
                        onClick={() => onEdit(item)}
                      >
                        Editar
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<Trash size={14} />}
                        onClick={() => onDelete(item.id)}
                      >
                        Eliminar
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>

                <Text c="dimmed" size="sm">
                  {item.shortDescription || "Sin descripcion corta"}
                </Text>

                <Group gap="xs">
                  <Badge color={item.isAvailable ? "teal" : "gray"}>
                    {item.isAvailable ? "Disponible" : "No disponible"}
                  </Badge>
                  <Badge color={getStatusBadgeColor(item.status)}>
                    {item.status}
                  </Badge>
                  {item.isFeatured ? (
                    <Badge color="orange">Destacado</Badge>
                  ) : null}
                </Group>

                <Group justify="space-between" mt="auto">
                  <Text fw={800} c="brand.6">
                    {formatPrice(item.basePriceAmount)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Inventario: {item.inventoryQuantity ?? "-"}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
