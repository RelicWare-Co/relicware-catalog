import { Alert, Badge, Button, Card, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { startTransition, useMemo, useState } from "react";

import { CreateProductModal } from "#/components/dashboard/products/CreateProductModal";
import { EditProductModal } from "#/components/dashboard/products/EditProductModal";
import { ProductGrid } from "#/components/dashboard/products/ProductGrid";
import type {
  FilterFormValues,
  ProductFormValues,
  ProductItem,
} from "#/components/dashboard/products/types";
import { itemStatusOptions } from "#/components/dashboard/products/utils";
import { getErrorMessage } from "#/lib/get-error-message";
import { orpc } from "#/orpc/client";

const listInput = { limit: 50, offset: 0 } as const;
const catalogListQueryOptions = () =>
  orpc.catalog.list.queryOptions({ input: listInput });
const categoryListQueryOptions = (catalogId: string) =>
  orpc.catalog.listCategories.queryOptions({ input: { id: catalogId } });
const itemListQueryOptions = (catalogId: string) =>
  orpc.catalog.listItems.queryOptions({ input: { id: catalogId } });

type UploadedProductImage = {
  url: string;
};

async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/product-images", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; message?: string }
    | null;

  if (!response.ok || !payload?.url) {
    throw new Error(
      payload?.message ?? "No se pudo subir la imagen del producto",
    );
  }

  return payload as UploadedProductImage;
}

async function deleteUploadedProductImage(url: string) {
  await fetch("/api/product-images", {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
}

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
  const [createModalOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editModalOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filterForm = useForm<FilterFormValues>({
    mode: "controlled",
    initialValues: {
      term: search.term ?? "",
      categoryId: search.categoryId ?? "",
      status: search.status ?? "",
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
        closeCreate();
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
        setEditingItem(null);
        closeEdit();
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

  const handleCreateProduct = async (values: ProductFormValues) => {
    if (!selectedCatalogId) {
      setSubmitError("Selecciona un catalogo antes de crear productos");
      throw new Error("No catalog");
    }

    let uploadedImageUrl: string | null = null;

    try {
      if (values.imageFile) {
        const uploadedImage = await uploadProductImage(values.imageFile);
        uploadedImageUrl = uploadedImage.url;
      }

      const payload = {
        catalogId: selectedCatalogId,
        categoryId: values.categoryId || null,
        name: values.name.trim(),
        shortDescription: values.shortDescription.trim() || null,
        imageUrl: uploadedImageUrl,
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

      await createItemMutation.mutateAsync(payload);
    } catch (error) {
      if (uploadedImageUrl) {
        void deleteUploadedProductImage(uploadedImageUrl);
      }

      if (!createItemMutation.isPending) {
        setSubmitError(
          getErrorMessage(error, "No se pudo crear el producto"),
        );
      }

      throw error;
    }
  };

  const handleUpdateProduct = async (values: ProductFormValues, itemId: string) => {
    if (!selectedCatalogId) {
      setSubmitError("Selecciona un catalogo antes de crear productos");
      throw new Error("No catalog");
    }

    const currentImageUrl = editingItem?.imageUrl ?? null;
    let uploadedImageUrl: string | null = null;

    try {
      let nextImageUrl = values.removeImage ? null : currentImageUrl;

      if (values.imageFile) {
        const uploadedImage = await uploadProductImage(values.imageFile);
        uploadedImageUrl = uploadedImage.url;
        nextImageUrl = uploadedImage.url;
      }

      const payload = {
        catalogId: selectedCatalogId,
        categoryId: values.categoryId || null,
        name: values.name.trim(),
        shortDescription: values.shortDescription.trim() || null,
        imageUrl: nextImageUrl,
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

      await updateItemMutation.mutateAsync({ id: itemId, ...payload });
    } catch (error) {
      if (uploadedImageUrl) {
        void deleteUploadedProductImage(uploadedImageUrl);
      }

      if (!updateItemMutation.isPending) {
        setSubmitError(
          getErrorMessage(error, "No se pudo actualizar el producto"),
        );
      }

      throw error;
    }
  };

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
      <CreateProductModal
        opened={createModalOpened}
        onClose={closeCreate}
        onSubmit={handleCreateProduct}
        submitError={submitError}
        categoriesFetching={categoriesQuery.isFetching}
        categoryOptions={categoryOptions}
        isPending={createItemMutation.isPending}
      />

      <EditProductModal
        opened={editModalOpened}
        onClose={closeEdit}
        onSubmit={handleUpdateProduct}
        submitError={submitError}
        categoriesFetching={categoriesQuery.isFetching}
        categoryOptions={categoryOptions}
        isPending={updateItemMutation.isPending}
        initialItem={editingItem}
      />

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

        <Button color="brand.6" onClick={() => { setSubmitError(null); openCreate(); }}>
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

      <ProductGrid
        items={filteredItems}
        categories={categories}
        isFetching={itemsQuery.isFetching}
        onEdit={(item) => {
          setSubmitError(null);
          setEditingItem(item);
          openEdit();
        }}
        onDelete={handleDeleteProduct}
      />
    </Stack>
  );
}

