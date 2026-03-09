import { Alert, Button, Group, Modal, Select, Stack, Switch, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { CategoryFormValues } from "./types";
import { modalSelectComboboxProps } from "./utils";

type CreateCategoryModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<CategoryFormValues>;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  isSubmitting: boolean;
  categoryOptions: { value: string; label: string }[];
};

export function CreateCategoryModal({
  opened,
  onClose,
  form,
  onSubmit,
  error,
  isSubmitting,
  categoryOptions,
}: CreateCategoryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nueva categoria"
      radius="lg"
      centered
      zIndex={1000}
      overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          {error ? <Alert color="red">{error}</Alert> : null}

          <TextInput
            label="Nombre"
            placeholder="Ej: Bebidas frias"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Descripcion"
            placeholder="Opcional"
            key={form.key("description")}
            {...form.getInputProps("description")}
          />

          <Select
            clearable
            label="Categoria padre"
            data={categoryOptions}
            value={form.values.parentCategoryId || null}
            onChange={(value) => {
              form.setFieldValue("parentCategoryId", value ?? "");
            }}
            error={form.errors.parentCategoryId}
            comboboxProps={modalSelectComboboxProps}
            nothingFoundMessage="No hay categorias disponibles"
          />

          <Switch
            label="Visible en el catalogo"
            key={form.key("isVisible")}
            {...form.getInputProps("isVisible", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" color="brand.6" loading={isSubmitting}>
              Crear categoria
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
