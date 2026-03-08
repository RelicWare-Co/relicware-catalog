import { createTheme, rem } from "@mantine/core";

const fieldLabelStyles = {
  fontWeight: 600,
  color: "#4A4A4A",
  marginBottom: rem(6),
};

const fieldDescriptionStyles = {
  color: "var(--mantine-color-gray-6)",
  marginTop: rem(6),
};

const fieldInputStyles = {
  backgroundColor: "#FFFFFF",
  borderColor: "var(--mantine-color-warm-4)",
  color: "var(--mantine-color-dark-8)",
  transitionProperty: "border-color, box-shadow, background-color",
  transitionDuration: "150ms",
  "&::placeholder": {
    color: "var(--mantine-color-gray-5)",
  },
  "&:focus": {
    borderColor: "var(--mantine-color-brand-6)",
    boxShadow: "0 0 0 1px var(--mantine-color-brand-6)",
  },
  "&:focusWithin": {
    borderColor: "var(--mantine-color-brand-6)",
    boxShadow: "0 0 0 1px var(--mantine-color-brand-6)",
  },
  "&[dataExpanded='true']": {
    borderColor: "var(--mantine-color-brand-6)",
    boxShadow: "0 0 0 1px var(--mantine-color-brand-6)",
  },
};

const fieldDropdownStyles = {
  backgroundColor: "#FFFFFF",
  borderColor: "var(--mantine-color-warm-3)",
  boxShadow: "0 18px 40px rgba(94, 66, 44, 0.12)",
};

const fieldOptionStyles = {
  color: "var(--mantine-color-dark-8)",
  "&[dataChecked]": {
    backgroundColor: "var(--mantine-color-brand-0)",
    color: "var(--mantine-color-brand-8)",
  },
  "&[dataHovered]": {
    backgroundColor: "var(--mantine-color-warm-1)",
  },
};

export const theme = createTheme({
  primaryColor: "brand",
  // Generamos una paleta de 10 tonos para nuestro color principal (Naranja Terracota)
  // y para los tonos neutros cálidos.
  colors: {
    brand: [
      "#fdf3ed",
      "#fae3d5",
      "#f5c5a8",
      "#efa477",
      "#eb884d",
      "#e87530",
      "#e86b32", // [6] Main (Usado en botones)
      "#cf5c28", // [7] Hover
      "#b84d1e",
      "#a04118",
    ],
    warm: [
      "#faf8f5",
      "#f9f6f0", // [1] Main background
      "#f2efe9",
      "#ebe7e0",
      "#e5e0d8", // [4] Input borders
      "#dcd6cd",
      "#d3cbc0",
      "#c9c0b3",
      "#c0b5a6",
      "#b6aa9a",
    ],
  },
  // Sobreescribimos la tipografía si lo deseas
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  headings: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    sizes: {
      h1: { fontSize: rem(38), fontWeight: "800" },
      h2: { fontSize: rem(32), fontWeight: "700" },
    },
  },
  // Configuración global de componentes
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        fw: 600,
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        input: fieldInputStyles,
        label: fieldLabelStyles,
        description: fieldDescriptionStyles,
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        input: fieldInputStyles,
        innerInput: {
          "&:focus": {
            borderColor: "transparent",
          },
        },
        label: fieldLabelStyles,
        description: fieldDescriptionStyles,
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        input: fieldInputStyles,
        label: fieldLabelStyles,
        description: fieldDescriptionStyles,
        dropdown: fieldDropdownStyles,
        option: fieldOptionStyles,
      },
    },
    ColorInput: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        input: fieldInputStyles,
        label: fieldLabelStyles,
        description: fieldDescriptionStyles,
        dropdown: fieldDropdownStyles,
      },
    },
    Switch: {
      defaultProps: {
        color: "brand.6",
      },
      styles: {
        body: {
          alignItems: "center",
        },
        label: fieldLabelStyles,
        description: fieldDescriptionStyles,
        track: {
          backgroundColor: "var(--mantine-color-warm-2)",
          borderColor: "var(--mantine-color-warm-4)",
          transitionProperty: "background-color, border-color, box-shadow",
          transitionDuration: "150ms",
          "&[dataChecked]": {
            backgroundColor: "var(--mantine-color-brand-6)",
            borderColor: "var(--mantine-color-brand-6)",
          },
        },
        thumb: {
          borderWidth: 0,
        },
      },
    },
  },
});
