import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";

import type { ProductFormValues } from "./types";
import { itemStatusOptions, modalSelectComboboxProps } from "./utils";

type CreateProductModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitError: string | null;
  categoriesFetching: boolean;
  categoryOptions: { value: string; label: string }[];
  isPending: boolean;
};

export function CreateProductModal({
  opened,
  onClose,
  onSubmit,
  submitError,
  categoriesFetching,
  categoryOptions,
  isPending,
}: CreateProductModalProps) {
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
        if (!value.trim()) return null;
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 0
          ? null
          : "Usa un entero mayor o igual a 0";
      },
      inventoryQuantity: (value) => {
        if (!value.trim()) return null;
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 0
          ? null
          : "Usa un entero mayor o igual a 0";
      },
    },
  });

  const handleSubmit = productForm.onSubmit(async (values) => {
    try {
      await onSubmit(values);
      productForm.reset();
    } catch {
      // errors handled by parent
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        productForm.reset();
      }}
      title="Nuevo producto"
      size="lg"
      radius="lg"
      centered
      zIndex={1000}
      overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
    >
      <form onSubmit={handleSubmit}>
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
                categoriesFetching
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
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" color="brand.6" loading={isPending}>
              Crear producto
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}