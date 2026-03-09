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
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
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
import { type ChangeEvent, useEffect, useState } from "react";

import { authClient } from "#/lib/auth-client";
import { getErrorMessage } from "#/lib/get-error-message";
import {
  type OrganizationRoleKey,
  organizationRoles,
} from "#/lib/organization-permissions";

type OrganizationFormValues = {
  name: string;
  slug: string;
  logo: string;
};

type SlugAvailabilityState = {
  status: "idle" | "checking" | "available" | "taken" | "error";
  slug: string;
  message: string | null;
  suggestion: string | null;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugConflictFieldError = "Este slug ya está en uso.";

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
    timeZone: "UTC",
  }).format(new Date(value));

const createIdleSlugState = (): SlugAvailabilityState => ({
  status: "idle",
  slug: "",
  message: null,
  suggestion: null,
});

const randomSlugSuffix = () =>
  Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 4);

const isSlugTakenError = (error: unknown) => {
  const message = getErrorMessage(error, "").toLowerCase();

  return (
    message.includes("organization slug already taken") ||
    message.includes("organization already exists")
  );
};

const isManagedSlugError = (error: unknown) =>
  typeof error === "string" && error.startsWith(slugConflictFieldError);

const isOrganizationRoleKey = (role: string): role is OrganizationRoleKey =>
  role in organizationRoles;

const findAvailableSlugSuggestion = async (
  baseSlug: string,
  currentSlug?: string | null,
) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `${baseSlug}-${randomSlugSuffix()}`;

    if (candidate === currentSlug) {
      continue;
    }

    const { error } = await authClient.organization.checkSlug({
      slug: candidate,
    });

    if (!error) {
      return candidate;
    }

    if (!isSlugTakenError(error)) {
      return null;
    }
  }

  return null;
};

