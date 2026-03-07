import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CircleAlert, MapPin, MessageCircle, Sparkles } from "lucide-react";

import { orpc } from "#/orpc/client";

const publicCatalogQueryOptions = (
  organizationSlug: string,
  catalogSlug: string,
) =>
  orpc.operations.getPublicCatalog.queryOptions({
    input: {
      organizationSlug,
      catalogSlug,
    },
  });

const formatMoney = (amount: number | null, currencyCode: string) => {
  if (amount === null) {
    return null;
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const Route = createFileRoute("/c/$organizationSlug/$catalogSlug")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      publicCatalogQueryOptions(params.organizationSlug, params.catalogSlug),
    );
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `Catálogo | ${params.catalogSlug}`,
      },
    ],
  }),
  component: PublicCatalogPage,
});

function PublicCatalogPage() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(
    publicCatalogQueryOptions(params.organizationSlug, params.catalogSlug),
  );

  const categories = data.categories;
  const itemsByCategory = new Map(
    categories.map((category) => [
      category.id,
      data.items.filter((item) => item.categoryId === category.id),
    ]),
  );
  const uncategorizedItems = data.items.filter((item) => !item.categoryId);

  return (
    <Box
      mih="100dvh"
      py={{ base: 40, md: 72 }}
      style={{
        background:
          "radial-gradient(circle at top, rgba(250, 227, 213, 0.8), transparent 28%), linear-gradient(180deg, #fffdfa 0%, #f9f6f0 100%)",
      }}
    >
      <Container size="lg">
        <Stack gap="xl">
          <Group justify="space-between" align="flex-start">
            <Stack gap="sm">
              <Button
                component={Link}
                to="/"
                variant="subtle"
                color="dark"
                leftSection={<ArrowLeft size={16} />}
                px={0}
                style={{ alignSelf: "flex-start" }}
              >
                Volver al inicio
              </Button>

              <Group gap="xs">
                <Badge color="brand" variant="light">
                  Catálogo público
                </Badge>
                <Badge color="gray" variant="light">
                  {data.catalog.currencyCode}
                </Badge>
              </Group>

              <Title
                order={1}
                style={{
                  letterSpacing: "-0.04em",
                  fontSize: "clamp(2.4rem, 6vw, 4.6rem)",
                }}
              >
                {data.catalog.name}
              </Title>

              <Text c="dimmed" maw={760} size="lg">
                {data.catalog.description ||
                  "Consulta los productos disponibles y comparte este enlace con tus clientes."}
              </Text>
            </Stack>

            <Card
              withBorder
              radius="xl"
              p="lg"
              maw={320}
              bg="rgba(255,255,255,0.82)"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <Stack gap="sm">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon color="brand" variant="light" radius="xl">
                    <Sparkles size={16} />
                  </ThemeIcon>
                  <Text fw={700}>Información rápida</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {data.items.length} productos visibles en {categories.length}
                  {" "}
                  categorías.
                </Text>
                <Text size="sm" c="dimmed">
                  Modo de precio: {data.catalog.priceDisplayMode.replaceAll("_", " ")}
                </Text>
                {data.catalog.locationId ? (
                  <Group gap={8} wrap="nowrap">
                    <MapPin size={15} />
                    <Text size="sm" c="dimmed">
                      Catálogo asociado a una sede activa.
                    </Text>
                  </Group>
                ) : null}
              </Stack>
            </Card>
          </Group>

          {data.items.length === 0 ? (
            <Alert color="gray" radius="xl" icon={<CircleAlert size={18} />}>
              Este catálogo todavía no tiene productos públicos disponibles.
            </Alert>
          ) : null}

          {categories.map((category) => {
            const items = itemsByCategory.get(category.id) ?? [];

            if (items.length === 0) {
              return null;
            }

            return (
              <Stack key={category.id} gap="lg">
                <Stack gap={4}>
                  <Title order={2} style={{ letterSpacing: "-0.03em" }}>
                    {category.name}
                  </Title>
                  {category.description ? (
                    <Text c="dimmed">{category.description}</Text>
                  ) : null}
                </Stack>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {items.map((item) => {
                    const price = formatMoney(
                      item.basePriceAmount,
                      data.catalog.currencyCode,
                    );

                    return (
                      <Card
                        key={item.id}
                        withBorder
                        radius="xl"
                        p="lg"
                        bg="white"
                        style={{ boxShadow: "0 18px 44px rgba(160, 65, 24, 0.08)" }}
                      >
                        <Stack gap="md" h="100%">
                          {item.imageUrl ? (
                            <Box
                              h={220}
                              style={{
                                borderRadius: 20,
                                backgroundImage: `url(${item.imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundColor: "var(--mantine-color-warm-2)",
                              }}
                            />
                          ) : null}

                          <Group justify="space-between" align="flex-start">
                            <Stack gap={2} style={{ flex: 1 }}>
                              <Text fw={800} size="lg" c="dark.8">
                                {item.name}
                              </Text>
                              <Text size="sm" c="dimmed">
                                {item.shortDescription || "Sin descripción corta"}
                              </Text>
                            </Stack>

                            {item.isFeatured ? (
                              <Badge color="orange" variant="light">
                                Destacado
                              </Badge>
                            ) : null}
                          </Group>

                          {item.description ? (
                            <Text size="sm" c="dark.6">
                              {item.description}
                            </Text>
                          ) : null}

                          <Divider />

                          <Group justify="space-between" mt="auto" align="flex-end">
                            <Stack gap={0}>
                              <Text size="xs" c="dimmed">
                                Precio
                              </Text>
                              <Text fw={900} c="brand.7" size="xl">
                                {price || "Consultar"}
                              </Text>
                            </Stack>

                            <Badge color="teal" variant="light">
                              Disponible
                            </Badge>
                          </Group>
                        </Stack>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            );
          })}

          {uncategorizedItems.length > 0 ? (
            <Stack gap="lg">
              <Title order={2} style={{ letterSpacing: "-0.03em" }}>
                Más opciones
              </Title>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {uncategorizedItems.map((item) => {
                  const price = formatMoney(
                    item.basePriceAmount,
                    data.catalog.currencyCode,
                  );

                  return (
                    <Card key={item.id} withBorder radius="xl" p="lg" bg="white">
                      <Stack gap="sm">
                        <Text fw={800} size="lg">
                          {item.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {item.shortDescription || "Sin descripción corta"}
                        </Text>
                        <Text fw={900} c="brand.7">
                          {price || "Consultar"}
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ) : null}

          <Card
            withBorder
            radius="xl"
            p={{ base: "lg", md: "xl" }}
            bg="brand.0"
          >
            <Group justify="space-between" align="center">
              <Stack gap={4}>
                <Text fw={800} size="lg" c="brand.8">
                  ¿Te compartieron este catálogo?
                </Text>
                <Text c="brand.7">
                  Pide el enlace directo por WhatsApp o comparte esta página con tus clientes.
                </Text>
              </Stack>

              <Button
                component="a"
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                color="brand"
                leftSection={<MessageCircle size={16} />}
              >
                Abrir WhatsApp
              </Button>
            </Group>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}