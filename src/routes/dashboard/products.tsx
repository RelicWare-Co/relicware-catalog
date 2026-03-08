import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Menu,
  Modal,
  Select,
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
import { Edit, MoreVertical, Plus, Search, Trash } from "lucide-react";
import { startTransition, useMemo, useState } from "react";

import { getErrorMessage } from "#/lib/get-error-message";
import { orpc } from "#/orpc/client";

const listInput = { limit: 50, offset: 0 } as const;
const catalogListQueryOptions = () =>
  orpc.catalog.list.queryOptions({ input: listInput });
const categoryListQueryOptions = (catalogId: string) =>
  orpc.catalog.listCategories.queryOptions({ input: { id: catalogId } });
const itemListQueryOptions = (catalogId: string) =>
  orpc.catalog.listItems.queryOptions({ input: { id: catalogId } });

const itemStatusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "archived", label: "Archivado" },
] as const;

export const Route = createFileRoute("/dashboard/products")({
  validateSearch: (search: Record<string, unknown>) => ({
    catalogId:
      typeof search.catalogId === "string" ? search.catalogId : undefined,
    categoryId:
      typeof search.categoryId === "string" ? search.categoryId : undefined,
    status: typeof search.status === "string" ? search.status : undefined,
    term: typeof search.term === "string" ? search.term : undefined,
  }),
  loaderDeps: ({ search }) => ({ catalogId: search.catalogId }),
  loader: async ({ context, deps }) => {
    const catalogs = await context.queryClient.ensureQueryData(
      catalogListQueryOptions(),
    );
    const selectedCatalogId = deps.catalogId ?? catalogs.items[0]?.id;

    if (selectedCatalogId) {
      await Promise.all([
        context.queryClient.ensureQueryData(
          categoryListQueryOptions(selectedCatalogId),
        ),
        context.queryClient.ensureQueryData(
          itemListQueryOptions(selectedCatalogId),
        ),
      ]);
    }
  },
  component: ProductsPage,
});

type FilterFormValues = {
  term: string;
  categoryId: string;
  status: string;
};

