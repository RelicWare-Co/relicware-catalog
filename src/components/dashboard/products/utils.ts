export const itemStatusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "archived", label: "Archivado" },
] as const;

export const modalSelectComboboxProps = { withinPortal: false } as const;

export const getStatusBadgeColor = (status: string) => {
  return status === "active" ? "blue" : "gray";
};

export const formatPrice = (amount: number | null) => {
  if (amount === null) return "Sin precio";
  return `$ ${amount.toLocaleString("es-CO")}`;
};
