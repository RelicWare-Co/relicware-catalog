import {
  Alert,
  Button,
  FileInput,
  Group,
  Image,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";

import type { ProductFormValues, ProductItem } from "./types";
import {
  itemStatusOptions,
  modalSelectComboboxProps,
  productImageAccept,
  productImageAcceptedMimeTypes,
  productImageMaxUploadBytes,
  productImageMaxUploadLabel,
} from "./utils";

type EditProductModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues, itemId: string) => Promise<void>;
  submitError: string | null;
  categoriesFetching: boolean;
  categoryOptions: { value: string; label: string }[];
  isPending: boolean;
  initialItem: ProductItem | null;
};

export function EditProductModal({
  opened,
  onClose,
  onSubmit, // now needs itemId
  submitError,
  categoriesFetching,
  categoryOptions,
  isPending,
  initialItem,
}: EditProductModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const productForm = useForm<ProductFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      categoryId: "",
      shortDescription: "",
      imageFile: null,
      removeImage: false,
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
      imageFile: (value) => {
        if (!value) return null;
        if (!productImageAcceptedMimeTypes.includes(value.type as never)) {
          return "Solo se permiten imágenes JPG, PNG o WebP";
        }
        if (value.size > productImageMaxUploadBytes) {
          return `La imagen no puede superar ${productImageMaxUploadLabel}`;
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (initialItem && opened) {
      productForm.setValues({
        name: initialItem.name,
        categoryId: initialItem.categoryId ?? "",
        shortDescription: initialItem.shortDescription ?? "",
        imageFile: null,
        removeImage: false,
        status: initialItem.status,
        basePriceAmount:
          initialItem.basePriceAmount === null ? "" : String(initialItem.basePriceAmount),
        inventoryQuantity:
          initialItem.inventoryQuantity === null
            ? ""
            : String(initialItem.inventoryQuantity),
        isAvailable: initialItem.isAvailable,
        isFeatured: initialItem.isFeatured,
        trackInventory: initialItem.trackInventory,
      });
    }
  }, [initialItem, opened, productForm.setValues]);

  useEffect(() => {
    if (!productForm.values.imageFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(productForm.values.imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [productForm.values.imageFile]);

  const currentImageUrl =
    productForm.values.removeImage || previewUrl
      ? null
      : (initialItem?.imageUrl ?? null);

  const handleSubmit = productForm.onSubmit(async (values) => {
    if (!initialItem) return;
    try {
      await onSubmit(values, initialItem.id);
      productForm.reset();
    } catch {
      // handled by parent
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        productForm.reset();
      }}
      title="Editar producto"
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

          <Stack gap="xs">
            <FileInput
              label="Imagen del producto"
              placeholder="Selecciona una imagen"
              accept={productImageAccept}
              clearable
              value={productForm.values.imageFile}
              onChange={(file) => {
                productForm.setFieldValue("imageFile", file ?? null);
                if (file) {
                  productForm.setFieldValue("removeImage", false);
                }
              }}
              error={productForm.errors.imageFile}
            />
            <Text size="xs" c="dimmed">
              Se optimiza con Sharp y se convierte a WebP. Límite: {productImageMaxUploadLabel}.
            </Text>

            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Vista previa de la nueva imagen seleccionada"
                  radius="md"
                  h={180}
                  fit="contain"
                />
                <Group justify="flex-start">
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => {
                      productForm.setFieldValue("imageFile", null);
                    }}
                  >
                    Quitar nueva imagen
                  </Button>
                </Group>
              </>
            ) : currentImageUrl ? (
              <>
                <Image
                  src={currentImageUrl}
                  alt="Imagen actual del producto"
                  radius="md"
                  h={180}
                  fit="contain"
                />
                <Group justify="flex-start">
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => {
                      productForm.setFieldValue("removeImage", true);
                    }}
                  >
                    Quitar imagen actual
                  </Button>
                </Group>
              </>
            ) : initialItem?.imageUrl ? (
              <Group justify="flex-start">
                <Button
                  variant="light"
                  color="gray"
                  onClick={() => {
                    productForm.setFieldValue("removeImage", false);
                  }}
                >
                  Restaurar imagen actual
                </Button>
              </Group>
            ) : null}
          </Stack>

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
              Guardar cambios
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}