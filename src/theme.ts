import { createTheme, rem } from "@mantine/core";

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
        input: {
          backgroundColor: "#FFFFFF",
          borderColor: "var(--mantine-color-warm-4)",
          "&:focus": {
            borderColor: "var(--mantine-color-brand-6)",
          },
        },
        label: {
          fontWeight: 600,
          color: "#4A4A4A",
          marginBottom: rem(6),
        },
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        input: {
          backgroundColor: "#FFFFFF",
          borderColor: "var(--mantine-color-warm-4)",
          "&:focus": {
            borderColor: "var(--mantine-color-brand-6)",
          },
        },
        innerInput: {
          "&:focus": {
            borderColor: "transparent",
          },
        },
        label: {
          fontWeight: 600,
          color: "#4A4A4A",
          marginBottom: rem(6),
        },
      },
    },
  },
});
