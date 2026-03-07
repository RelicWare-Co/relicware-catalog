import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
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
import { Copy, FolderPlus, Layers3, Plus, Tags } from "lucide-react";
import { startTransition, useState } from "react";

import { authClient } from "#/lib/auth-client";
import { getPublicCatalogUrl } from "#/lib/catalog-links";
import { getErrorMessage } from "#/lib/get-error-message";
import { orpc } from "#/orpc/client";

const listInput = { limit: 50, offset: 0 } as const;
const catalogListQueryOptions = () => orpc.catalog.list.queryOptions({ input: listInput });
const siteListQueryOptions = () => orpc.site.list.queryOptions({ input: listInput });
const themeListQueryOptions = () =>
  orpc.site.listThemes.queryOptions({ input: listInput });
const locationListQueryOptions = () =>
  orpc.operations.listLocations.queryOptions({ input: listInput });
const categoryListQueryOptions = (catalogId: string) =>
  orpc.catalog.listCategories.queryOptions({ input: { id: catalogId } });

const catalogStatusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "archived", label: "Archivado" },
] as const;

const priceDisplayModeOptions = [
  { value: "exact", label: "Precio exacto" },
  { value: "starting_at", label: "Desde" },
  { value: "hidden", label: "Ocultar precios" },
] as const;

export const Route = createFileRoute("/dashboard/catalogs")({
  validateSearch: (search: Record<string, unknown>) => ({
    catalogId: typeof search.catalogId === "string" ? search.catalogId : undefined,
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

type CatalogFormValues = {
  name: string;
  description: string;
  currencyCode: string;
  status: string;
  priceDisplayMode: string;
  siteId: string;
  locationId: string;
  brandThemeId: string;
  isPublic: boolean;
};

type CategoryFormValues = {
  name: string;
  description: string;
  parentCategoryId: string;
  isVisible: boolean;
};

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
  const categories = categoriesQuery.data ?? [];
  const [catalogModalOpened, catalogModal] = useDisclosure(false);
  const [categoryModalOpened, categoryModal] = useDisclosure(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);

  const catalogForm = useForm<CatalogFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      description: "",
      currencyCode: "MXN",
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
        value.trim().length === 3 ? null : "Usa un codigo de moneda de 3 letras",
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
      currencyCode: "MXN",
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
      await updateCatalogMutation.mutateAsync({ id: editingCatalogId, ...payload });
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
    activeOrganization?.slug && selectedCatalog?.slug
      ? getPublicCatalogUrl(activeOrganization.slug, selectedCatalog.slug)
      : null;

  const handleCopyCatalogLink = async () => {
    if (!publicCatalogUrl) {
      setShareFeedback("Este catálogo todavía no tiene un enlace público listo.");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicCatalogUrl);
      setShareFeedback("Link copiado al portapapeles.");
    } catch {
      setShareFeedback("No se pudo copiar automáticamente. Abre el catálogo y copia la URL manualmente.");
    }
  };

  return (
    <Stack gap="xl">
      <Modal
        opened={catalogModalOpened}
        onClose={catalogModal.close}
        title={editingCatalogId ? "Editar catalogo" : "Nuevo catalogo"}
        size="lg"
        radius="lg"
        centered
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
      >
        <form onSubmit={handleCatalogSubmit}>
          <Stack gap="md">
            {catalogError ? <Alert color="red">{catalogError}</Alert> : null}

            <TextInput
              label="Nombre"
              placeholder="Ej: Menu principal"
              key={catalogForm.key("name")}
              {...catalogForm.getInputProps("name")}
            />

            <TextInput
              label="Descripcion"
              placeholder="Que vende este catalogo"
              key={catalogForm.key("description")}
              {...catalogForm.getInputProps("description")}
            />

            <Group grow align="flex-start">
              <TextInput
                label="Moneda"
                placeholder="MXN"
                maxLength={3}
                key={catalogForm.key("currencyCode")}
                {...catalogForm.getInputProps("currencyCode")}
              />

              <Select
                label="Estado"
                data={catalogStatusOptions}
                allowDeselect={false}
                key={catalogForm.key("status")}
                {...catalogForm.getInputProps("status")}
              />
            </Group>

            <Select
              label="Modo de precio"
              data={priceDisplayModeOptions}
              allowDeselect={false}
              key={catalogForm.key("priceDisplayMode")}
              {...catalogForm.getInputProps("priceDisplayMode")}
            />

            <Group grow>
              <Select
                clearable
                label="Sitio asociado"
                data={siteOptions}
                key={catalogForm.key("siteId")}
                {...catalogForm.getInputProps("siteId")}
              />
              <Select
                clearable
                label="Sede"
                data={locationOptions}
                key={catalogForm.key("locationId")}
                {...catalogForm.getInputProps("locationId")}
              />
            </Group>

            <Select
              clearable
              label="Tema de marca"
              data={themeOptions}
              key={catalogForm.key("brandThemeId")}
              {...catalogForm.getInputProps("brandThemeId")}
            />

            <Switch
              label="Visible al publico"
              key={catalogForm.key("isPublic")}
              {...catalogForm.getInputProps("isPublic", { type: "checkbox" })}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={catalogModal.close}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color="brand.6"
                loading={catalogMutation.isPending || updateCatalogMutation.isPending}
              >
                {editingCatalogId ? "Guardar cambios" : "Crear catalogo"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={categoryModalOpened}
        onClose={categoryModal.close}
        title="Nueva categoria"
        radius="lg"
        centered
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
      >
        <form onSubmit={handleCategorySubmit}>
          <Stack gap="md">
            {categoryError ? <Alert color="red">{categoryError}</Alert> : null}

            <TextInput
              label="Nombre"
              placeholder="Ej: Bebidas frias"
              key={categoryForm.key("name")}
              {...categoryForm.getInputProps("name")}
            />

            <TextInput
              label="Descripcion"
              placeholder="Opcional"
              key={categoryForm.key("description")}
              {...categoryForm.getInputProps("description")}
            />

            <Select
              clearable
              label="Categoria padre"
              data={categoryOptions}
              key={categoryForm.key("parentCategoryId")}
              {...categoryForm.getInputProps("parentCategoryId")}
            />

            <Switch
              label="Visible en el catalogo"
              key={categoryForm.key("isVisible")}
              {...categoryForm.getInputProps("isVisible", { type: "checkbox" })}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={categoryModal.close}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color="brand.6"
                loading={createCategoryMutation.isPending}
              >
                Crear categoria
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

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
            label="Catalogo activo"
            placeholder="Selecciona un catalogo"
            data={catalogOptions}
            value={selectedCatalogId}
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

      {selectedCatalog ? (
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
                Sitio: {siteData.items.find((item) => item.id === selectedCatalog.siteId)?.name || "Sin asociar"}
              </Text>
              <Text size="sm">
                Sede: {locationData.items.find((item) => item.id === selectedCatalog.locationId)?.name || "Sin asociar"}
              </Text>
              <Text size="sm">
                Tema: {themeData.items.find((item) => item.id === selectedCatalog.brandThemeId)?.name || "Sin asociar"}
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>
      ) : (
        <Alert color="gray">No hay catalogos creados todavia. Crea uno para empezar.</Alert>
      )}

      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <Tags size={18} />
            <Title order={4}>Resumen de categorias</Title>
          </Group>
          <Badge variant="light">{categories.length}</Badge>
        </Group>

        {categoriesQuery.isFetching ? (
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
            Este catalogo aun no tiene categorias. Crea una para empezar a ordenar
            el contenido.
          </Alert>
        )}
      </Card>
    </Stack>
  );
}
