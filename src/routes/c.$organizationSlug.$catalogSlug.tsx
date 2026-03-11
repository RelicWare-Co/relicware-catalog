import {
  Box,
  Container,
  createTheme,
  MantineProvider,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { useDisclosure, useReducedMotion } from "@mantine/hooks";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  const [isEntering, setIsEntering] = useState(true);

  const { data } = useSuspenseQuery(
    publicCatalogQueryOptions(params.organizationSlug, params.catalogSlug),
  );

  const { catalog, brandTheme, categories, items } = data;

  useEffect(() => {
    // Hold the entry animation for a brief moment, then fade out
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [items]);

  const itemsByCategory = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        sortedItems.filter((item) => item.categoryId === category.id),
      ]),
    );
  }, [categories, sortedItems]);

  const uncategorizedItems = useMemo(
    () => sortedItems.filter((item) => !item.categoryId),
    [sortedItems],
  );

  const parentCategories = useMemo(
    () => categories.filter((c: any) => !c.parentCategoryId),
    [categories],
  );

  const subCategoriesByParent = useMemo(() => {
    const map = new Map<string, any[]>();
    categories.forEach((c: any) => {
      if (c.parentCategoryId) {
        if (!map.has(c.parentCategoryId)) map.set(c.parentCategoryId, []);
        map.get(c.parentCategoryId)!.push(c);
      }
    });
    return map;
  }, [categories]);

  const colors = {
    primary: brandTheme?.primaryColor || "#09090b",
    background: brandTheme?.backgroundColor || "#fafafa",
    gradientBackgroundColor: brandTheme?.gradientBackgroundColor || "",
    gradientDirection: brandTheme?.gradientDirection || "none",
    surface: brandTheme?.surfaceColor || "#ffffff",
    mutedText: brandTheme?.mutedTextColor || "#71717a",
    accent: brandTheme?.accentColor || brandTheme?.primaryColor || "#3f3f46",
    // Determinamos un color de texto dinámico basado en el fondo para garantizar contraste, o simplemente oscuro
    text: "#18181b", 
  };

  const getFontFamily = (font: string | undefined | null) => {
    switch (font) {
      case "serif": return "Georgia, serif";
      case "mono": return "'Courier New', Courier, monospace";
      case "rounded": return "ui-rounded, 'SF Pro Rounded', system-ui";
      default: return "Inter, system-ui, sans-serif";
    }
  };

  const borderRadius = getRadiusAttr(brandTheme?.borderRadius);

  const customTheme = createTheme({
    primaryColor: "brand",
    colors: {
      brand: [
        colors.primary, colors.primary, colors.primary, colors.primary,
        colors.primary, colors.primary, colors.primary, colors.primary,
        colors.primary, colors.primary,
      ] as BrandColorTuple,
    },
    fontFamily: getFontFamily(brandTheme?.fontHeading),
    headings: {
      fontFamily: getFontFamily(brandTheme?.fontHeading),
    },
  });

  const hasGradient = colors.gradientBackgroundColor && colors.gradientDirection !== "none";
  let backgroundImage = "none";
  if (hasGradient) {
    if (colors.gradientDirection === "vertical") {
      backgroundImage = `linear-gradient(to bottom, ${colors.background}, ${colors.gradientBackgroundColor})`;
    } else if (colors.gradientDirection === "horizontal") {
      backgroundImage = `linear-gradient(to right, ${colors.background}, ${colors.gradientBackgroundColor})`;
    } else if (colors.gradientDirection === "diagonal") {
      backgroundImage = `linear-gradient(135deg, ${colors.background}, ${colors.gradientBackgroundColor})`;
    }
  }

  const handleItemClick = (item: CatalogItem) => {
    setSelectedItem(item);
    open();
  };

  return (
    <MantineProvider theme={customTheme}>
      <style>{`
        .catalog-card {
          transition: all 300ms cubic-bezier(0.25, 1, 0.5, 1) !important;
          backdrop-filter: blur(16px);
          background-color: color-mix(in srgb, var(--catalog-surface) 85%, transparent) !important;
        }
        .catalog-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
          z-index: 2;
        }
        .catalog-card-image-wrapper {
          overflow: hidden;
        }
        .catalog-card-image-wrapper img {
          transition: transform 500ms ease !important;
        }
        .catalog-card:hover .catalog-card-image-wrapper img {
          transform: scale(1.08) !important;
        }
        .catalog-category-header {
          position: sticky;
          top: 4.5rem;
          z-index: 40;
        }
        
        .catalog-card-responsive {
          display: flex !important;
          flex-direction: row !important;
          align-items: stretch;
          padding: 0.75rem !important;
          height: auto !important;
        }
        .catalog-card-responsive .catalog-card-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }
        .catalog-card-responsive .catalog-card-image-section {
          margin-bottom: 0 !important;
          margin-right: 1rem;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: var(--catalog-radius);
          overflow: hidden;
        }
        .catalog-card-responsive .catalog-card-image-section img {
          height: 100px !important;
        }
        
        @media (min-width: 48em) {
          .catalog-card-responsive {
            flex-direction: column !important;
            padding: 1rem !important;
            height: 100% !important;
          }
          .catalog-card-responsive .catalog-card-image-section {
            margin-right: 0;
            margin-bottom: 1rem !important;
            width: auto;
            height: 220px;
            border-radius: 0;
          }
          .catalog-card-responsive .catalog-card-image-section img {
            height: 220px !important;
          }
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--catalog-background, #fff);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 800ms cubic-bezier(0.25, 1, 0.5, 1), transform 800ms cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 1;
        }

        .loading-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
          transform: scale(1.05);
        }

        .loading-text {
          opacity: 0;
          transform: translateY(20px);
          animation: fade-up 600ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .loading-text-1 {
          animation-delay: 200ms;
          margin-bottom: 8px;
        }
        .loading-text-2 {
          animation-delay: 600ms;
        }

        @keyframes fade-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .catalog-page-content {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 800ms ease, transform 800ms ease;
        }
        .catalog-page-content.is-loaded {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <Box
        className="catalog-page"
        mih="100dvh"
        style={{
          backgroundColor: colors.background,
          backgroundImage: backgroundImage,
          backgroundAttachment: "fixed",
          color: colors.text,
          "--catalog-radius": borderRadius,
          "--catalog-surface": colors.surface,
          "--catalog-muted": colors.mutedText,
          "--catalog-primary": colors.primary,
          "--catalog-ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
          "--catalog-ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
          "--catalog-background": colors.background,
        }}
      >
        <div className={`loading-overlay ${!isEntering ? 'fade-out' : ''}`}>
          <Text className="loading-text loading-text-1" size="xl" fw={600} style={{ color: colors.mutedText, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {params.organizationSlug.replace(/-/g, " ")}
          </Text>
          <Text className="loading-text loading-text-2" fz={{ base: "3xl", md: "5xl" }} fw={900} style={{ color: colors.text, textAlign: "center", lineHeight: 1.1 }}>
            {catalog.name}
          </Text>
          <Box mt={30} className="loading-text loading-text-2" style={{ width: 120, height: 4, background: `color-mix(in srgb, ${colors.primary} 30%, transparent)`, borderRadius: 2, overflow: "hidden" }}>
            <Box style={{ width: "50%", height: "100%", background: colors.primary, borderRadius: 2, animation: "progress-infinite 1.5s ease-in-out infinite" }} />
          </Box>
        </div>
        <style>{`
          @keyframes progress-infinite {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
        
        <Box className={`catalog-page-content ${!isEntering ? 'is-loaded' : ''}`}>
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
            ) : (
              <Tabs
                variant="pills"
                defaultValue={parentCategories.length > 0 ? parentCategories[0].id : "uncategorized"}
                color={colors.primary}
                radius={borderRadius}
                keepMounted={false}
              >
                {(parentCategories.length + (uncategorizedItems.length > 0 ? 1 : 0)) > 1 && (
                  <Box
                    style={{
                      position: "sticky",
                      top: "1rem",
                      zIndex: 50,
                      background: `color-mix(in srgb, ${colors.surface} 85%, transparent)`,
                      backdropFilter: "blur(12px)",
                      padding: "0.5rem",
                      borderRadius: "999px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      border: brandTheme?.cardStyle === "outlined" ? `1px solid ${colors.mutedText}25` : "none",
                    }}
                    mb="xl"
                  >
                    <ScrollArea type="never">
                      <Tabs.List style={{ flexWrap: "nowrap", gap: "0.5rem" }}>
                        {parentCategories.map((category: any) => (
                          <Tabs.Tab
                            key={category.id}
                            value={category.id}
                            style={{ transition: "all 0.2s", fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {category.name}
                          </Tabs.Tab>
                        ))}
                        {uncategorizedItems.length > 0 && (
                          <Tabs.Tab
                            value="uncategorized"
                            style={{ transition: "all 0.2s", fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            Otros productos
                          </Tabs.Tab>
                        )}
                      </Tabs.List>
                    </ScrollArea>
                  </Box>
                )}

                {parentCategories.map((category: any, categoryIndex: number) => {
                  const categoryItems = itemsByCategory.get(category.id) ?? [];
                  const subCats = subCategoriesByParent.get(category.id) ?? [];
                  return (
                    <Tabs.Panel key={category.id} value={category.id}>
                      {/* Mostrar primero los items de la categoría padre */}
                      <CategorySection
                        category={category}
                        items={categoryItems}
                        catalog={catalog}
                        colors={colors}
                        brandTheme={brandTheme}
                        categoryIndex={categoryIndex}
                        reducedMotion={!!reducedMotion}
                        onItemClick={handleItemClick}
                        hideHeader={true}
                      />
                      {/* Luego iterar sobre subcategorías y sus items */}
                      {subCats.map((subCat, subIndex) => {
                        const subCatItems = itemsByCategory.get(subCat.id) ?? [];
                        if (subCatItems.length === 0) return null;
                        return (
                          <CategorySection
                            key={subCat.id}
                            category={subCat}
                            items={subCatItems}
                            catalog={catalog}
                            colors={colors}
                            brandTheme={brandTheme}
                            categoryIndex={categoryIndex + subIndex + 1}
                            reducedMotion={!!reducedMotion}
                            onItemClick={handleItemClick}
                            hideHeader={false}
                          />
                        );
                      })}
                    </Tabs.Panel>
                  );
                })}

                {uncategorizedItems.length > 0 && (
                  <Tabs.Panel value="uncategorized">
                    <CategorySection
                      category={null}
                      items={uncategorizedItems}
                      catalog={catalog}
                      colors={colors}
                      brandTheme={brandTheme}
                      categoryIndex={categories.length}
                      reducedMotion={!!reducedMotion}
                      onItemClick={handleItemClick}
                      hideHeader={true}
                    />
                  </Tabs.Panel>
                )}
              </Tabs>
            )}

            <CatalogCTA 
              colors={colors} 
              borderRadius={borderRadius} 
              animationIndex={categories.length + 3} 
              reducedMotion={!!reducedMotion} 
              // biome-ignore lint/suspicious/noExplicitAny: styleOverrides is JSON
              whatsappEnabled={((brandTheme?.styleOverrides as any)?.whatsappEnabled) ?? true}
              coverImageUrl={catalog.coverImageUrl}
              catalogName={catalog.name}
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
          // biome-ignore lint/suspicious/noExplicitAny: styleOverrides is JSON
          whatsappEnabled={((brandTheme?.styleOverrides as any)?.whatsappEnabled) ?? true}
        />
        </Box>

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

