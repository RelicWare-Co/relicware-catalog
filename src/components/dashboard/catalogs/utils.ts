export const catalogStatusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "archived", label: "Archivado" },
] as const;

export const priceDisplayModeOptions = [
  { value: "exact", label: "Precio exacto" },
  { value: "starting_at", label: "Desde" },
  { value: "hidden", label: "Ocultar precios" },
] as const;

export const modalSelectComboboxProps = { withinPortal: false } as const;
