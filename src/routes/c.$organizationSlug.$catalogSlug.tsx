import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  createTheme,
  Group,
  Image,
  MantineProvider,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useReducedMotion } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MessageCircle, ShoppingBag, X } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";

import { orpc } from "#/orpc/client";

type BrandColorTuple = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

type CatalogColors = {
  primary: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
};

type CatalogItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  gallery?: string[] | null;
  isFeatured: boolean;
  shortDescription: string | null;
  description?: string | null;
  basePriceAmount: number | null;
};

type PublicCatalog = {
  priceDisplayMode: "hidden" | "starting_at" | "exact";
  currencyCode: string;
};

type BrandThemeConfig = {
  cardStyle: "flat" | "outlined" | "elevated" | null;
};

const publicCatalogQueryOptions = (
  organizationSlug: string,
  catalogSlug: string,
) =>
  ({
    ...orpc.operations.getPublicCatalog.queryOptions({
      input: {
        organizationSlug,
        catalogSlug,
      },
    }),
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

const formatMoney = (amount: number | null, currencyCode: string) => {
  if (amount == null) return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const Route = createFileRoute("/c/$organizationSlug/$catalogSlug")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.fetchQuery(
        publicCatalogQueryOptions(params.organizationSlug, params.catalogSlug),
      );
    } catch (error: any) {
      if (
        error?.message?.includes("No se encontró") ||
        error?.status === 404 ||
        error?.code === "NOT_FOUND"
      ) {
        throw notFound();
      }
      throw error;
    }
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `Catálogo | ${params.catalogSlug}`,
      },
    ],
  }),
  component: PublicCatalogPage,
  notFoundComponent: CatalogNotFound,
});

function CatalogNotFound() {
  return (
    <Box
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--mantine-color-warm-1)",
        color: "var(--mantine-color-dark-8)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(12rem, 30vw, 40rem)",
          fontWeight: 900,
          color: "var(--mantine-color-warm-3)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        404
      </Box>

      <Stack gap="xl" align="center" ta="center" style={{ zIndex: 1, maxWidth: 460 }}>
        <Box
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            color: "var(--mantine-color-brand-6)",
            border: "1px solid var(--mantine-color-warm-3)",
            boxShadow: "0 18px 40px rgba(94, 66, 44, 0.08)",
            marginBottom: "1rem",
            transform: "scale(1)",
            animation: "catalog-icon-bounce 2s infinite ease-in-out alternate",
          }}
        >
          <X size={36} strokeWidth={2.5} />
        </Box>

        <Title
          order={1}
          style={{
            fontSize: "clamp(2rem, 5vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            textWrap: "balance",
            color: "var(--mantine-color-dark-8)",
          }}
        >
          No encontramos este catálogo
        </Title>

        <Text
          size="lg"
          style={{
            color: "var(--mantine-color-gray-6)",
            textWrap: "pretty",
            lineHeight: 1.6,
          }}
        >
          Es posible que el enlace sea incorrecto, que el catálogo haya sido
          eliminado o que la organización ya no esté disponible.
        </Text>

        <Button
          component="a"
          href="/"
          size="lg"
          mt="md"
          variant="filled"
          style={{
            height: "3.5rem",
            padding: "0 2rem",
            transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="not-found-btn"
        >
          Volver al inicio
        </Button>
      </Stack>
      <style>{`
        @keyframes catalog-icon-bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
        .not-found-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(232, 107, 50, 0.4);
        }
        .not-found-btn:active {
          transform: translateY(1px);
        }
      `}</style>
    </Box>
  );
}

