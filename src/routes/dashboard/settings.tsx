import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Save, Trash2 } from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { authClient } from "#/lib/auth-client";
import { getErrorMessage } from "#/lib/get-error-message";
import {
  type OrganizationRoleKey,
  organizationRoles,
} from "#/lib/organization-permissions";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

type SettingsFormValues = {
  businessName: string;
  contactEmail: string;
  whatsappPhone: string;
  emailNotifications: boolean;
  orderAlerts: boolean;
};

type OrganizationSettingsMetadata = {
  contactEmail?: string | null;
  whatsappPhone?: string | null;
  notifications?: {
    emailDigest?: boolean;
    orderAlerts?: boolean;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

const emailPattern = /^\S+@\S+\.\S+$/;
const phonePattern = /^\+?[0-9()\s-]{7,20}$/;

const emptyFormValues: SettingsFormValues = {
  businessName: "",
  contactEmail: "",
  whatsappPhone: "",
  emailNotifications: true,
  orderAlerts: true,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOrganizationRoleKey = (role: string): role is OrganizationRoleKey =>
  role in organizationRoles;

const parseOrganizationMetadata = (
  metadata: unknown,
): OrganizationSettingsMetadata => {
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);

      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return isRecord(metadata) ? metadata : {};
};

const getInitialValues = ({
  organizationName,
  metadata,
  fallbackEmail,
}: {
  organizationName: string;
  metadata: OrganizationSettingsMetadata;
  fallbackEmail: string;
}): SettingsFormValues => ({
  businessName: organizationName,
  contactEmail:
    typeof metadata.contactEmail === "string"
      ? metadata.contactEmail
      : fallbackEmail,
  whatsappPhone:
    typeof metadata.whatsappPhone === "string" ? metadata.whatsappPhone : "",
  emailNotifications:
    metadata.notifications?.emailDigest === undefined
      ? true
      : Boolean(metadata.notifications.emailDigest),
  orderAlerts:
    metadata.notifications?.orderAlerts === undefined
      ? true
      : Boolean(metadata.notifications.orderAlerts),
});

function SettingsPage() {
  const navigate = useNavigate({ from: "/dashboard/settings" });
  const {
    data: session,
    isPending: sessionPending,
    refetch: refetchSession,
  } = authClient.useSession();
  const {
    data: activeOrganization,
    isPending: activeOrganizationPending,
    refetch: refetchActiveOrganization,
  } = authClient.useActiveOrganization();
  const { refetch: refetchOrganizations } = authClient.useListOrganizations();
  const { data: activeMemberRole } = authClient.useActiveMemberRole();

  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpened, deleteModal] = useDisclosure(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<SettingsFormValues>({
    mode: "controlled",
    initialValues: emptyFormValues,
    validate: {
      businessName: (value) =>
        value.trim().length >= 2
          ? null
          : "Ingresa un nombre con al menos 2 caracteres",
      contactEmail: (value) =>
        value.trim().length === 0 || emailPattern.test(value.trim())
          ? null
          : "Ingresa un correo electrónico válido",
      whatsappPhone: (value) =>
        value.trim().length === 0 || phonePattern.test(value.trim())
          ? null
          : "Ingresa un número de WhatsApp válido",
    },
  });

  const activeRole = activeMemberRole?.role;
  const normalizedActiveRole =
    activeRole && isOrganizationRoleKey(activeRole) ? activeRole : null;
  const canUpdateActiveOrganization = normalizedActiveRole
    ? authClient.organization.checkRolePermission({
        role: normalizedActiveRole,
        permissions: {
          organization: ["update"],
        },
      })
    : false;
  const canDeleteActiveOrganization = normalizedActiveRole
    ? authClient.organization.checkRolePermission({
        role: normalizedActiveRole,
        permissions: {
          organization: ["delete"],
        },
      })
    : false;

  const parsedMetadata = useMemo(
    () => parseOrganizationMetadata(activeOrganization?.metadata),
    [activeOrganization?.metadata],
  );
  const lastHydratedKeyRef = useRef<string | null>(null);

  const hydrateForm = useEffectEvent((nextValues: SettingsFormValues) => {
    form.setInitialValues(nextValues);
    form.setValues(nextValues);
    form.resetDirty();
  });

  useEffect(() => {
    if (!activeOrganization) {
      lastHydratedKeyRef.current = null;
      return;
    }

    const hydrationKey = JSON.stringify({
      organizationId: activeOrganization.id,
      organizationName: activeOrganization.name,
      metadata: parsedMetadata,
      fallbackEmail: session?.user.email ?? "",
    });

    if (lastHydratedKeyRef.current === hydrationKey) {
      return;
    }

    lastHydratedKeyRef.current = hydrationKey;

    hydrateForm(
      getInitialValues({
        organizationName: activeOrganization.name,
        metadata: parsedMetadata,
        fallbackEmail: session?.user.email ?? "",
      }),
    );
  }, [activeOrganization, parsedMetadata, session?.user.email]);

  const syncOrganizationState = async () => {
    await Promise.all([
      refetchActiveOrganization(),
      refetchOrganizations(),
      refetchSession(),
    ]);
  };

  const handleSave = form.onSubmit(async (values) => {
    if (!activeOrganization) {
      return;
    }

    setIsSaving(true);

    const nextMetadata: OrganizationSettingsMetadata = {
      ...parsedMetadata,
      contactEmail: values.contactEmail.trim() || null,
      whatsappPhone: values.whatsappPhone.trim() || null,
      notifications: {
        ...(isRecord(parsedMetadata.notifications)
          ? parsedMetadata.notifications
          : {}),
        emailDigest: values.emailNotifications,
        orderAlerts: values.orderAlerts,
      },
    };

    const { error } = await authClient.organization.update({
      organizationId: activeOrganization.id,
      data: {
        name: values.businessName.trim(),
        metadata: nextMetadata,
      },
    });

    setIsSaving(false);

    if (error) {
      notifications.show({
        title: "No se pudo guardar",
        message: getErrorMessage(error, "Revisa los datos e intenta de nuevo."),
        color: "red",
      });
      return;
    }

    await syncOrganizationState();
    form.setInitialValues(values);
    form.resetDirty();

    notifications.show({
      title: "Configuración guardada",
      message: "Los ajustes de tu organización se actualizaron correctamente.",
      color: "teal",
    });
  });

  const handleDeleteOrganization = async () => {
    if (!activeOrganization) {
      return;
    }

    setIsDeleting(true);

    const { error } = await authClient.organization.delete({
      organizationId: activeOrganization.id,
    });

    setIsDeleting(false);

    if (error) {
      notifications.show({
        title: "No se pudo eliminar",
        message: getErrorMessage(error, "No fue posible eliminar la organización."),
        color: "red",
      });
      return;
    }

    deleteModal.close();
    setDeleteConfirmation("");
    await syncOrganizationState();

    notifications.show({
      title: "Organización eliminada",
      message: "Selecciona otra organización para seguir usando el dashboard.",
      color: "teal",
    });

    await navigate({
      to: "/dashboard/organizations",
      search: { redirect: undefined },
      replace: true,
    });
  };

  if (sessionPending || activeOrganizationPending) {
    return (
      <Group justify="center" py="xl">
        <Loader color="brand.6" />
      </Group>
    );
  }

  if (!activeOrganization) {
    return (
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
              Configuración
            </Title>
            <Text c="dimmed" mt={4}>
              Administra los detalles de tu negocio y preferencias de la
              plataforma.
            </Text>
          </div>
        </Group>

        <Alert color="brand" radius="lg" icon={<AlertCircle size={18} />}>
          Primero activa una organización para poder editar su configuración.
        </Alert>
      </Stack>
    );
  }

  return (
    <>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
              Configuración
            </Title>
            <Text c="dimmed" mt={4}>
              Administra los detalles de tu organización activa y define cómo
              quieres recibir notificaciones internas.
            </Text>
          </div>

          <Button
            color="brand"
            leftSection={<Save size={16} />}
            loading={isSaving}
            disabled={!canUpdateActiveOrganization || !form.isDirty()}
            onClick={() => void handleSave()}
          >
            Guardar cambios
          </Button>
        </Group>

        {!canUpdateActiveOrganization ? (
          <Alert color="gray" radius="lg" variant="light">
            Tu rol actual no tiene permisos para editar la configuración de esta
            organización.
          </Alert>
        ) : null}

        <Card
          withBorder
          radius="lg"
          p="xl"
          shadow="sm"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <form onSubmit={handleSave}>
            <Stack gap="md">
              <Title order={4} c="dark.8">
                Información del negocio
              </Title>
              <Divider />

              <Group grow align="flex-start">
                <TextInput
                  label="Nombre del restaurante/negocio"
                  placeholder='Ej: Restaurante "El Sazón"'
                  key={form.key("businessName")}
                  disabled={!canUpdateActiveOrganization}
                  {...form.getInputProps("businessName")}
                />
                <TextInput
                  label="Correo electrónico de contacto"
                  placeholder="tu@negocio.com"
                  key={form.key("contactEmail")}
                  disabled={!canUpdateActiveOrganization}
                  {...form.getInputProps("contactEmail")}
                />
              </Group>

              <TextInput
                label="Número de WhatsApp para pedidos"
                placeholder="+57 300 000 0000"
                key={form.key("whatsappPhone")}
                disabled={!canUpdateActiveOrganization}
                {...form.getInputProps("whatsappPhone")}
              />

              <Text size="sm" c="dimmed">
                Estos datos se guardan en la organización activa:
                <Text span fw={700} c="dark.8">
                  {` ${activeOrganization.name}`}
                </Text>
              </Text>

              <Button
                type="submit"
                variant="filled"
                color="brand"
                mt="md"
                w="fit-content"
                loading={isSaving}
                disabled={!canUpdateActiveOrganization || !form.isDirty()}
                style={{ alignSelf: "flex-start" }}
              >
                Guardar cambios
              </Button>
            </Stack>
          </form>
        </Card>

        <Card
          withBorder
          radius="lg"
          p="xl"
          shadow="sm"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Stack gap="md">
            <Title order={4} c="dark.8">
              Preferencias de notificaciones
            </Title>
            <Divider />

            <Switch
              label="Notificaciones por correo electrónico"
              description="Recibe resúmenes internos sobre el desempeño de tus catálogos."
              color="brand"
              checked={form.values.emailNotifications}
              disabled={!canUpdateActiveOrganization}
              onChange={(event) =>
                form.setFieldValue(
                  "emailNotifications",
                  event.currentTarget.checked,
                )
              }
            />

            <Switch
              label="Avisos de nuevos pedidos"
              description="Recibe alertas internas cuando un cliente inicia una compra por WhatsApp."
              color="brand"
              checked={form.values.orderAlerts}
              disabled={!canUpdateActiveOrganization}
              onChange={(event) =>
                form.setFieldValue("orderAlerts", event.currentTarget.checked)
              }
            />

            <Text size="sm" c="dimmed">
              Estas preferencias se almacenan como parte de la configuración de
              la organización para que el equipo use el mismo criterio.
            </Text>
          </Stack>
        </Card>

        <Card
          withBorder
          radius="lg"
          p="xl"
          shadow="sm"
          style={{
            display: "flex",
            flexDirection: "column",
            borderColor: "var(--mantine-color-red-3)",
          }}
        >
          <Stack gap="md">
            <Title order={4} c="red.7">
              Zona de peligro
            </Title>
            <Divider color="red.2" />

            <Text size="sm" c="dimmed">
              Eliminar la organización activa borrará sus miembros,
              invitaciones y configuración. Esta acción no se puede deshacer.
            </Text>

            <Group justify="space-between" align="center">
              <Text size="sm" c="dark.8" fw={700}>
                Organización activa: {activeOrganization.name}
              </Text>

              <Button
                variant="outline"
                color="red"
                w="fit-content"
                leftSection={<Trash2 size={16} />}
                disabled={!canDeleteActiveOrganization}
                onClick={deleteModal.open}
              >
                Eliminar organización activa
              </Button>
            </Group>

            {!canDeleteActiveOrganization ? (
              <Text size="sm" c="dimmed">
                Solo los roles con permiso para eliminar organizaciones pueden
                ejecutar esta acción.
              </Text>
            ) : null}
          </Stack>
        </Card>
      </Stack>

      <Modal
        opened={deleteOpened}
        onClose={() => {
          deleteModal.close();
          setDeleteConfirmation("");
        }}
        title="Confirmar eliminación"
        radius="xl"
        centered
      >
        <Stack gap="md">
          <Alert color="red" radius="lg" icon={<AlertCircle size={18} />}>
            Escribe el nombre exacto de la organización para confirmar la
            eliminación definitiva.
          </Alert>

          <Text size="sm" c="dimmed">
            Nombre requerido:
            <Text span fw={700} c="dark.8">
              {` ${activeOrganization.name}`}
            </Text>
          </Text>

          <TextInput
            label="Confirmación"
            placeholder={activeOrganization.name}
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                deleteModal.close();
                setDeleteConfirmation("");
              }}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              loading={isDeleting}
              disabled={deleteConfirmation.trim() !== activeOrganization.name}
              onClick={handleDeleteOrganization}
            >
              Eliminar organización
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
