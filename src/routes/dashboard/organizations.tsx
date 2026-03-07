import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  Check,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

import { authClient } from "#/lib/auth-client";
import { getErrorMessage } from "#/lib/get-error-message";

type OrganizationFormValues = {
  name: string;
  slug: string;
  logo: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createOrganizationSchema = (values: OrganizationFormValues) => {
  const normalizedSlug = values.slug.trim();

  return {
    name:
      values.name.trim().length >= 2
        ? null
        : "Ingresa un nombre con al menos 2 caracteres",
    slug:
      normalizedSlug.length === 0 || slugPattern.test(normalizedSlug)
        ? null
        : "Usa solo minúsculas, números y guiones",
    logo:
      values.logo.trim().length === 0 || /^https?:\/\//.test(values.logo.trim())
        ? null
        : "Ingresa una URL válida para el logo",
  };
};

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(value));

export const Route = createFileRoute("/dashboard/organizations")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const navigate = useNavigate({ from: "/dashboard/organizations" });
  const search = Route.useSearch();
  const {
    data: session,
    isPending: sessionPending,
    refetch: refetchSession,
  } = authClient.useSession();
  const {
    data: organizations,
    isPending: organizationsPending,
    error: organizationsError,
    refetch: refetchOrganizations,
  } = authClient.useListOrganizations();
  const {
    data: activeOrganization,
    isPending: activeOrganizationPending,
    refetch: refetchActiveOrganization,
  } = authClient.useActiveOrganization();
  const { data: activeMemberRole } = authClient.useActiveMemberRole();

  const [createOpened, createModal] = useDisclosure(false);
  const [editOpened, editModal] = useDisclosure(false);
  const [feedback, setFeedback] = useState<{
    tone: "red" | "green";
    message: string;
  } | null>(null);
  const [pendingOrganizationId, setPendingOrganizationId] = useState<
    string | null
  >(null);
  const [isDeletingActiveOrganization, setIsDeletingActiveOrganization] =
    useState(false);

  const createForm = useForm<OrganizationFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      slug: "",
      logo: "",
    },
    validate: createOrganizationSchema,
  });

  const editForm = useForm<OrganizationFormValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      slug: "",
      logo: "",
    },
    validate: createOrganizationSchema,
  });

  const activeRole = activeMemberRole?.role;
  const canUpdateActiveOrganization = activeRole
    ? authClient.organization.checkRolePermission({
        role: activeRole,
        permissions: {
          organization: ["update"],
        },
      })
    : false;
  const canDeleteActiveOrganization = activeRole
    ? authClient.organization.checkRolePermission({
        role: activeRole,
        permissions: {
          organization: ["delete"],
        },
      })
    : false;
  const hasActiveOrganization = Boolean(session?.session.activeOrganizationId);
  const redirectPath =
    search.redirect?.startsWith("/dashboard") &&
    search.redirect !== "/dashboard/organizations"
      ? search.redirect
      : null;

  const refreshOrganizations = async () => {
    await Promise.all([
      refetchOrganizations(),
      refetchActiveOrganization(),
      refetchSession(),
    ]);
  };

  const handleCompletionRedirect = () => {
    if (redirectPath) {
      window.location.replace(redirectPath);
      return;
    }

    navigate({ to: "/dashboard", replace: true });
  };

  const handleActivate = async (organizationId: string) => {
    setFeedback(null);
    setPendingOrganizationId(organizationId);

    const { error } = await authClient.organization.setActive({
      organizationId,
    });

    if (error) {
      setFeedback({
        tone: "red",
        message: error.message || "No se pudo activar la organización",
      });
      setPendingOrganizationId(null);
      return;
    }

    await refreshOrganizations();
    setPendingOrganizationId(null);

    if (!hasActiveOrganization || redirectPath) {
      handleCompletionRedirect();
      return;
    }

    setFeedback({
      tone: "green",
      message: "La organización activa se actualizó correctamente.",
    });
  };

  const handleCreate = createForm.onSubmit(async (values) => {
    setFeedback(null);

    const slug = values.slug.trim() || toSlug(values.name);

    if (!slug) {
      createForm.setFieldError("slug", "No pudimos generar un slug válido");
      return;
    }

    const { error } = await authClient.organization.create({
      name: values.name.trim(),
      slug,
      logo: values.logo.trim() || undefined,
    });

    if (error) {
      setFeedback({
        tone: "red",
        message: getErrorMessage(error, "No se pudo crear la organización"),
      });
      return;
    }

    createModal.close();
    createForm.reset();
    await refreshOrganizations();

    if (!hasActiveOrganization || redirectPath) {
      handleCompletionRedirect();
      return;
    }

    setFeedback({
      tone: "green",
      message: "La organización se creó correctamente.",
    });
  });

  const openEditModal = () => {
    if (!activeOrganization) {
      return;
    }

    editForm.setValues({
      name: activeOrganization.name,
      slug: activeOrganization.slug,
      logo: activeOrganization.logo ?? "",
    });
    editModal.open();
  };

  const handleUpdate = editForm.onSubmit(async (values) => {
    if (!activeOrganization) {
      return;
    }

    setFeedback(null);

    const slug = values.slug.trim() || toSlug(values.name);

    if (!slug) {
      editForm.setFieldError("slug", "No pudimos generar un slug válido");
      return;
    }

    const { error } = await authClient.organization.update({
      organizationId: activeOrganization.id,
      data: {
        name: values.name.trim(),
        slug,
        logo: values.logo.trim() || undefined,
      },
    });

    if (error) {
      setFeedback({
        tone: "red",
        message: getErrorMessage(error, "No se pudo actualizar la organización"),
      });
      return;
    }

    editModal.close();
    await refreshOrganizations();
    setFeedback({
      tone: "green",
      message: "La organización activa se actualizó correctamente.",
    });
  });

  const handleDelete = async () => {
    if (!activeOrganization) {
      return;
    }

    setFeedback(null);
    setIsDeletingActiveOrganization(true);

    const { error } = await authClient.organization.delete({
      organizationId: activeOrganization.id,
    });

    if (error) {
      setFeedback({
        tone: "red",
        message: getErrorMessage(error, "No se pudo eliminar la organización"),
      });
      setIsDeletingActiveOrganization(false);
      return;
    }

    await refreshOrganizations();
    setIsDeletingActiveOrganization(false);
    setFeedback({
      tone: "green",
      message:
        "La organización se eliminó. Si todavía tienes otras, selecciona cuál quieres usar.",
    });
  };

  if (sessionPending || organizationsPending || activeOrganizationPending) {
    return (
      <Group justify="center" py="xl">
        <Loader color="brand.6" />
      </Group>
    );
  }

  const organizationList = organizations ?? [];

  return (
    <>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
              Organizaciones
            </Title>
            <Text c="dimmed" mt={4} maw={720}>
              Selecciona la organización activa de tu sesión y administra los
              datos del equipo que estás usando en el dashboard.
            </Text>
          </div>

          <Button
            leftSection={<Plus size={18} />}
            onClick={() => {
              createForm.reset();
              createModal.open();
            }}
          >
            Nueva organización
          </Button>
        </Group>

        {!hasActiveOrganization ? (
          <Alert
            color="brand"
            radius="lg"
            variant="light"
            icon={<Building2 size={18} />}
          >
            <Text fw={700}>No tienes una organización activa.</Text>
            <Text size="sm" mt={4}>
              Crea una nueva o selecciona una existente para desbloquear el resto
              del dashboard.
            </Text>
          </Alert>
        ) : null}

        {redirectPath ? (
          <Alert color="blue" radius="lg" variant="light">
            Después de seleccionar una organización volverás a la sección que
            intentabas abrir.
          </Alert>
        ) : null}

        {feedback ? (
          <Alert
            color={feedback.tone}
            radius="lg"
            icon={
              feedback.tone === "red" ? (
                <AlertCircle size={18} />
              ) : (
                <Check size={18} />
              )
            }
          >
            {feedback.message}
          </Alert>
        ) : null}

        {organizationsError ? (
          <Alert color="red" radius="lg" icon={<AlertCircle size={18} />}>
            {getErrorMessage(
              organizationsError,
              "No pudimos cargar tus organizaciones.",
            )}
          </Alert>
        ) : null}

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Card withBorder radius="xl" p="xl" shadow="sm">
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700} c="dark.8">
                    Tus organizaciones
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Activa una organización para trabajar con sus catálogos,
                    productos y sitios.
                  </Text>
                </div>
                <Badge color="gray" variant="light">
                  {organizationList.length} total
                </Badge>
              </Group>

              <Stack gap="md">
                {organizationList.length === 0 ? (
                  <Card withBorder radius="lg" p="lg" bg="warm.0">
                    <Stack gap="sm" align="flex-start">
                      <ThemeIcon color="brand" variant="light" size="lg" radius="xl">
                        <Building2 size={18} />
                      </ThemeIcon>
                      <Text fw={700}>Todavía no tienes organizaciones</Text>
                      <Text size="sm" c="dimmed">
                        Crea tu primera organización para empezar a configurar tu
                        negocio y compartir catálogos.
                      </Text>
                      <Button
                        variant="light"
                        leftSection={<Plus size={16} />}
                        onClick={() => {
                          createForm.reset();
                          createModal.open();
                        }}
                      >
                        Crear primera organización
                      </Button>
                    </Stack>
                  </Card>
                ) : (
                  organizationList.map((organization) => {
                    const isActive = organization.id === activeOrganization?.id;
                    const isPending = pendingOrganizationId === organization.id;

                    return (
                      <Card
                        key={organization.id}
                        withBorder
                        radius="lg"
                        p="lg"
                        bg={isActive ? "brand.0" : "white"}
                      >
                        <Stack gap="md">
                          <Group justify="space-between" align="flex-start">
                            <div>
                              <Group gap="xs">
                                <Text fw={700} c="dark.8">
                                  {organization.name}
                                </Text>
                                {isActive ? (
                                  <Badge color="brand" variant="filled">
                                    Activa
                                  </Badge>
                                ) : null}
                              </Group>
                              <Text size="sm" c="dimmed" mt={4}>
                                {organization.slug}
                              </Text>
                            </div>

                            <Button
                              variant={isActive ? "light" : "filled"}
                              color={isActive ? "gray" : "brand"}
                              disabled={isActive}
                              loading={isPending}
                              onClick={() => handleActivate(organization.id)}
                            >
                              {isActive ? "En uso" : "Activar"}
                            </Button>
                          </Group>

                          <Group gap="xs">
                            <Badge variant="light" color="gray">
                              Creada {formatDate(organization.createdAt)}
                            </Badge>
                            {organization.logo ? (
                              <Badge variant="light" color="blue">
                                Con logo
                              </Badge>
                            ) : null}
                          </Group>
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>
            </Stack>
          </Card>

          <Card withBorder radius="xl" p="xl" shadow="sm">
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700} c="dark.8">
                    Organización activa
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Ajusta el nombre, el slug y revisa el estado básico del equipo
                    activo en tu sesión.
                  </Text>
                </div>
                {activeOrganization ? (
                  <Badge color="brand" variant="light">
                    {activeRole || "member"}
                  </Badge>
                ) : null}
              </Group>

              {!activeOrganization ? (
                <Card withBorder radius="lg" p="lg" bg="warm.0">
                  <Stack gap="sm">
                    <ThemeIcon color="gray" variant="light" size="lg" radius="xl">
                      <Shield size={18} />
                    </ThemeIcon>
                    <Text fw={700}>No hay organización activa</Text>
                    <Text size="sm" c="dimmed">
                      Activa una de la lista para ver sus detalles y administrar
                      este espacio.
                    </Text>
                  </Stack>
                </Card>
              ) : (
                <>
                  <Card withBorder radius="lg" p="lg" bg="warm.0">
                    <Stack gap="md">
                      <div>
                        <Text fw={700} c="dark.8">
                          {activeOrganization.name}
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          {activeOrganization.slug}
                        </Text>
                      </div>

                      <Divider />

                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Card withBorder radius="md" p="md">
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon color="brand" variant="light" radius="xl">
                              <Users size={16} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Miembros
                              </Text>
                              <Text fw={700} c="dark.8">
                                {activeOrganization.members.length}
                              </Text>
                            </div>
                          </Group>
                        </Card>

                        <Card withBorder radius="md" p="md">
                          <Group gap="sm" wrap="nowrap">
                            <ThemeIcon color="blue" variant="light" radius="xl">
                              <Building2 size={16} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Invitaciones
                              </Text>
                              <Text fw={700} c="dark.8">
                                {activeOrganization.invitations.length}
                              </Text>
                            </div>
                          </Group>
                        </Card>
                      </SimpleGrid>

                      <Text size="sm" c="dimmed">
                        Creada el {formatDate(activeOrganization.createdAt)}
                      </Text>
                    </Stack>
                  </Card>

                  <Group>
                    <Button
                      variant="light"
                      leftSection={<Pencil size={16} />}
                      onClick={openEditModal}
                      disabled={!canUpdateActiveOrganization}
                    >
                      Editar organización activa
                    </Button>
                    <Button
                      color="red"
                      variant="outline"
                      leftSection={<Trash2 size={16} />}
                      onClick={handleDelete}
                      disabled={!canDeleteActiveOrganization}
                      loading={isDeletingActiveOrganization}
                    >
                      Eliminar organización activa
                    </Button>
                  </Group>

                  {!canUpdateActiveOrganization || !canDeleteActiveOrganization ? (
                    <Text size="sm" c="dimmed">
                      Algunas acciones dependen de los permisos de tu rol dentro de
                      esta organización.
                    </Text>
                  ) : null}
                </>
              )}
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>

      <Modal
        opened={createOpened}
        onClose={createModal.close}
        title="Nueva organización"
        radius="xl"
        centered
      >
        <form onSubmit={handleCreate}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Casa Nativa"
              key={createForm.key("name")}
              {...createForm.getInputProps("name")}
            />
            <TextInput
              label="Slug"
              placeholder="casa-nativa"
              description="Si lo dejas vacío, lo generamos a partir del nombre."
              key={createForm.key("slug")}
              {...createForm.getInputProps("slug")}
            />
            <TextInput
              label="Logo"
              placeholder="https://..."
              key={createForm.key("logo")}
              {...createForm.getInputProps("logo")}
            />
            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={createModal.close}>
                Cancelar
              </Button>
              <Button type="submit" loading={createForm.submitting}>
                Crear organización
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={editOpened}
        onClose={editModal.close}
        title="Editar organización activa"
        radius="xl"
        centered
      >
        <form onSubmit={handleUpdate}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Casa Nativa"
              key={editForm.key("name")}
              {...editForm.getInputProps("name")}
            />
            <TextInput
              label="Slug"
              placeholder="casa-nativa"
              key={editForm.key("slug")}
              {...editForm.getInputProps("slug")}
            />
            <TextInput
              label="Logo"
              placeholder="https://..."
              key={editForm.key("logo")}
              {...editForm.getInputProps("logo")}
            />
            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={editModal.close}>
                Cancelar
              </Button>
              <Button type="submit" loading={editForm.submitting}>
                Guardar cambios
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}