type ProductFormValues = {
  name: string;
  categoryId: string;
  shortDescription: string;
  imageUrl: string;
  status: string;
  basePriceAmount: string;
  inventoryQuantity: string;
  isAvailable: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
};

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { data: catalogData } = useSuspenseQuery(catalogListQueryOptions());
  const catalogs = catalogData.items;
  const selectedCatalogId = search.catalogId ?? catalogs[0]?.id ?? null;
  const selectedCatalog =
    catalogs.find((catalog) => catalog.id === selectedCatalogId) ?? null;
  const categoriesQuery = useQuery({
    ...categoryListQueryOptions(selectedCatalogId ?? ""),
    enabled: Boolean(selectedCatalogId),
  });
  const itemsQuery = useQuery({
    ...itemListQueryOptions(selectedCatalogId ?? ""),
    enabled: Boolean(selectedCatalogId),
  });
  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];
  const [productModalOpened, productModal] = useDisclosure(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filterForm = useForm<FilterFormValues>({
    mode: "controlled",
    initialValues: {
      term: search.term ?? "",
      categoryId: search.categoryId ?? "",
      status: search.status ?? "",
    },
  });

  const productForm = useForm<ProductFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      categoryId: "",
      shortDescription: "",
      imageUrl: "",
      status: "draft",
      basePriceAmount: "",
      inventoryQuantity: "",
      isAvailable: true,
      isFeatured: false,
      trackInventory: false,
    },
    validate: {
      name: (value) =>
        value.trim().length >= 2 ? null : "Ingresa un nombre valido",
      basePriceAmount: (value) => {
        if (!value.trim()) {
          return null;
        }

        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 0
          ? null
          : "Usa un entero mayor o igual a 0";
      },
      inventoryQuantity: (value) => {
        if (!value.trim()) {
          return null;
        }

        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 0
          ? null
          : "Usa un entero mayor o igual a 0";
      },
    },
  });

  const createItemMutation = useMutation(
    orpc.catalog.createItem.mutationOptions({
      onSuccess: async () => {
        if (selectedCatalogId) {
          await queryClient.invalidateQueries({
            queryKey: orpc.catalog.listItems.queryKey({
              input: { id: selectedCatalogId },
            }),
          });
        }
        await queryClient.invalidateQueries({ queryKey: orpc.catalog.key() });
        setSubmitError(null);
        setEditingItemId(null);
        productModal.close();
      },
      onError: (error) => {
        setSubmitError(getErrorMessage(error, "No se pudo crear el producto"));
      },
    }),
  );

  const updateItemMutation = useMutation(
    orpc.catalog.updateItem.mutationOptions({
      onSuccess: async () => {
        if (selectedCatalogId) {
          await queryClient.invalidateQueries({
            queryKey: orpc.catalog.listItems.queryKey({
              input: { id: selectedCatalogId },
            }),
          });
        }
        setSubmitError(null);
        setEditingItemId(null);
        productModal.close();
      },
      onError: (error) => {
        setSubmitError(
          getErrorMessage(error, "No se pudo actualizar el producto"),
        );
      },
    }),
  );

  const removeItemMutation = useMutation(
    orpc.catalog.removeItem.mutationOptions({
      onSuccess: async () => {
        if (selectedCatalogId) {
          await queryClient.invalidateQueries({
            queryKey: orpc.catalog.listItems.queryKey({
              input: { id: selectedCatalogId },
            }),
          });
        }
      },
    }),
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTerm = search.term
        ? item.name.toLowerCase().includes(search.term.toLowerCase()) ||
          (item.shortDescription ?? "")
            .toLowerCase()
            .includes(search.term.toLowerCase())
        : true;
      const matchesCategory = search.categoryId
        ? item.categoryId === search.categoryId
        : true;
      const matchesStatus = search.status
        ? item.status === search.status
        : true;

      return matchesTerm && matchesCategory && matchesStatus;
    });
  }, [items, search.categoryId, search.status, search.term]);

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const catalogOptions = catalogs.map((catalog) => ({
    value: catalog.id,
    label: catalog.name,
  }));
  const modalSelectComboboxProps = { withinPortal: false } as const;

  const openCreateProduct = () => {
    setSubmitError(null);
    setEditingItemId(null);
    productForm.setValues({
      name: "",
      categoryId: "",
      shortDescription: "",
      imageUrl: "",
      status: "draft",
      basePriceAmount: "",
      inventoryQuantity: "",
      isAvailable: true,
      isFeatured: false,
      trackInventory: false,
    });
    productModal.open();
  };

  const openEditProduct = (item: (typeof items)[number]) => {
    setSubmitError(null);
    setEditingItemId(item.id);
    productForm.setValues({
      name: item.name,
      categoryId: item.categoryId ?? "",
      shortDescription: item.shortDescription ?? "",
      imageUrl: item.imageUrl ?? "",
      status: item.status,
      basePriceAmount:
        item.basePriceAmount === null ? "" : String(item.basePriceAmount),
      inventoryQuantity:
        item.inventoryQuantity === null ? "" : String(item.inventoryQuantity),
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      trackInventory: item.trackInventory,
    });
    productModal.open();
  };

  const handleProductSubmit = productForm.onSubmit(async (values) => {
    if (!selectedCatalogId) {
      setSubmitError("Selecciona un catalogo antes de crear productos");
      return;
    }

    const payload = {
      catalogId: selectedCatalogId,
      categoryId: values.categoryId || null,
      name: values.name.trim(),
      shortDescription: values.shortDescription.trim() || null,
      imageUrl: values.imageUrl.trim() || null,
      status: values.status as "draft" | "active" | "archived",
      basePriceAmount: values.basePriceAmount.trim()
        ? Number(values.basePriceAmount)
        : null,
      inventoryQuantity: values.inventoryQuantity.trim()
        ? Number(values.inventoryQuantity)
        : null,
      isAvailable: values.isAvailable,
      isFeatured: values.isFeatured,
      trackInventory: values.trackInventory,
    };

    if (editingItemId) {
      await updateItemMutation.mutateAsync({ id: editingItemId, ...payload });
      return;
    }

    await createItemMutation.mutateAsync(payload);
  });

  const handleDeleteProduct = async (itemId: string) => {
    if (
      !window.confirm("Esta accion eliminara el producto. Quieres continuar?")
    ) {
      return;
    }

    await removeItemMutation.mutateAsync({ id: itemId });
  };

  const handleFilterSubmit = filterForm.onSubmit((values) => {
    startTransition(() => {
      navigate({
        search: (previous) => ({
          ...previous,
          term: values.term.trim() || undefined,
          categoryId: values.categoryId || undefined,
          status: values.status || undefined,
        }),
      });
    });
  });

  if (!selectedCatalogId) {
    return (
      <Stack gap="xl">
        <Title order={2}>Productos</Title>
        <Alert color="gray">
          No hay catalogos disponibles todavia. Crea uno primero en la seccion
          de catalogos.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Modal
        opened={productModalOpened}
        onClose={productModal.close}
        title={editingItemId ? "Editar producto" : "Nuevo producto"}
        size="lg"
        radius="lg"
        centered
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
      >
        <form onSubmit={handleProductSubmit}>
          <Stack gap="md">
            {submitError ? <Alert color="red">{submitError}</Alert> : null}

            <TextInput
              label="Nombre"
              placeholder="Ej: Latte frio"
              key={productForm.key("name")}
              {...productForm.getInputProps("name")}
            />

            <TextInput
              label="Descripcion corta"
              placeholder="Resumen visible en el menu"
              key={productForm.key("shortDescription")}
              {...productForm.getInputProps("shortDescription")}
            />

            <Group grow align="flex-start">
              <Select
                clearable
                label="Categoria"
                placeholder={
                  categoriesQuery.isFetching
                    ? "Cargando categorias..."
                    : categoryOptions.length > 0
                      ? "Selecciona una categoria"
                      : "No hay categorias disponibles"
                }
                data={categoryOptions}
                value={productForm.values.categoryId || null}
                onChange={(value) => {
                  productForm.setFieldValue("categoryId", value ?? "");
                }}
                error={productForm.errors.categoryId}
                comboboxProps={modalSelectComboboxProps}
                nothingFoundMessage="No hay categorias disponibles"
              />

              <Select
                label="Estado"
                data={itemStatusOptions}
                allowDeselect={false}
                key={productForm.key("status")}
                comboboxProps={modalSelectComboboxProps}
                {...productForm.getInputProps("status")}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                label="Precio base"
                placeholder="12000"
                key={productForm.key("basePriceAmount")}
                {...productForm.getInputProps("basePriceAmount")}
              />
              <TextInput
                label="Inventario"
                placeholder="25"
                key={productForm.key("inventoryQuantity")}
                {...productForm.getInputProps("inventoryQuantity")}
              />
            </Group>

            <TextInput
              label="URL de imagen"
              placeholder="https://..."
              key={productForm.key("imageUrl")}
              {...productForm.getInputProps("imageUrl")}
            />

            <Group grow>
              <Switch
                label="Disponible"
                key={productForm.key("isAvailable")}
                {...productForm.getInputProps("isAvailable", {
                  type: "checkbox",
                })}
              />
              <Switch
                label="Destacado"
                key={productForm.key("isFeatured")}
                {...productForm.getInputProps("isFeatured", {
                  type: "checkbox",
                })}
              />
              <Switch
                label="Controlar inventario"
                key={productForm.key("trackInventory")}
                {...productForm.getInputProps("trackInventory", {
                  type: "checkbox",
                })}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={productModal.close}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="brand.6"
                loading={
                  createItemMutation.isPending || updateItemMutation.isPending
                }
              >
                {editingItemId ? "Guardar cambios" : "Crear producto"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
            Productos
          </Title>
          <Text c="dimmed" mt={4}>
            Gestiona productos reales del catalogo activo con datos
            sincronizados.
          </Text>
        </div>

        <Button color="brand.6" onClick={openCreateProduct}>
          <Group gap={8} wrap="nowrap">
            <Plus size={18} />
            <span>Nuevo producto</span>
          </Group>
        </Button>
      </Group>

      <Card withBorder radius="lg" p="lg">
        <Group align="end">
          <Select
            label="Catalogo activo"
            data={catalogOptions}
            value={selectedCatalogId}
            onChange={(value) => {
              startTransition(() => {
                navigate({
                  search: () => ({
                    catalogId: value ?? undefined,
                    categoryId: undefined,
                    status: undefined,
                    term: undefined,
                  }),
                });
              });
            }}
            allowDeselect={false}
            style={{ flex: 1 }}
          />

          <Badge size="lg" variant="light">
            {selectedCatalog?.name ?? "Sin catalogo"}
          </Badge>
        </Group>
      </Card>

      <Card withBorder radius="lg" p="lg">
        <form onSubmit={handleFilterSubmit}>
          <Group align="end">
            <TextInput
              label="Buscar"
              placeholder="Nombre o descripcion"
              leftSection={<Search size={16} />}
              key={filterForm.key("term")}
              {...filterForm.getInputProps("term")}
              style={{ flex: 1 }}
            />
            <Select
              clearable
              label="Categoria"
              data={categoryOptions}
              key={filterForm.key("categoryId")}
              {...filterForm.getInputProps("categoryId")}
              style={{ flex: 1, minWidth: "min(100%, 220px)" }}
            />
            <Select
              clearable
              label="Estado"
              data={itemStatusOptions}
              key={filterForm.key("status")}
              {...filterForm.getInputProps("status")}
              style={{ flex: 1, minWidth: "min(100%, 180px)" }}
            />
            <Button type="submit" variant="default">
              Aplicar
            </Button>
          </Group>
        </form>
      </Card>

      {itemsQuery.isFetching ? (
        <Text c="dimmed">Actualizando productos...</Text>
      ) : filteredItems.length > 0 ? (
        <Grid gutter="lg">
          {filteredItems.map((item) => {
            const categoryName =
              categories.find((category) => category.id === item.categoryId)
                ?.name || "Sin categoria";

            return (
              <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder radius="lg" p="lg" h="100%">
                  <Stack gap="sm" h="100%">
                    <Group
                      justify="space-between"
                      align="flex-start"
                      wrap="nowrap"
                    >
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
                            onClick={() => openEditProduct(item)}
                          >
                            Editar
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<Trash size={14} />}
                            onClick={() => handleDeleteProduct(item.id)}
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
                      <Badge color={item.status === "active" ? "blue" : "gray"}>
                        {item.status}
                      </Badge>
                      {item.isFeatured ? (
                        <Badge color="orange">Destacado</Badge>
                      ) : null}
                    </Group>

                    <Group justify="space-between" mt="auto">
                      <Text fw={800} c="brand.6">
                        {item.basePriceAmount === null
                          ? "Sin precio"
                          : `$ ${item.basePriceAmount.toLocaleString("es-CO")}`}
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
      ) : (
        <Alert color="gray">
          No hay productos que coincidan con los filtros actuales para este
          catalogo.
        </Alert>
      )}
    </Stack>
  );
}
