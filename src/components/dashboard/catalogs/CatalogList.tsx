import { Alert, Badge, Card, Divider, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Layers3, Tags } from "lucide-react";

interface ResourceItem {
  id: string;
  name: string;
}

interface ResourceList {
  items: ResourceItem[];
}

type CatalogListItemProps = {
  selectedCatalog: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    currencyCode: string;
    priceDisplayMode: string;
    isPublic: boolean;
    siteId?: string | null;
    locationId?: string | null;
    brandThemeId?: string | null;
  } | null;
  categories: {
    id: string;
    name: string;
    description?: string | null;
    isVisible: boolean;
  }[];
  siteData: ResourceList;
  locationData: ResourceList;
  themeData: ResourceList;
  categoriesFetching: boolean;
};

export function CatalogList({
  selectedCatalog,
  categories,
  siteData,
  locationData,
  themeData,
  categoriesFetching,
}: CatalogListItemProps) {
  if (!selectedCatalog) {
    return (
      <Alert color="gray">
        No hay catalogos creados todavia. Crea uno para empezar.
      </Alert>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="sm">
            <Text fw={700}>Estado</Text>
            <Badge color={selectedCatalog.status === "active" ? "teal" : "gray"}>
              {selectedCatalog.status}
            </Badge>
          </Group>
          <Title order={3}>{selectedCatalog.name}</Title>
          <Text c="dimmed" mt="xs">
            {selectedCatalog.description || "Sin descripcion"}
          </Text>
          <Divider my="md" />
          <Stack gap={8}>
            <Text size="sm">Moneda: {selectedCatalog.currencyCode}</Text>
            <Text size="sm">
              Precios: {selectedCatalog.priceDisplayMode.replaceAll("_", " ")}
            </Text>
            <Text size="sm">
              Publico: {selectedCatalog.isPublic ? "Si" : "No"}
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="sm">
            <Text fw={700}>Categorias</Text>
            <Badge variant="light">{categories.length}</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            Estructura visible para navegar el catalogo.
          </Text>
          <Divider my="md" />
          <Stack gap="sm">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Group key={category.id} justify="space-between">
                  <div>
                    <Text fw={600}>{category.name}</Text>
                    <Text size="xs" c="dimmed">
                      {category.description || "Sin descripcion"}
                    </Text>
                  </div>
                  <Badge color={category.isVisible ? "teal" : "gray"}>
                    {category.isVisible ? "Visible" : "Oculta"}
                  </Badge>
                </Group>
              ))
            ) : (
              <Alert color="gray">Aun no hay categorias para este catalogo.</Alert>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="sm">
            <Text fw={700}>Conexiones</Text>
            <Layers3 size={16} />
          </Group>
          <Text c="dimmed" size="sm">
            Recursos relacionados usados para publicar este catalogo.
          </Text>
          <Divider my="md" />
          <Stack gap="sm">
            <Text size="sm">
              Sitio:{" "}
              {siteData.items.find((item: ResourceItem) => item.id === selectedCatalog.siteId)?.name ||
                "Sin asociar"}
            </Text>
            <Text size="sm">
              Sede:{" "}
              {locationData.items.find((item: ResourceItem) => item.id === selectedCatalog.locationId)
                ?.name || "Sin asociar"}
            </Text>
            <Text size="sm">
              Tema:{" "}
              {themeData.items.find((item: ResourceItem) => item.id === selectedCatalog.brandThemeId)
                ?.name || "Sin asociar"}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <Tags size={18} />
            <Title order={4}>Resumen de categorias</Title>
          </Group>
          <Badge variant="light">{categories.length}</Badge>
        </Group>

        {categoriesFetching ? (
          <Text c="dimmed">Actualizando categorias...</Text>
        ) : categories.length > 0 ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {categories.map((category) => (
              <Card key={category.id} withBorder radius="md" p="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={700}>{category.name}</Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      {category.description || "Sin descripcion"}
                    </Text>
                  </div>
                  <Badge color={category.isVisible ? "teal" : "gray"}>
                    {category.isVisible ? "Visible" : "Oculta"}
                  </Badge>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Alert color="gray">
            Este catalogo aun no tiene categorias. Crea una para empezar a ordenar el contenido.
          </Alert>
        )}
      </Card>
    </>
  );
}
