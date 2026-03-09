import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, FolderPlus, Plus } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

import {
  type CatalogFormValues,
  CatalogList,
  type CategoryFormValues,
  CreateCatalogModal,
  CreateCategoryModal,
  EditCatalogModal,
} from "#/components/dashboard/catalogs";
import { authClient } from "#/lib/auth-client";
import { getPublicCatalogUrl } from "#/lib/catalog-links";
import { getErrorMessage } from "#/lib/get-error-message";
import { orpc } from "#/orpc/client";

const listInput = { limit: 50, offset: 0 } as const;
const catalogListQueryOptions = () =>
  orpc.catalog.list.queryOptions({ input: listInput });
const siteListQueryOptions = () =>
  orpc.site.list.queryOptions({ input: listInput });
const themeListQueryOptions = () =>
  orpc.site.listThemes.queryOptions({ input: listInput });
const locationListQueryOptions = () =>
  orpc.operations.listLocations.queryOptions({ input: listInput });
const categoryListQueryOptions = (catalogId: string) =>
  orpc.catalog.listCategories.queryOptions({ input: { id: catalogId } });

export const Route = createFileRoute("/dashboard/catalogs")({
  validateSearch: (search: Record<string, unknown>) => ({
    catalogId:
      typeof search.catalogId === "string" ? search.catalogId : undefined,
  }),
  loaderDeps: ({ search }) => ({ catalogId: search.catalogId }),
  loader: async ({ context, deps }) => {
    const [catalogs] = await Promise.all([
      context.queryClient.ensureQueryData(catalogListQueryOptions()),
      context.queryClient.ensureQueryData(siteListQueryOptions()),
      context.queryClient.ensureQueryData(themeListQueryOptions()),
      context.queryClient.ensureQueryData(locationListQueryOptions()),
    ]);

    const selectedCatalogId = deps.catalogId ?? catalogs.items[0]?.id;

    if (selectedCatalogId) {
      await context.queryClient.ensureQueryData(
        categoryListQueryOptions(selectedCatalogId),
      );
    }
  },
  component: CatalogsPage,
});

function CatalogsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: catalogData } = useSuspenseQuery(catalogListQueryOptions());
  const { data: siteData } = useSuspenseQuery(siteListQueryOptions());
  const { data: themeData } = useSuspenseQuery(themeListQueryOptions());
  const { data: locationData } = useSuspenseQuery(locationListQueryOptions());
  const catalogs = catalogData.items;
  const selectedCatalogId = search.catalogId ?? catalogs[0]?.id ?? null;
  const selectedCatalog =
    catalogs.find((catalog) => catalog.id === selectedCatalogId) ?? null;
  const categoriesQuery = useQuery({
    ...categoryListQueryOptions(selectedCatalogId ?? ""),
    enabled: Boolean(selectedCatalogId),
  });
  const [catalogModalOpened, catalogModal] = useDisclosure(false);
  const [categoryModalOpened, categoryModal] = useDisclosure(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const categories = categoriesQuery.data ?? [];

  const catalogForm = useForm<CatalogFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      description: "",
      currencyCode: "COP",
      status: "draft",
      priceDisplayMode: "exact",
      siteId: "",
      locationId: "",
      brandThemeId: "",
      isPublic: true,
    },
    validate: {
      name: (value) =>
        value.trim().length >= 2 ? null : "Ingresa un nombre valido",
      currencyCode: (value) =>
        value.trim().length === 3
          ? null
          : "Usa un codigo de moneda de 3 letras",
    },
  });

  const categoryForm = useForm<CategoryFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      description: "",
      parentCategoryId: "",
      isVisible: true,
    },
    validate: {
      name: (value) =>
        value.trim().length >= 2 ? null : "Ingresa un nombre de categoria",
    },
  });

  const invalidateCatalogs = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.catalog.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.organization.key() }),
    ]);
  };

  const catalogMutation = useMutation(
    orpc.catalog.create.mutationOptions({
      onSuccess: async (created) => {
        await invalidateCatalogs();
        setCatalogError(null);
        setEditingCatalogId(null);
        catalogModal.close();
        startTransition(() => {
          navigate({
            search: (previous) => ({ ...previous, catalogId: created.id }),
          });
        });
      },
      onError: (error) => {
        setCatalogError(getErrorMessage(error, "No se pudo crear el catalogo"));
      },
    }),
  );

  const updateCatalogMutation = useMutation(
    orpc.catalog.update.mutationOptions({
      onSuccess: async () => {
        await invalidateCatalogs();
        setCatalogError(null);
        setEditingCatalogId(null);
        catalogModal.close();
      },
      onError: (error) => {
        setCatalogError(
          getErrorMessage(error, "No se pudo actualizar el catalogo"),
        );
      },
    }),
  );

  const createCategoryMutation = useMutation(
    orpc.catalog.createCategory.mutationOptions({
      onSuccess: async () => {
        if (selectedCatalogId) {
          await queryClient.invalidateQueries({
            queryKey: orpc.catalog.listCategories.queryKey({
              input: { id: selectedCatalogId },
            }),
          });
        }
        setCategoryError(null);
        categoryModal.close();
      },
      onError: (error) => {
        setCategoryError(
          getErrorMessage(error, "No se pudo crear la categoria"),
        );
      },
    }),
  );

  const openCreateCatalog = () => {
    setCatalogError(null);
    setEditingCatalogId(null);
    catalogForm.setValues({
      name: "",
      description: "",
      currencyCode: "COP",
      status: "draft",
      priceDisplayMode: "exact",
      siteId: "",
      locationId: "",
      brandThemeId: "",
      isPublic: true,
    });
    catalogModal.open();
  };

  const openEditCatalog = () => {
    if (!selectedCatalog) {
      return;
    }

    setCatalogError(null);
    setEditingCatalogId(selectedCatalog.id);
    catalogForm.setValues({
      name: selectedCatalog.name,
      description: selectedCatalog.description ?? "",
      currencyCode: selectedCatalog.currencyCode,
      status: selectedCatalog.status,
      priceDisplayMode: selectedCatalog.priceDisplayMode,
      siteId: selectedCatalog.siteId ?? "",
      locationId: selectedCatalog.locationId ?? "",
      brandThemeId: selectedCatalog.brandThemeId ?? "",
      isPublic: selectedCatalog.isPublic,
    });
    catalogModal.open();
  };

  const openCreateCategory = () => {
    setCategoryError(null);
    categoryForm.setValues({
      name: "",
      description: "",
      parentCategoryId: "",
      isVisible: true,
    });
    categoryModal.open();
  };

  const handleCatalogSubmit = catalogForm.onSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      currencyCode: values.currencyCode.trim().toUpperCase(),
      status: values.status as "draft" | "active" | "archived",
      priceDisplayMode: values.priceDisplayMode as
        | "exact"
        | "starting_at"
        | "hidden",
      siteId: values.siteId || null,
      locationId: values.locationId || null,
      brandThemeId: values.brandThemeId || null,
      isPublic: values.isPublic,
    };

    if (editingCatalogId) {
      await updateCatalogMutation.mutateAsync({
        id: editingCatalogId,
        ...payload,
      });
      return;
    }

    await catalogMutation.mutateAsync(payload);
  });

  const handleCategorySubmit = categoryForm.onSubmit(async (values) => {
    if (!selectedCatalogId) {
      setCategoryError("Selecciona un catalogo antes de crear categorias");
      return;
    }

    await createCategoryMutation.mutateAsync({
      catalogId: selectedCatalogId,
      name: values.name.trim(),
      description: values.description.trim() || null,
      parentCategoryId: values.parentCategoryId || null,
      isVisible: values.isVisible,
    });
  });

  const catalogOptions = catalogs.map((catalog) => ({
    value: catalog.id,
    label: catalog.name,
  }));
  const siteOptions = siteData.items.map((site) => ({
    value: site.id,
    label: site.name,
  }));
  const locationOptions = locationData.items.map((location) => ({
    value: location.id,
    label: location.name,
  }));
  const themeOptions = themeData.items.map((theme) => ({
    value: theme.id,
    label: theme.name,
  }));
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const publicCatalogUrl =
    hasHydrated && activeOrganization?.slug && selectedCatalog?.slug
      ? getPublicCatalogUrl(activeOrganization.slug, selectedCatalog.slug)
      : null;

  const handleCopyCatalogLink = async () => {
    if (!publicCatalogUrl) {
      setShareFeedback(
        "Este catálogo todavía no tiene un enlace público listo.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(publicCatalogUrl);
      setShareFeedback("Link copiado al portapapeles.");
    } catch {
      setShareFeedback(
        "No se pudo copiar automáticamente. Abre el catálogo y copia la URL manualmente.",
      );
    }
  };

  return (
    <Stack gap="xl">
      {editingCatalogId ? (
        <EditCatalogModal
          opened={catalogModalOpened}
          onClose={catalogModal.close}
          form={catalogForm}
          onSubmit={handleCatalogSubmit}
          error={catalogError}
          isSubmitting={updateCatalogMutation.isPending}
          siteOptions={siteOptions}
          locationOptions={locationOptions}
          themeOptions={themeOptions}
        />
      ) : (
        <CreateCatalogModal
          opened={catalogModalOpened}
          onClose={catalogModal.close}
          form={catalogForm}
          onSubmit={handleCatalogSubmit}
          error={catalogError}
          isSubmitting={catalogMutation.isPending}
          siteOptions={siteOptions}
          locationOptions={locationOptions}
          themeOptions={themeOptions}
        />
      )}

      <CreateCategoryModal
        opened={categoryModalOpened}
        onClose={categoryModal.close}
        form={categoryForm}
        onSubmit={handleCategorySubmit}
        error={categoryError}
        isSubmitting={createCategoryMutation.isPending}
        categoryOptions={categoryOptions}
      />

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
            Catalogos
          </Title>
          <Text c="dimmed" mt={4}>
            Administra catalogos, temas asociados y la estructura de categorias.
          </Text>
        </div>

        <Group>
          <Button
            variant="default"
            onClick={handleCopyCatalogLink}
            disabled={!publicCatalogUrl}
          >
            <Group gap={8} wrap="nowrap">
              <Copy size={16} />
              <span>Copiar link</span>
            </Group>
          </Button>
          <Button variant="light" color="brand.6" onClick={openCreateCatalog}>
            <Group gap={8} wrap="nowrap">
              <FolderPlus size={16} />
              <span>Nuevo catalogo</span>
            </Group>
          </Button>
          <Button
            color="brand.6"
            onClick={openEditCatalog}
            disabled={!selectedCatalog}
          >
            Editar catalogo
          </Button>
        </Group>
      </Group>

      {shareFeedback ? <Alert color="blue">{shareFeedback}</Alert> : null}

      <Card withBorder radius="lg" p="lg">
        <Group align="end">
          <Select
            id="catalog-active-select"
            label="Catalogo activo"
            placeholder="Selecciona un catalogo"
            data={catalogOptions}
            value={selectedCatalogId}
            allowDeselect={false}
            onChange={(value) => {
              startTransition(() => {
                navigate({
                  search: (previous) => ({
                    ...previous,
                    catalogId: value ?? undefined,
                  }),
                });
              });
            }}
            style={{ flex: 1 }}
          />
          <Button
            variant="default"
            onClick={openCreateCategory}
            disabled={!selectedCatalogId}
          >
            <Group gap={8} wrap="nowrap">
              <Plus size={16} />
              <span>Nueva categoria</span>
            </Group>
          </Button>
        </Group>

        {publicCatalogUrl ? (
          <Text size="sm" c="dimmed" mt="md">
            Enlace público: {publicCatalogUrl}
          </Text>
        ) : null}
      </Card>

      <CatalogList
        selectedCatalog={selectedCatalog}
        categories={categories}
        siteData={siteData}
        locationData={locationData}
        themeData={themeData}
        categoriesFetching={categoriesQuery.isFetching}
      />
    </Stack>
  );
}
