import {
  Box,
  Container,
  createTheme,
  MantineProvider,
  Text,
  Stack,
} from "@mantine/core";
import { useDisclosure, useReducedMotion } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  type BrandColorTuple,
  CatalogCTA,
  CatalogHero,
  type CatalogItem,
  CatalogNotFound,
  CategorySection,
  getEnterMotionStyle,
  getRadiusAttr,
  ProductModal,
} from "#/components/catalog";
import { orpc } from "#/orpc/client";

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

  const borderRadius = getRadiusAttr(brandTheme?.borderRadius);

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

  const handleItemClick = (item: CatalogItem) => {
    setSelectedItem(item);
    open();
  };

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
            <CatalogHero 
              catalog={catalog} 
              colors={colors} 
              reducedMotion={!!reducedMotion} 
            />

            {items.length === 0 ? (
              <Box ta="center" py={60} style={getEnterMotionStyle(1, !!reducedMotion, 200)}>
                <Text size="lg" style={{ color: colors.mutedText }}>
                  Este catálogo todavía no tiene productos disponibles.
                </Text>
              </Box>
            ) : null}

            {categories.map((category, categoryIndex) => {
              const categoryItems = itemsByCategory.get(category.id) ?? [];
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  catalog={catalog}
                  colors={colors}
                  brandTheme={brandTheme}
                  categoryIndex={categoryIndex}
                  reducedMotion={!!reducedMotion}
                  onItemClick={handleItemClick}
                />
              );
            })}

            <CategorySection
              category={null}
              items={uncategorizedItems}
              catalog={catalog}
              colors={colors}
              brandTheme={brandTheme}
              categoryIndex={categories.length}
              reducedMotion={!!reducedMotion}
              onItemClick={handleItemClick}
            />

            <CatalogCTA 
              colors={colors} 
              borderRadius={borderRadius} 
              animationIndex={categories.length + 3} 
              reducedMotion={!!reducedMotion} 
            />
          </Stack>
        </Container>

        <ProductModal
          opened={opened}
          close={close}
          selectedItem={selectedItem}
          catalog={catalog}
          colors={colors}
          borderRadius={borderRadius}
        />

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
            from { opacity: 0; transform: translate3d(0, 18px, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
          }

          @keyframes catalog-cover-enter {
            from { opacity: 0; transform: scale(1.03); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes catalog-badge-in {
            from { opacity: 0; transform: translate3d(0, -6px, 0) scale(0.95); }
            to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          }

          @media (prefers-reduced-motion: reduce) {
            .catalog-cover, .catalog-featured-badge { animation-duration: 120ms; }
            .catalog-card, .catalog-whatsapp-button { transition-duration: 120ms !important; }
            .catalog-card:hover { transform: translate3d(0, -2px, 0); }
            .catalog-whatsapp-button:hover { transform: translate3d(0, -1px, 0) scale(1.01); }
          }
        `}</style>
      </Box>
    </MantineProvider>
  );
}

