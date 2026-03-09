export const itemStatusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "archived", label: "Archivado" },
] as const;

export const productImageAcceptedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const productImageAccept = productImageAcceptedMimeTypes.join(",");

export const productImageMaxUploadBytes = 10 * 1024 * 1024;

export const productImageMaxUploadLabel = "10 MB";

export const modalSelectComboboxProps = { withinPortal: false } as const;

export const getStatusBadgeColor = (status: string) => {
  return status === "active" ? "blue" : "gray";
};

export const formatPrice = (amount: number | null) => {
  if (amount === null) return "Sin precio";
  return `$ ${amount.toLocaleString("es-CO")}`;
};
