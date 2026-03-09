import { authClient } from "#/lib/auth-client";
import { getErrorMessage } from "#/lib/get-error-message";
import { type OrganizationRoleKey, organizationRoles } from "#/lib/organization-permissions";
import { type SlugAvailabilityState } from "./types";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugConflictFieldError = "Este slug ya está en uso.";

export const createOrganizationSchema = (values: { name: string; slug: string; logo: string }) => {
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

export const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));

export const createIdleSlugState = (): SlugAvailabilityState => ({
  status: "idle",
  slug: "",
  message: null,
  suggestion: null,
});

export const randomSlugSuffix = () =>
  Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 4);

export const isSlugTakenError = (error: unknown) => {
  const message = getErrorMessage(error, "").toLowerCase();

  return (
    message.includes("organization slug already taken") ||
    message.includes("organization already exists")
  );
};

export const isManagedSlugError = (error: unknown) =>
  typeof error === "string" && error.startsWith(slugConflictFieldError);

export const isOrganizationRoleKey = (role: string): role is OrganizationRoleKey =>
  role in organizationRoles;

export const findAvailableSlugSuggestion = async (
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

export const getSlugAvailability = async ({
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
