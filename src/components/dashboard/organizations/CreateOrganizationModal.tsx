import { Alert, Badge, Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { AlertCircle } from "lucide-react";
import type { ChangeEvent } from "react";
import type { OrganizationFormValues, SlugAvailabilityState } from "./types";
import { createIdleSlugState } from "./utils";

type CreateOrganizationModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<OrganizationFormValues>;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (event: ChangeEvent<HTMLInputElement>) => void;
  hasManualSlug: boolean;
  slugInputError?: string | null | false | React.ReactNode;
  candidateSlug: string;
  slugState: SlugAvailabilityState;
  onUseSuggestion: () => void;
  onCancelClick: () => void;
};

export function CreateOrganizationModal({
  opened,
  onClose,
  form,
  onSubmit,
  onNameChange,
  onSlugChange,
  hasManualSlug,
  slugInputError,
  candidateSlug,
  slugState,
  onUseSuggestion,
  onCancelClick,
}: CreateOrganizationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nueva organización"
      radius="xl"
      centered
      zIndex={1000}
      overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            placeholder="Ej: Casa Nativa"
            key={form.key("name")}
            {...form.getInputProps("name")}
            onChange={onNameChange}
          />
          <Stack gap="xs">
            <TextInput
              label="Slug"
              placeholder="casa-nativa"
              description={
                hasManualSlug
                  ? "Usa solo minúsculas, números y guiones."
                  : "Si lo dejas vacío, lo generamos a partir del nombre."
              }
              key={form.key("slug")}
              {...form.getInputProps("slug")}
              error={slugInputError}
              onChange={onSlugChange}
            />
            {!hasManualSlug && candidateSlug ? (
              <Text size="xs" c="dimmed">
                Slug que se intentará usar: {candidateSlug}
              </Text>
            ) : null}
            {slugState.status === "checking" ? (
              <Text size="xs" c="dimmed">
                {slugState.message}
              </Text>
            ) : null}
            {slugState.status === "available" ? (
              <Text size="xs" c="teal.7">
                {slugState.message}
              </Text>
            ) : null}
            {slugState.status === "error" ? (
              <Text size="xs" c="dimmed">
                {slugState.message}
              </Text>
            ) : null}
            {slugState.status === "taken" ? (
              <Alert color="orange" radius="lg" variant="light" icon={<AlertCircle size={16} />}>
                <Stack gap="xs">
                  <Text size="sm">{slugState.message}</Text>
                  {slugState.suggestion ? (
                    <Group gap="xs" align="center">
                      <Badge color="orange" variant="light">
                        {slugState.suggestion}
                      </Badge>
                      <Button size="xs" variant="light" onClick={onUseSuggestion}>
                        Usar sugerencia
                      </Button>
                    </Group>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Intenta con una variante corta al final, por ejemplo:
                      {` ${slugState.slug}-a1b2`}
                    </Text>
                  )}
                </Stack>
              </Alert>
            ) : null}
          </Stack>
          <TextInput
            label="Logo"
            placeholder="https://..."
            key={form.key("logo")}
            {...form.getInputProps("logo")}
          />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={onCancelClick}>
              Cancelar
            </Button>
            <Button type="submit" loading={form.submitting}>
              Crear organización
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
