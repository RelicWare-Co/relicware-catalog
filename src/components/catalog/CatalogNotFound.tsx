import { Box, Button, Stack, Text, Title } from "@mantine/core";
import { X } from "lucide-react";

export function CatalogNotFound() {
  return (
    <Box
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--mantine-color-warm-1)",
        color: "var(--mantine-color-dark-8)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(12rem, 30vw, 40rem)",
          fontWeight: 900,
          color: "var(--mantine-color-warm-3)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        404
      </Box>

      <Stack gap="xl" align="center" ta="center" style={{ zIndex: 1, maxWidth: 460 }}>
        <Box
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            color: "var(--mantine-color-brand-6)",
            border: "1px solid var(--mantine-color-warm-3)",
            boxShadow: "0 18px 40px rgba(94, 66, 44, 0.08)",
            marginBottom: "1rem",
            transform: "scale(1)",
            animation: "catalog-icon-bounce 2s infinite ease-in-out alternate",
          }}
        >
          <X size={36} strokeWidth={2.5} />
        </Box>

        <Title
          order={1}
          style={{
            fontSize: "clamp(2rem, 5vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            textWrap: "balance",
            color: "var(--mantine-color-dark-8)",
          }}
        >
          No encontramos este catálogo
        </Title>

        <Text
          size="lg"
          style={{
            color: "var(--mantine-color-gray-6)",
            textWrap: "pretty",
            lineHeight: 1.6,
          }}
        >
          Es posible que el enlace sea incorrecto, que el catálogo haya sido
          eliminado o que la organización ya no esté disponible.
        </Text>

        <Button
          component="a"
          href="/"
          size="lg"
          mt="md"
          variant="filled"
          style={{
            height: "3.5rem",
            padding: "0 2rem",
            transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="not-found-btn"
        >
          Volver al inicio
        </Button>
      </Stack>
      <style>{`
        @keyframes catalog-icon-bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
        .not-found-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(232, 107, 50, 0.4);
        }
        .not-found-btn:active {
          transform: translateY(1px);
        }
      `}</style>
    </Box>
  );
}
