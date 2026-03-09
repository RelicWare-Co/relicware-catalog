import {
  Alert,
  Button,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  Check,
  Plus,
} from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import {
  ActiveOrganizationDetails,
  CreateOrganizationModal,
  createIdleSlugState,
  createOrganizationSchema,
  EditOrganizationModal,
  getSlugAvailability,
  isManagedSlugError,
  isOrganizationRoleKey,
  isSlugTakenError,
  type OrganizationFormValues,
  OrganizationList,
  type SlugAvailabilityState,
  slugConflictFieldError,
  slugPattern,
  toSlug,
} from "#/components/dashboard/organizations";
import { authClient } from "#/lib/auth-client";
import { getErrorMessage } from "#/lib/get-error-message";

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
          <OrganizationList
            organizationList={organizationList}
            activeOrganizationId={activeOrganization?.id}
            pendingOrganizationId={pendingOrganizationId}
            onCreateOpen={() => {
              createForm.reset();
              setCreateSlugState(createIdleSlugState());
              createModal.open();
            }}
            onActivate={handleActivate}
          />

          <ActiveOrganizationDetails
            activeOrganization={activeOrganization}
            activeRole={activeRole}
            canUpdate={canUpdateActiveOrganization}
            canDelete={canDeleteActiveOrganization}
            isDeleting={isDeletingActiveOrganization}
            onEditOpen={openEditModal}
            onDelete={handleDelete}
          />
        </SimpleGrid>
      </Stack>

      <CreateOrganizationModal
        opened={createOpened}
        onClose={createModal.close}
        form={createForm}
        onSubmit={handleCreate}
        onNameChange={handleCreateNameChange}
        onSlugChange={handleCreateSlugChange}
        hasManualSlug={createHasManualSlug}
        slugInputError={createSlugInputError}
        candidateSlug={createCandidateSlug}
        slugState={createSlugState}
        onUseSuggestion={() => {
          createForm.setFieldValue("slug", createSlugState.suggestion ?? "");
          clearCreateSlugConflict();
        }}
        onCancelClick={() => {
          createModal.close();
          setCreateSlugState(createIdleSlugState());
        }}
      />

      <EditOrganizationModal
        opened={editOpened}
        onClose={editModal.close}
        form={editForm}
        onSubmit={handleUpdate}
        onNameChange={handleEditNameChange}
        onSlugChange={handleEditSlugChange}
        hasManualSlug={editHasManualSlug}
        slugInputError={editSlugInputError}
        candidateSlug={editCandidateSlug}
        slugState={editSlugState}
        onUseSuggestion={() => {
          editForm.setFieldValue("slug", editSlugState.suggestion ?? "");
          clearEditSlugConflict();
        }}
        onCancelClick={() => {
          editModal.close();
          setEditSlugState(createIdleSlugState());
        }}
      />
    </>
  );
}