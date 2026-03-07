import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Plus, Smartphone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/catalogs")({
  component: CatalogsPage,
});

function LivePreview() {
  return (
    <Box
      w={320}
      h={640}
      bg="warm-1"
      style={{
        borderRadius: "3rem",
        border: "8px solid #2C2E33",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      {/* Notch indicator */}
      <Box
        w={100}
        h={24}
        bg="#2C2E33"
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          zIndex: 10,
        }}
      />

      <ScrollArea
        h="100%"
        type="never"
        p="lg"
        style={{ backgroundColor: "#FAF8F5" }}
      >
        <Stack gap="xl" mt="xl" pt="xl" align="center">
          <Box
            w={96}
            h={96}
            style={{
              borderRadius: "40%",
              backgroundColor: "var(--mantine-color-brand-2)",
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596683803131-01ec35b8ddc3?w=400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            }}
          />
          <Stack gap={4} align="center">
            <Title
              order={3}
              style={{
                fontFamily: "var(--mantine-font-family-headings)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "var(--mantine-color-dark-8)",
              }}
            >
              Panadería El Molino
            </Title>
            <Text c="var(--mantine-color-warm-6)" size="sm" fw={600}>
              Recién horneado todos los días
            </Text>
          </Stack>

          <Stack w="100%" gap="sm">
            <Button
              variant="filled"
              color="brand.6"
              radius="xl"
              size="lg"
              fullWidth
              style={{
                boxShadow: "0 8px 20px rgba(var(--mantine-color-brand-6), 0.3)",
                fontWeight: 800,
                border: "none",
              }}
            >
              Hacer Pedido en WhatsApp
            </Button>
            <Button
              variant="white"
              color="dark"
              radius="xl"
              size="lg"
              fullWidth
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontWeight: 800,
                color: "var(--mantine-color-dark-8)",
              }}
            >
              Nuestra Ubicación
            </Button>
          </Stack>

          <Box mt="md" w="100%">
            <Text
              size="xl"
              fw={900}
              mb="sm"
              style={{
                letterSpacing: "-0.03em",
                color: "var(--mantine-color-dark-9)",
              }}
            >
              🥐 Panadería Clásica
            </Text>
            <Box
              p="md"
              style={{
                backgroundColor: "white",
                borderRadius: "2rem",
                boxShadow: "0 8px 30px rgba(220, 215, 210, 0.5)",
                overflow: "hidden",
                transform: "translateZ(0)",
              }}
            >
              <Group wrap="nowrap" align="start">
                <Box
                  w={72}
                  h={72}
                  style={{
                    borderRadius: "1.2rem",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    flexShrink: 0,
                  }}
                />
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text fw={800} size="md" style={{ letterSpacing: "-0.02em" }}>
                    Pan de Bono Artesanal
                  </Text>
                  <Text
                    c="var(--mantine-color-warm-6)"
                    size="sm"
                    style={{ lineHeight: 1.3, marginTop: 4 }}
                  >
                    Queso doble crema y almidón de yuca
                  </Text>
                  <Text
                    fw={900}
                    mt={6}
                    style={{ color: "var(--mantine-color-brand-7)" }}
                  >
                    $ 2.500
                  </Text>
                </Stack>
              </Group>
            </Box>
          </Box>
        </Stack>
      </ScrollArea>
    </Box>
  );
}

function CatalogsPage() {
  const [categories, _setCategories] = useState([
    { id: "1", name: "Panadería Clásica", items: 3 },
    { id: "2", name: "Postres y Tortas", items: 5 },
    { id: "3", name: "Bebidas Calientes", items: 2 },
  ]);

  return (
    <Flex h="calc(100vh - 80px)" gap="xl" wrap="nowrap">
      {/* Left Area: Builder Controls (60%) */}
      <Stack style={{ flex: 1 }} p="xl" gap="xl">
        <Box mb="xl">
          <Badge
            color="brand.1"
            c="brand.8"
            size="lg"
            radius="sm"
            mb="xs"
            style={{ fontWeight: 800 }}
          >
            Editor Visual
          </Badge>
          <Title
            order={1}
            fw={900}
            style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}
          >
            Módulo de Catálogo
          </Title>
          <Text c="var(--mantine-color-warm-6)" mt={8} size="lg">
            Personaliza la experiencia de tus clientes. Los cambios se guardan y
            reflejan al instante. Sin procesos complicados.
          </Text>
        </Box>

        <Stack gap="lg">
          <Flex align="center" justify="space-between">
            <Title order={3} fw={800} style={{ letterSpacing: "-0.02em" }}>
              Categorías
            </Title>
            <Button
              variant="light"
              color="brand.6"
              leftSection={<Plus size={18} strokeWidth={3} />}
              radius="xl"
              size="md"
              style={{ fontWeight: 700 }}
            >
              Nueva categoría
            </Button>
          </Flex>

          <Stack gap="sm">
            {categories.map((cat) => (
              <Box
                key={cat.id}
                p="md"
                style={{
                  backgroundColor: "white",
                  borderRadius: "2rem",
                  transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  cursor: "grab",
                  boxShadow: "0 8px 24px rgba(220, 210, 200, 0.4)",
                  border: "2px solid transparent",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 32px rgba(220, 210, 200, 0.6)";
                  e.currentTarget.style.borderColor =
                    "var(--mantine-color-brand-1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(220, 210, 200, 0.4)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <Group wrap="nowrap" align="center">
                  <ActionIcon variant="transparent" color="warm.4" size="lg">
                    <GripVertical size={20} style={{ strokeWidth: 2.5 }} />
                  </ActionIcon>

                  <TextInput
                    variant="unstyled"
                    defaultValue={cat.name}
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--mantine-color-dark-8)",
                      },
                    }}
                  />

                  <Badge
                    variant="light"
                    color="brand.6"
                    radius="xl"
                    size="lg"
                    style={{
                      textTransform: "lowercase",
                      fontWeight: 800,
                      backgroundColor: "var(--mantine-color-brand-0)",
                      color: "var(--mantine-color-brand-8)",
                    }}
                  >
                    {cat.items} prods
                  </Badge>
                </Group>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Stack>

      {/* Right Area: Live Preview (40%) */}
      <Box
        p="xl"
        bg="gray.0"
        style={{
          width: "450px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderLeft: "1px solid var(--mantine-color-gray-2)",
          borderTopLeftRadius: "32px",
        }}
      >
        <Stack align="center" gap="md">
          <Group gap="xs">
            <Smartphone size={18} color="var(--mantine-color-gray-6)" />
            <Text
              size="sm"
              fw={600}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: 1 }}
            >
              Vista Previa en Vivo
            </Text>
          </Group>
          <LivePreview />
        </Stack>
      </Box>
    </Flex>
  );
}
