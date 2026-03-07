import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const organizationStatements = {
  ...defaultStatements,
  location: ["create", "read", "update", "delete"],
  brandTheme: ["create", "read", "update", "delete"],
  site: ["create", "read", "update", "delete", "publish"],
  siteSection: ["create", "read", "update", "delete", "reorder"],
  siteLink: ["create", "read", "update", "delete", "reorder"],
  catalog: ["create", "read", "update", "delete", "publish"],
  catalogCategory: ["create", "read", "update", "delete", "reorder"],
  catalogItem: [
    "create",
    "read",
    "update",
    "delete",
    "reorder",
    "pricing",
    "inventory",
  ],
  catalogItemVariant: [
    "create",
    "read",
    "update",
    "delete",
    "pricing",
    "inventory",
  ],
  leadRequest: ["read", "update", "export"],
  reservationRequest: ["read", "update", "export", "confirm", "cancel"],
} as const;

export const organizationAc = createAccessControl(organizationStatements);

const fullBusinessPermissions = {
  location: organizationStatements.location,
  brandTheme: organizationStatements.brandTheme,
  site: organizationStatements.site,
  siteSection: organizationStatements.siteSection,
  siteLink: organizationStatements.siteLink,
  catalog: organizationStatements.catalog,
  catalogCategory: organizationStatements.catalogCategory,
  catalogItem: organizationStatements.catalogItem,
  catalogItemVariant: organizationStatements.catalogItemVariant,
  leadRequest: organizationStatements.leadRequest,
  reservationRequest: organizationStatements.reservationRequest,
} as const;

const readOnlyBusinessPermissions = {
  location: ["read"],
  brandTheme: ["read"],
  site: ["read"],
  siteSection: ["read"],
  siteLink: ["read"],
  catalog: ["read"],
  catalogCategory: ["read"],
  catalogItem: ["read"],
  catalogItemVariant: ["read"],
  leadRequest: ["read"],
  reservationRequest: ["read"],
} as const;

const contentManagementPermissions = {
  location: ["read"],
  brandTheme: ["read", "update"],
  site: ["create", "read", "update", "delete", "publish"],
  siteSection: ["create", "read", "update", "delete", "reorder"],
  siteLink: ["create", "read", "update", "delete", "reorder"],
  catalog: ["read"],
  catalogCategory: ["read"],
  catalogItem: ["read"],
  catalogItemVariant: ["read"],
  leadRequest: ["read"],
  reservationRequest: ["read"],
} as const;

const catalogManagementPermissions = {
  location: ["read"],
  brandTheme: ["read"],
  site: ["read"],
  siteSection: ["read"],
  siteLink: ["read"],
  catalog: ["create", "read", "update", "delete", "publish"],
  catalogCategory: ["create", "read", "update", "delete", "reorder"],
  catalogItem: [
    "create",
    "read",
    "update",
    "delete",
    "reorder",
    "pricing",
    "inventory",
  ],
  catalogItemVariant: [
    "create",
    "read",
    "update",
    "delete",
    "pricing",
    "inventory",
  ],
  leadRequest: ["read"],
  reservationRequest: ["read"],
} as const;

const operationsManagementPermissions = {
  location: ["read", "update"],
  brandTheme: ["read"],
  site: ["read"],
  siteSection: ["read"],
  siteLink: ["read"],
  catalog: ["read"],
  catalogCategory: ["read"],
  catalogItem: ["read"],
  catalogItemVariant: ["read"],
  leadRequest: ["read", "update", "export"],
  reservationRequest: ["read", "update", "export", "confirm", "cancel"],
} as const;

export const owner = organizationAc.newRole({
  ...ownerAc.statements,
  ...fullBusinessPermissions,
});

export const admin = organizationAc.newRole({
  ...adminAc.statements,
  ...fullBusinessPermissions,
});

export const member = organizationAc.newRole({
  ...memberAc.statements,
  ...readOnlyBusinessPermissions,
});

export const marketingManager = organizationAc.newRole({
  ...contentManagementPermissions,
});

export const catalogManager = organizationAc.newRole({
  ...catalogManagementPermissions,
});

export const operationsManager = organizationAc.newRole({
  ...operationsManagementPermissions,
});

export const organizationRoles = {
  owner,
  admin,
  member,
  marketing_manager: marketingManager,
  catalog_manager: catalogManager,
  operations_manager: operationsManager,
} as const;

export type OrganizationRoleKey = keyof typeof organizationRoles;

export const organizationRoleMeta: Record<
  OrganizationRoleKey,
  { label: string; description: string }
> = {
  owner: {
    label: "Owner",
    description: "Control total de la organización y de todos los recursos.",
  },
  admin: {
    label: "Admin",
    description: "Gestiona operación, contenido, miembros e invitaciones.",
  },
  member: {
    label: "Member",
    description: "Acceso de solo lectura a los recursos del negocio.",
  },
  marketing_manager: {
    label: "Marketing Manager",
    description: "Administra marca, sitio y experiencia pública del catálogo.",
  },
  catalog_manager: {
    label: "Catalog Manager",
    description: "Gestiona catálogos, categorías, productos y variantes.",
  },
  operations_manager: {
    label: "Operations Manager",
    description: "Gestiona leads, reservaciones y operación de sedes.",
  },
};

export const assignableOrganizationRoles = [
  "admin",
  "member",
  "marketing_manager",
  "catalog_manager",
  "operations_manager",
] as const satisfies readonly OrganizationRoleKey[];

export const permissionSets = {
  manageOrganization: {
    organization: ["update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
  },
  manageBrand: {
    brandTheme: ["create", "read", "update", "delete"],
    site: ["create", "read", "update", "delete", "publish"],
    siteSection: ["create", "read", "update", "delete", "reorder"],
    siteLink: ["create", "read", "update", "delete", "reorder"],
  },
  manageCatalog: {
    catalog: ["create", "read", "update", "delete", "publish"],
    catalogCategory: ["create", "read", "update", "delete", "reorder"],
    catalogItem: [
      "create",
      "read",
      "update",
      "delete",
      "reorder",
      "pricing",
      "inventory",
    ],
    catalogItemVariant: [
      "create",
      "read",
      "update",
      "delete",
      "pricing",
      "inventory",
    ],
  },
  manageOperations: {
    location: ["create", "read", "update", "delete"],
    leadRequest: ["read", "update", "export"],
    reservationRequest: ["read", "update", "export", "confirm", "cancel"],
  },
  readBusinessData: {
    ...readOnlyBusinessPermissions,
  },
} as const;

export const parseOrganizationRoles = (role: string | null | undefined) =>
  role
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) ?? [];
