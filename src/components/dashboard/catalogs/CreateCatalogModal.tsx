import { Alert, Button, Group, Modal, Select, Stack, Switch, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { CatalogFormValues } from "./types";
import { catalogStatusOptions, modalSelectComboboxProps, priceDisplayModeOptions } from "./utils";

type CreateCatalogModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<CatalogFormValues>;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  isSubmitting: boolean;
  siteOptions: { value: string; label: string }[];
  locationOptions: { value: string; label: string }[];
  themeOptions: { value: string; label: string }[];
};

export function CreateCatalogModal({
  opened,
  onClose,
  form,
  onSubmit,
  error,
  isSubmitting,
  siteOptions,
  locationOptions,
  themeOptions,
}: CreateCatalogModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nuevo catalogo"
      size="lg"
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
            placeholder="Ej: Menu principal"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Descripcion"
            placeholder="Que vende este catalogo"
            key={form.key("description")}
            {...form.getInputProps("description")}
          />

          <Group grow align="flex-start">
            <TextInput
              label="Moneda"
              placeholder="COP"
              maxLength={3}
              key={form.key("currencyCode")}
              {...form.getInputProps("currencyCode")}
            />

            <Select
              label="Estado"
              data={catalogStatusOptions}
              allowDeselect={false}
              value={form.values.status}
              onChange={(value) => {
                form.setFieldValue("status", value ?? "draft");
              }}
              error={form.errors.status}
              comboboxProps={modalSelectComboboxProps}
            />
          </Group>

          <Select
            label="Modo de precio"
            data={priceDisplayModeOptions}
            allowDeselect={false}
            value={form.values.priceDisplayMode}
            onChange={(value) => {
              form.setFieldValue("priceDisplayMode", value ?? "exact");
            }}
            error={form.errors.priceDisplayMode}
            comboboxProps={modalSelectComboboxProps}
          />

          <Group grow>
            <Select
              clearable
              label="Sitio asociado"
              data={siteOptions}
              value={form.values.siteId || null}
              onChange={(value) => {
                form.setFieldValue("siteId", value ?? "");
              }}
              error={form.errors.siteId}
              comboboxProps={modalSelectComboboxProps}
              nothingFoundMessage="No hay sitios disponibles"
            />
            <Select
              clearable
              label="Sede"
              data={locationOptions}
              value={form.values.locationId || null}
              onChange={(value) => {
                form.setFieldValue("locationId", value ?? "");
              }}
              error={form.errors.locationId}
              comboboxProps={modalSelectComboboxProps}
              nothingFoundMessage="No hay sedes disponibles"
            />
          </Group>

          <Select
            clearable
            label="Tema de marca"
            data={themeOptions}
            value={form.values.brandThemeId || null}
            onChange={(value) => {
              form.setFieldValue("brandThemeId", value ?? "");
            }}
            error={form.errors.brandThemeId}
            comboboxProps={modalSelectComboboxProps}
            nothingFoundMessage="No hay temas disponibles"
          />

          <Switch
            label="Visible al publico"
            key={form.key("isPublic")}
            {...form.getInputProps("isPublic", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" color="brand.6" loading={isSubmitting}>
              Crear catalogo
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
