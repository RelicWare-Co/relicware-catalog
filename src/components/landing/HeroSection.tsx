import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Check, ChevronRight, Smartphone, Store } from "lucide-react";
import { HeroAnimation } from "./HeroAnimation";

const glassPanelStyle = {
  borderColor: "var(--landing-border)",
  backdropFilter: "blur(10px)",
} as const;

export function HeroSection() {
  return (
    <Box className="hero-shell">
      <Container size="xl" pt={{ base: 24, md: 56 }} pb={{ base: 64, md: 92 }}>
        <Grid align="center" gutter={{ base: 44, md: 72 }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack
              align="flex-start"
              gap="xl"
              pos="relative"
              style={{ zIndex: 1 }}
            >
              <Badge
                size="lg"
                radius="xl"
                variant="light"
                color="brand"
                className="section-eyebrow"
              >
                Hecho para dueños de negocios
              </Badge>

              <Stack gap="md">
                <Title
                  order={1}
                  fw={900}
                  maw={700}
                  className="landing-display landing-ink-strong"
                >
                  Tu menú y catálogo dejan de sentirse improvisados.
                </Title>

                <Text
                  size="xl"
                  maw={580}
                  className="landing-ink landing-copy"
                  lh={1.65}
                >
                  Publica un catálogo digital claro, con tu propio link y QR
                  listos para compartir. Tus clientes encuentran lo que vendes
                  más rápido y tu equipo actualiza todo sin depender de PDFs.
                </Text>
              </Stack>

              <Group gap="md" mt={4}>
                <Button
                  component={Link}
                  to="/register"
                  size="lg"
                  color="brand"
                  radius="xl"
                  className="landing-focus"
                  rightSection={<ChevronRight size={20} aria-hidden="true" />}
                >
                  Crear mi menú gratis
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  size="lg"
                  variant="default"
                  radius="xl"
                  className="landing-outline-button landing-focus"
                >
                  Iniciar sesión
                </Button>
              </Group>

              <Grid w="100%" gutter="sm" mt={8}>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper
                    p="md"
                    radius="xl"
                    withBorder
                    className="landing-panel proof-chip surface-card"
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="brand"
                        variant="light"
                      >
                        <Check size={12} aria-hidden="true" />
                      </ThemeIcon>
                      <Text fw={700} className="landing-ink-strong" size="sm">
                        QR listos al instante
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper
                    p="md"
                    radius="xl"
                    withBorder
                    className="landing-panel proof-chip surface-card"
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="brand"
                        variant="light"
                      >
                        <Store size={12} aria-hidden="true" />
                      </ThemeIcon>
                      <Text fw={700} className="landing-ink-strong" size="sm">
                        Cambios visibles en vivo
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
                  <Paper
                    p="md"
                    radius="xl"
                    withBorder
                    className="landing-panel proof-chip surface-card"
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="brand"
                        variant="light"
                      >
                        <Smartphone size={12} aria-hidden="true" />
                      </ThemeIcon>
                      <Text fw={700} className="landing-ink-strong" size="sm">
                        Link ideal para WhatsApp y bio
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg" pos="relative" style={{ zIndex: 1 }}>
              <Paper
                p={{ base: "lg", md: "xl" }}
                radius="xl"
                withBorder
                className="landing-panel"
                style={glassPanelStyle}
              >
                <HeroAnimation />
              </Paper>

              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 7 }}>
                  <Paper
                    p="lg"
                    radius="xl"
                    className="landing-panel-strong surface-card"
                  >
                    <Text
                      size="sm"
                      fw={700}
                      className="landing-inverse-soft"
                      mb={8}
                    >
                      Flujo más directo
                    </Text>
                    <Title
                      order={3}
                      c="brand.0"
                      className="landing-card-title"
                      style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
                    >
                      Menos mensajes repetidos. Más clientes listos para
                      decidir.
                    </Title>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 5 }}>
                  <Paper
                    p="lg"
                    radius="xl"
                    withBorder
                    className="landing-panel surface-card"
                  >
                    <Text
                      size="sm"
                      fw={700}
                      className="landing-ink-soft"
                      mb={4}
                    >
                      Tiempo de respuesta
                    </Text>
                    <Text
                      fw={900}
                      className="landing-ink-strong"
                      style={{
                        fontSize: "clamp(2rem, 5vw, 3rem)",
                        lineHeight: 1,
                      }}
                    >
                      5 min
                    </Text>
                    <Text size="sm" className="landing-ink-soft" mt="xs">
                      para publicar la primera versión
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