const getSlugAvailability = async ({
  slug,
  currentSlug,
}: {
  slug: string;
  currentSlug?: string | null;
}): Promise<SlugAvailabilityState> => {
  if (!slug) {
    return createIdleSlugState();
  }

  if (currentSlug && slug === currentSlug) {
    return {
      status: "available",
      slug,
      message: "Puedes conservar el slug actual.",
      suggestion: null,
    };
  }

  const { error } = await authClient.organization.checkSlug({ slug });

  if (!error) {
    return {
      status: "available",
      slug,
      message: `"${slug}" está disponible.`,
      suggestion: null,
    };
  }

  if (!isSlugTakenError(error)) {
    return {
      status: "error",
      slug,
      message: "No pudimos verificar si el slug está disponible en este momento.",
      suggestion: null,
    };
  }

  const suggestion = await findAvailableSlugSuggestion(slug, currentSlug);

  return {
    status: "taken",
    slug,
    message: `"${slug}" ya está en uso.`,
    suggestion,
  };
};

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
  const [createSlugState, setCreateSlugState] = useState<SlugAvailabilityState>(
    () => createIdleSlugState(),
  );
  const [editSlugState, setEditSlugState] = useState<SlugAvailabilityState>(() =>
    createIdleSlugState(),
  );

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
  const hasActiveOrganization = Boolean(session?.session.activeOrganizationId);
  const createCandidateSlug =
    createForm.values.slug.trim() || toSlug(createForm.values.name);
  const editCandidateSlug = editForm.values.slug.trim() || toSlug(editForm.values.name);
  const createHasManualSlug = createForm.values.slug.trim().length > 0;
  const editHasManualSlug = editForm.values.slug.trim().length > 0;
  const createSlugInputError =
    !createHasManualSlug && isManagedSlugError(createForm.errors.slug)
      ? undefined
      : createForm.errors.slug;
  const editSlugInputError =
    !editHasManualSlug && isManagedSlugError(editForm.errors.slug)
      ? undefined
      : editForm.errors.slug;
  const [debouncedCreateCandidateSlug] = useDebouncedValue(createCandidateSlug, 300);
  const [debouncedEditCandidateSlug] = useDebouncedValue(editCandidateSlug, 300);
  const redirectPath =
    search.redirect?.startsWith("/dashboard") &&
    search.redirect !== "/dashboard/organizations"
      ? search.redirect
      : null;

  const clearCreateSlugConflict = () => {
    if (isManagedSlugError(createForm.errors.slug)) {
      createForm.clearFieldError("slug");
    }
  };

  const clearEditSlugConflict = () => {
    if (isManagedSlugError(editForm.errors.slug)) {
      editForm.clearFieldError("slug");
    }
  };

  const handleCreateNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    createForm.setFieldValue("name", event.currentTarget.value);
    clearCreateSlugConflict();
  };

  const handleCreateSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    createForm.setFieldValue("slug", event.currentTarget.value);
    clearCreateSlugConflict();
  };

  const handleEditNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    editForm.setFieldValue("name", event.currentTarget.value);
    clearEditSlugConflict();
  };

  const handleEditSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    editForm.setFieldValue("slug", event.currentTarget.value);
    clearEditSlugConflict();
  };

  useEffect(() => {
    if (!createOpened) {
      setCreateSlugState(createIdleSlugState());
      return;
    }

    if (!debouncedCreateCandidateSlug) {
      setCreateSlugState(createIdleSlugState());
      return;
    }

    if (!slugPattern.test(debouncedCreateCandidateSlug)) {
      setCreateSlugState(createIdleSlugState());
      return;
    }

    let cancelled = false;

    setCreateSlugState({
      status: "checking",
      slug: debouncedCreateCandidateSlug,
      message: `Revisando si "${debouncedCreateCandidateSlug}" está libre...`,
      suggestion: null,
    });

    void getSlugAvailability({ slug: debouncedCreateCandidateSlug }).then(
      (result) => {
        if (cancelled) {
          return;
        }

        setCreateSlugState(result);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [createOpened, debouncedCreateCandidateSlug]);

  useEffect(() => {
    if (!editOpened) {
      setEditSlugState(createIdleSlugState());
      return;
    }

    if (!debouncedEditCandidateSlug) {
      setEditSlugState(createIdleSlugState());
      return;
    }

    if (!slugPattern.test(debouncedEditCandidateSlug)) {
      setEditSlugState(createIdleSlugState());
      return;
    }

    let cancelled = false;

    setEditSlugState({
      status: "checking",
      slug: debouncedEditCandidateSlug,
      message: `Revisando si "${debouncedEditCandidateSlug}" está libre...`,
      suggestion: null,
    });

    void getSlugAvailability({
      slug: debouncedEditCandidateSlug,
      currentSlug: activeOrganization?.slug,
    }).then((result) => {
      if (cancelled) {
        return;
      }

      setEditSlugState(result);
    });

    return () => {
      cancelled = true;
    };
  }, [activeOrganization?.slug, debouncedEditCandidateSlug, editOpened]);

  const refreshOrganizations = async () => {
    await Promise.all([
      refetchOrganizations(),
      refetchActiveOrganization(),
      refetchSession(),
    ]);
  };

  const handleCompletionRedirect = () => {
    if (redirectPath) {
      window.location.href = redirectPath;
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

    const slugAvailability = await getSlugAvailability({ slug });

    setCreateSlugState(slugAvailability);

    if (slugAvailability.status === "taken") {
      if (values.slug.trim()) {
        createForm.setFieldError("slug", slugConflictFieldError);
      }
      return;
    }

    const { error } = await authClient.organization.create({
      name: values.name.trim(),
      slug,
      logo: values.logo.trim() || undefined,
    });

    if (error) {
      if (isSlugTakenError(error)) {
        const nextSlugState = await getSlugAvailability({ slug });

        setCreateSlugState(nextSlugState);
        if (values.slug.trim()) {
          createForm.setFieldError("slug", slugConflictFieldError);
        }
        return;
      }

      setFeedback({
        tone: "red",
        message: getErrorMessage(error, "No se pudo crear la organización"),
      });
      return;
    }

    createModal.close();
    createForm.reset();
    setCreateSlugState(createIdleSlugState());
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
    setEditSlugState({
      status: "available",
      slug: activeOrganization.slug,
      message: "Puedes conservar el slug actual.",
      suggestion: null,
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

    const slugAvailability = await getSlugAvailability({
      slug,
      currentSlug: activeOrganization.slug,
    });

    setEditSlugState(slugAvailability);

    if (slugAvailability.status === "taken") {
      if (values.slug.trim()) {
        editForm.setFieldError("slug", slugConflictFieldError);
      }
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
      if (isSlugTakenError(error)) {
        const nextSlugState = await getSlugAvailability({
          slug,
          currentSlug: activeOrganization.slug,
        });

        setEditSlugState(nextSlugState);
        if (values.slug.trim()) {
          editForm.setFieldError("slug", slugConflictFieldError);
        }
        return;
      }

      setFeedback({
        tone: "red",
        message: getErrorMessage(error, "No se pudo actualizar la organización"),
      });
      return;
    }

    editModal.close();
    setEditSlugState(createIdleSlugState());
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

  if ((sessionPending || organizationsPending || activeOrganizationPending) && !editModal) {
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
              setCreateSlugState(createIdleSlugState());
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
                          setCreateSlugState(createIdleSlugState());
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
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
      >
        <form onSubmit={handleCreate}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Casa Nativa"
              key={createForm.key("name")}
              {...createForm.getInputProps("name")}
              onChange={handleCreateNameChange}
            />
            <Stack gap="xs">
              <TextInput
                label="Slug"
                placeholder="casa-nativa"
                description={
                  createHasManualSlug
                    ? "Usa solo minúsculas, números y guiones."
                    : "Si lo dejas vacío, lo generamos a partir del nombre."
                }
                key={createForm.key("slug")}
                {...createForm.getInputProps("slug")}
                error={createSlugInputError}
                onChange={handleCreateSlugChange}
              />
              {!createHasManualSlug && createCandidateSlug ? (
                <Text size="xs" c="dimmed">
                  Slug que se intentará usar: {createCandidateSlug}
                </Text>
              ) : null}
              {createSlugState.status === "checking" ? (
                <Text size="xs" c="dimmed">
                  {createSlugState.message}
                </Text>
              ) : null}
              {createSlugState.status === "available" ? (
                <Text size="xs" c="teal.7">
                  {createSlugState.message}
                </Text>
              ) : null}
              {createSlugState.status === "error" ? (
                <Text size="xs" c="dimmed">
                  {createSlugState.message}
                </Text>
              ) : null}
              {createSlugState.status === "taken" ? (
                <Alert color="orange" radius="lg" variant="light" icon={<AlertCircle size={16} />}>
                  <Stack gap="xs">
                    <Text size="sm">{createSlugState.message}</Text>
                    {createSlugState.suggestion ? (
                      <Group gap="xs" align="center">
                        <Badge color="orange" variant="light">
                          {createSlugState.suggestion}
                        </Badge>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => {
                            createForm.setFieldValue("slug", createSlugState.suggestion ?? "");
                            clearCreateSlugConflict();
                          }}
                        >
                          Usar sugerencia
                        </Button>
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Intenta con una variante corta al final, por ejemplo:
                        {` ${createSlugState.slug}-a1b2`}
                      </Text>
                    )}
                  </Stack>
                </Alert>
              ) : null}
            </Stack>
            <TextInput
              label="Logo"
              placeholder="https://..."
              key={createForm.key("logo")}
              {...createForm.getInputProps("logo")}
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  createModal.close();
                  setCreateSlugState(createIdleSlugState());
                }}
              >
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
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
      >
        <form onSubmit={handleUpdate}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Casa Nativa"
              key={editForm.key("name")}
              {...editForm.getInputProps("name")}
              onChange={handleEditNameChange}
            />
            <Stack gap="xs">
              <TextInput
                label="Slug"
                placeholder="casa-nativa"
                key={editForm.key("slug")}
                {...editForm.getInputProps("slug")}
                error={editSlugInputError}
                onChange={handleEditSlugChange}
              />
              {!editHasManualSlug && editCandidateSlug ? (
                <Text size="xs" c="dimmed">
                  Slug que se intentará usar: {editCandidateSlug}
                </Text>
              ) : null}
              {editSlugState.status === "checking" ? (
                <Text size="xs" c="dimmed">
                  {editSlugState.message}
                </Text>
              ) : null}
              {editSlugState.status === "available" ? (
                <Text size="xs" c="teal.7">
                  {editSlugState.message}
                </Text>
              ) : null}
              {editSlugState.status === "error" ? (
                <Text size="xs" c="dimmed">
                  {editSlugState.message}
                </Text>
              ) : null}
              {editSlugState.status === "taken" ? (
                <Alert color="orange" radius="lg" variant="light" icon={<AlertCircle size={16} />}>
                  <Stack gap="xs">
                    <Text size="sm">{editSlugState.message}</Text>
                    {editSlugState.suggestion ? (
                      <Group gap="xs" align="center">
                        <Badge color="orange" variant="light">
                          {editSlugState.suggestion}
                        </Badge>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => {
                            editForm.setFieldValue("slug", editSlugState.suggestion ?? "");
                            clearEditSlugConflict();
                          }}
                        >
                          Usar sugerencia
                        </Button>
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Prueba agregando un sufijo corto al final para evitar el conflicto.
                      </Text>
                    )}
                  </Stack>
                </Alert>
              ) : null}
            </Stack>
            <TextInput
              label="Logo"
              placeholder="https://..."
              key={editForm.key("logo")}
              {...editForm.getInputProps("logo")}
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  editModal.close();
                  setEditSlugState(createIdleSlugState());
                }}
              >
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