function PublicCatalogPage() {
  const params = Route.useParams();
  const reducedMotion = useReducedMotion();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const { data } = useSuspenseQuery(
    publicCatalogQueryOptions(params.organizationSlug, params.catalogSlug),
  );

  const { catalog, brandTheme, categories, items } = data;

  const itemsByCategory = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        items.filter((item) => item.categoryId === category.id),
      ]),
    );
  }, [categories, items]);

  const uncategorizedItems = useMemo(
    () => items.filter((item) => !item.categoryId),
    [items],
  );

  const colors = {
    primary: brandTheme?.primaryColor || "#09090b",
    background: brandTheme?.backgroundColor || "#fafafa",
    surface: brandTheme?.surfaceColor || "#ffffff",
    text: brandTheme?.textColor || "#18181b",
    mutedText: brandTheme?.mutedTextColor || "#71717a",
    accent: brandTheme?.accentColor || brandTheme?.primaryColor || "#3f3f46",
  };

  const getRadiusAttr = (radius: string | null | undefined) => {
    switch (radius) {
      case "none": return "0px";
      case "sm": return "4px";
      case "md": return "8px";
      case "lg": return "12px";
      case "xl": return "20px";
      case "full": return "999px";
      default: return "12px";
    }
  };

  const borderRadius = getRadiusAttr(brandTheme?.borderRadius);

  const getEnterMotionStyle = (
    index: number,
    startDelay = 120,
  ): CSSProperties => {
    if (reducedMotion) {
      return {
        opacity: 1,
        transform: "none",
      };
    }

    return {
      opacity: 0,
      transform: "translate3d(0, 18px, 0)",
      animation: "catalog-enter 620ms var(--catalog-ease-out-expo) forwards",
      animationDelay: `${startDelay + index * 90}ms`,
      willChange: "transform, opacity",
    };
  };
  
  const customTheme = createTheme({
    primaryColor: "brand",
    colors: {
      brand: [
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
        colors.primary,
      ] as BrandColorTuple,
    },
    fontFamily: brandTheme?.fontBody || "Inter, system-ui, sans-serif",
    headings: {
      fontFamily: brandTheme?.fontHeading || brandTheme?.fontBody || "Inter, system-ui, sans-serif",
    },
  });

  return (
    <MantineProvider theme={customTheme}>
      <Box
        className="catalog-page"
        mih="100dvh"
        bg={colors.background}
        style={{
          color: colors.text,
          "--catalog-radius": borderRadius,
          "--catalog-surface": colors.surface,
          "--catalog-muted": colors.mutedText,
          "--catalog-primary": colors.primary,
          "--catalog-ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
          "--catalog-ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {catalog.coverImageUrl && (
          <Box
            className="catalog-cover"
            h={{ base: 200, md: 320 }}
            w="100%"
            style={{
              backgroundImage: `url(${catalog.coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <Container
          size="md"
          py={40}
          mb={60}
          style={{
            marginTop: catalog.coverImageUrl ? -60 : 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          <Stack gap="xl">
            <Stack
              className="catalog-hero"
              gap="md"
              align="center"
              ta="center"
              mb={24}
              style={getEnterMotionStyle(0, 140)}
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

            {items.length === 0 ? (
              <Box ta="center" py={60} style={getEnterMotionStyle(1, 200)}>
                <Text size="lg" style={{ color: colors.mutedText }}>
                  Este catálogo todavía no tiene productos disponibles.
                </Text>
              </Box>
            ) : null}

            {categories.map((category, categoryIndex) => {
              const categoryItems = itemsByCategory.get(category.id) ?? [];
              if (categoryItems.length === 0) return null;

              return (
                <Stack
                  key={category.id}
                  gap="lg"
                  mt={16}
                  style={getEnterMotionStyle(categoryIndex + 1, 220)}
                >
                  <Stack gap={4}>
                    <Title order={2} size="h3" style={{ color: colors.text }}>
                      {category.name}
                    </Title>
                    {category.description && (
                      <Text size="sm" style={{ color: colors.mutedText }}>
                        {category.description}
                      </Text>
                    )}
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                    {categoryItems.map((item, itemIndex) => (
                      <CatalogItemCard
                        key={item.id}
                        item={item}
                        catalog={catalog}
                        colors={colors}
                        brandTheme={brandTheme}
                        animationIndex={categoryIndex * 3 + itemIndex}
                        reducedMotion={reducedMotion}
                        onClick={() => {
                          setSelectedItem(item);
                          open();
                        }}
                      />
                    ))}
                  </SimpleGrid>
                </Stack>
              );
            })}

            {uncategorizedItems.length > 0 && (
              <Stack gap="lg" mt={16} style={getEnterMotionStyle(categories.length + 2)}>
                <Title order={2} size="h3" style={{ color: colors.text }}>
                  Otros productos
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {uncategorizedItems.map((item, itemIndex) => (
                    <CatalogItemCard
                      key={item.id}
                      item={item}
                      catalog={catalog}
                      colors={colors}
                      brandTheme={brandTheme}
                      animationIndex={categories.length * 3 + itemIndex}
                      reducedMotion={reducedMotion}
                      onClick={() => {
                        setSelectedItem(item);
                        open();
                      }}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            )}

            <Box
              className="catalog-cta"
              mt={40}
              p="xl"
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius,
                border: `1px solid ${colors.primary}15`,
                textAlign: "center",
                ...getEnterMotionStyle(categories.length + 3, 260),
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
                  borderRadius: borderRadius,
                }}
              >
                Escribir por WhatsApp
              </Button>
            </Box>
          </Stack>
        </Container>

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
          {selectedItem && (
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
                <Box style={{ overflow: "hidden", borderRadius: borderRadius }}>
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
                
                <Button
                  component="a"
                  href={`https://wa.me/?text=${encodeURIComponent(`Hola, me interesa el producto: ${selectedItem.name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  leftSection={<ShoppingBag size={18} />}
                  style={{
                    backgroundColor: colors.primary,
                    color: "#f8f8f6",
                    borderRadius: borderRadius,
                  }}
                >
                  Pedir producto
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        <style>{`
          .catalog-cover {
            transform-origin: center;
            animation: catalog-cover-enter 900ms var(--catalog-ease-out-quart) both;
          }

          .catalog-card {
            cursor: default;
            contain: paint;
          }

          .catalog-card:hover {
            transform: translate3d(0, -6px, 0);
            box-shadow: var(--catalog-card-hover-shadow, 0 16px 32px rgba(0, 0, 0, 0.12));
          }

          .catalog-whatsapp-button {
            transition:
              transform 180ms var(--catalog-ease-out-quart),
              box-shadow 180ms var(--catalog-ease-out-quart),
              filter 180ms var(--catalog-ease-out-quart);
          }

          .catalog-whatsapp-button:hover {
            transform: translate3d(0, -2px, 0) scale(1.02);
            box-shadow: 0 14px 24px rgba(0, 0, 0, 0.16);
            filter: saturate(1.08);
          }

          .catalog-whatsapp-button:active {
            transform: translate3d(0, 0, 0) scale(0.98);
          }

          .catalog-featured-badge {
            animation: catalog-badge-in 420ms var(--catalog-ease-out-expo) both;
          }

          @keyframes catalog-enter {
            from {
              opacity: 0;
              transform: translate3d(0, 18px, 0);
            }

            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes catalog-cover-enter {
            from {
              opacity: 0;
              transform: scale(1.03);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes catalog-badge-in {
            from {
              opacity: 0;
              transform: translate3d(0, -6px, 0) scale(0.95);
            }

            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .catalog-cover,
            .catalog-featured-badge {
              animation-duration: 120ms;
            }

            .catalog-card,
            .catalog-whatsapp-button {
              transition-duration: 120ms !important;
            }

            .catalog-card:hover {
              transform: translate3d(0, -2px, 0);
            }

            .catalog-whatsapp-button:hover {
              transform: translate3d(0, -1px, 0) scale(1.01);
            }
          }
        `}</style>
      </Box>
    </MantineProvider>
  );
}

function CatalogItemCard({
  item,
  catalog,
  colors,
  brandTheme,
  animationIndex,
  reducedMotion,
  onClick,
}: {
  item: CatalogItem;
  catalog: PublicCatalog;
  colors: CatalogColors;
  brandTheme: BrandThemeConfig | null;
  animationIndex: number;
  reducedMotion: boolean;
  onClick: () => void;
}) {
  const price =
    catalog.priceDisplayMode !== "hidden"
      ? formatMoney(item.basePriceAmount, catalog.currencyCode)
    : null;

  const cardHoverShadow =
    brandTheme?.cardStyle === "flat" || brandTheme?.cardStyle === "outlined"
      ? "none"
      : "0 16px 32px rgba(0, 0, 0, 0.12)";

  return (
    <Card
      className="catalog-card"
      p="md"
      radius="var(--catalog-radius)"
      onClick={onClick}
      style={{
        cursor: "pointer",
        backgroundColor: "var(--catalog-surface)",
        border:
          brandTheme?.cardStyle === "flat"
            ? "none"
            : brandTheme?.cardStyle === "outlined"
              ? `1px solid ${colors.mutedText}25`
              : "none",
        boxShadow:
          brandTheme?.cardStyle === "elevated" || !brandTheme?.cardStyle
            ? "0 8px 30px rgba(0, 0, 0, 0.04)"
            : "none",
        "--catalog-card-hover-shadow": cardHoverShadow,
        transition:
          "transform 220ms var(--catalog-ease-out-quart), box-shadow 220ms var(--catalog-ease-out-quart)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: reducedMotion ? 1 : 0,
        transform: reducedMotion ? "none" : "translate3d(0, 14px, 0)",
        animation: reducedMotion
          ? undefined
          : "catalog-enter 520ms var(--catalog-ease-out-expo) forwards",
        animationDelay: reducedMotion ? undefined : `${260 + animationIndex * 60}ms`,
        willChange: reducedMotion ? undefined : "transform, opacity",
      }}
    >
      {item.imageUrl && (
        <Card.Section mb="sm">
          <Image
            src={item.imageUrl}
            alt={item.name}
            height={200}
            fit="cover"
            loading="lazy"
          />
        </Card.Section>
      )}

      <Stack gap={4} flex={1}>
        <Group justify="space-between" align="start" wrap="nowrap">
          <Text fw={600} size="lg" style={{ color: colors.text, lineHeight: 1.3 }}>
            {item.name}
          </Text>
          {item.isFeatured && (
            <Badge
              className="catalog-featured-badge"
              variant="filled"
              size="sm"
              style={{ backgroundColor: colors.accent, color: "#fff" }}
            >
              Destacado
            </Badge>
          )}
        </Group>

        {item.shortDescription && (
          <Text
            size="sm"
            lineClamp={2}
            style={{ color: colors.mutedText, marginTop: 4 }}
          >
            {item.shortDescription}
          </Text>
        )}
      </Stack>

      {price && (
        <Text fw={700} size="xl" mt="xl" style={{ color: colors.primary }}>
          {catalog.priceDisplayMode === "starting_at" ? `Desde ${price}` : price}
        </Text>
      )}
    </Card>
  );
}
