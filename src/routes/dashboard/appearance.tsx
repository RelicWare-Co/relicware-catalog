import {
  Box,
  Button,
  Card,
  Center,
  ColorInput,
  Divider,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { getErrorMessage } from "#/lib/get-error-message";
import { orpc } from "#/orpc/client";

export const Route = createFileRoute("/dashboard/appearance")({
  component: AppearancePage,
});

function AppearancePage() {
  const queryClient = useQueryClient();

  const syncThemeQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.site.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.operations.key() }),
      queryClient.refetchQueries({
        queryKey: orpc.site.listThemes.queryKey({ input: { limit: 100 } }),
      }),
    ]);
  };

  const { data: themesResult, isLoading } = useQuery(
    orpc.site.listThemes.queryOptions({ input: { limit: 100 } })
  );

  const activeTheme =
    themesResult?.items?.find((item) => item.isDefault) ??
    themesResult?.items?.[0];

  const [theme, setTheme] = useState({
    primaryColor: "#09090b",
    backgroundColor: "#fafafa",
    textColor: "#18181b",
    cardStyle: "elevated",
    borderRadius: "lg",
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (activeTheme && !isDataLoaded) {
      setTheme({
        primaryColor: activeTheme.primaryColor || "#09090b",
        backgroundColor: activeTheme.backgroundColor || "#fafafa",
        textColor: activeTheme.textColor || "#18181b",
        cardStyle: activeTheme.cardStyle || "elevated",
        borderRadius: activeTheme.borderRadius || "lg",
      });
      setIsDataLoaded(true);
    } else if (!activeTheme && themesResult && !isDataLoaded) {
      // Finished loading, no theme
      setIsDataLoaded(true);
    }
  }, [activeTheme, themesResult, isDataLoaded]);

  const updateMutation = useMutation(
    orpc.site.updateTheme.mutationOptions({
      onSuccess: async () => {
        await syncThemeQueries();
        notifications.show({
          title: "Tema actualizado",
          message: "Los cambios se han guardado exitosamente.",
          color: "teal",
        });
      },
      onError: (err) => {
        notifications.show({
          title: "Error al guardar",
          message: getErrorMessage(err, "Ha ocurrido un error."),
          color: "red",
        });
      },
    })
  );

  const createMutation = useMutation(
    orpc.site.createTheme.mutationOptions({
      onSuccess: async () => {
        await syncThemeQueries();
        notifications.show({
          title: "Tema guardado",
          message: "Los cambios se han guardado exitosamente.",
          color: "teal",
        });
      },
      onError: (err) => {
        notifications.show({
          title: "Error al guardar",
          message: getErrorMessage(err, "Ha ocurrido un error."),
          color: "red",
        });
      },
    })
  );

  const handleSave = () => {
    const payload = {
      primaryColor: theme.primaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      cardStyle: theme.cardStyle as "elevated" | "outlined" | "flat",
      borderRadius: theme.borderRadius as "none" | "sm" | "md" | "lg" | "xl" | "full",
    };

    if (activeTheme) {
      updateMutation.mutate({
        id: activeTheme.id,
        ...payload,
      });
    } else {
      createMutation.mutate({
        ...payload,
        name: "Principal",
        isDefault: true,
      });
    }
  };

  const isSaving = updateMutation.isPending || createMutation.isPending;

  const getRadiusAttr = (radius: string) => {
    switch (radius) {
      case "none":
        return "0px";
      case "sm":
        return "4px";
      case "md":
        return "8px";
      case "lg":
        return "12px";
      case "xl":
        return "20px";
      case "full":
        return "999px";
      default:
        return "12px";
    }
  };

  const borderRadius = getRadiusAttr(theme.borderRadius);
  const cardBorder =
    theme.cardStyle === "outlined" ? "1px solid #e4e4e7" : "none";
  const cardShadow =
    theme.cardStyle === "elevated" ? "0 8px 30px rgba(0,0,0,0.04)" : "none";

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
            Apariencia
          </Title>
          <Text c="dimmed" mt={4}>
            Personaliza cómo se ve tu catálogo para tus clientes.
          </Text>
        </div>
        <Button
          color="brand"
          leftSection={<Save size={16} />}
          loading={isSaving}
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
        <Stack gap="xl">
          <Card
            withBorder
            radius="lg"
            p="xl"
            shadow="sm"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Stack gap="md">
              <Title order={4} c="dark.8">
                Colores
              </Title>
              <Divider />

              <Group grow align="flex-start">
                <ColorInput
                  label="Color Primario"
                  description="Acentos y botones"
                  value={theme.primaryColor}
                  onChange={(val) =>
                    setTheme((t) => ({ ...t, primaryColor: val }))
                  }
                />
                <ColorInput
                  label="Color de Fondo"
                  description="Fondo de la página"
                  value={theme.backgroundColor}
                  onChange={(val) =>
                    setTheme((t) => ({ ...t, backgroundColor: val }))
                  }
                />
              </Group>

              <ColorInput
                label="Color de Texto"
                description="Texto principal"
                value={theme.textColor}
                onChange={(val) => setTheme((t) => ({ ...t, textColor: val }))}
              />
            </Stack>
          </Card>

          <Card
            withBorder
            radius="lg"
            p="xl"
            shadow="sm"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Stack gap="md">
              <Title order={4} c="dark.8">
                Estilo de Componentes
              </Title>
              <Divider />

              <Select
                label="Bordes"
                description="Redondeo de tarjetas y botones"
                value={theme.borderRadius}
                onChange={(val) =>
                  setTheme((t) => ({ ...t, borderRadius: val || "lg" }))
                }
                data={[
                  { value: "none", label: "Cuadrado (0px)" },
                  { value: "sm", label: "Pequeño (4px)" },
                  { value: "md", label: "Mediano (8px)" },
                  { value: "lg", label: "Grande (12px)" },
                  { value: "xl", label: "Extra grande (20px)" },
                  { value: "full", label: "Píldora (999px)" },
                ]}
              />

              <Select
                label="Estilo de Tarjetas"
                description="¿Cómo se verán los productos?"
                value={theme.cardStyle}
                onChange={(val) =>
                  setTheme((t) => ({ ...t, cardStyle: val || "elevated" }))
                }
                data={[
                  { value: "flat", label: "Plano" },
                  { value: "outlined", label: "Con borde" },
                  { value: "elevated", label: "Elevado (Sombra)" },
                ]}
              />
            </Stack>
          </Card>
        </Stack>

        <Box>
          <Text fw={600} mb="md" c="dark.8">
            Vista Previa (Móvil)
          </Text>
          <Box
            style={{
              width: "100%",
              maxWidth: 360,
              height: 700,
              margin: "0 auto",
              border: "12px solid #1a1a1a",
              borderRadius: "2.5rem",
              overflow: "hidden",
              position: "relative",
              backgroundColor: theme.backgroundColor,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              transition: "background-color 200ms ease",
            }}
          >
            {/* Pantalla simulada del catalogo */}
            <Box
              style={{
                height: "100%",
                overflowY: "auto",
                paddingBottom: 40,
                // Ocultar scrollbar visualmente
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Box p="md" mt={32}>
                <Title
                  order={2}
                  ta="center"
                  style={{ color: theme.textColor, marginBottom: 8 }}
                >
                  Mi Tienda
                </Title>
                <Text
                  size="sm"
                  ta="center"
                  style={{ color: theme.textColor, opacity: 0.7 }}
                >
                  Los mejores productos para ti
                </Text>
              </Box>

              <Stack gap="md" p="md">
                <Text fw={600} style={{ color: theme.textColor }}>
                  Más vendidos
                </Text>

                {[1, 2, 3].map((item) => (
                  <Card
                    key={item}
                    p="sm"
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: borderRadius,
                      border: cardBorder,
                      boxShadow: cardShadow,
                      transition: "all 200ms ease",
                    }}
                  >
                    <Group wrap="nowrap" align="flex-start">
                      <Box
                        w={80}
                        h={80}
                        style={{
                          backgroundColor: "#f4f4f5",
                          borderRadius: `calc(${
                            borderRadius === "999px" ? "12px" : borderRadius
                          } * 0.7)`,
                        }}
                      />
                      <Box flex={1}>
                        <Text
                          fw={600}
                          size="sm"
                          style={{ color: theme.textColor }}
                        >
                          Producto de ejemplo {item}
                        </Text>
                        <Text
                          size="xs"
                          mt={4}
                          style={{ color: theme.textColor, opacity: 0.6 }}
                        >
                          Lleva la mejor calidad siempre a tu mesa.
                        </Text>
                        <Text
                          fw={700}
                          mt={8}
                          style={{ color: theme.primaryColor }}
                        >
                          $25.000
                        </Text>
                      </Box>
                    </Group>
                  </Card>
                ))}

                <Button
                  mt="xl"
                  fullWidth
                  size="md"
                  leftSection={<MessageCircle size={20} />}
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: "#fafafa",
                    borderRadius: borderRadius,
                    transition: "all 200ms ease",
                  }}
                >
                  Pedir por WhatsApp
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}