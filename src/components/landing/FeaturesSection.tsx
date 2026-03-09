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
import { QrCode, Smartphone, Store } from "lucide-react";

const featureCards = [
  {
    title: "Actualiza tu catálogo sin fricción",
    description:
      "Cambia precios, fotos o disponibilidad en segundos. Tus clientes ven la versión correcta sin reenviar PDFs ni explicar qué sigue vigente.",
    badge: "Edición en vivo",
  },
  {
    title: "QR listos para mesas, vitrinas y mostradores",
    description:
      "Genera un punto de entrada claro para cada cliente. Escanean, revisan el menú y encuentran tu catálogo desde el celular, sin instalar nada.",
    badge: "Difusión inmediata",
  },
  {
    title: "Un solo link para WhatsApp, bio y Maps",
    description:
      "Centraliza pedido, ubicación y menú en una sola dirección móvil. Compartir tu negocio deja de depender de mandar capturas o archivos manualmente.",
    badge: "Diseñado para móvil",
  },
] as const;

const sectionSpacing = { base: 64, md: 104 } as const;
const cardBorderStyle = { borderColor: "var(--landing-border)" } as const;

export function FeaturesSection() {
  return (
    <Container size="xl" py={sectionSpacing}>
      <Grid gutter={{ base: 28, md: 46 }} align="stretch">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" pr={{ md: 16 }}>
            <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
              Lo importante
            </Text>
            <Title
              order={2}
              className="landing-section-title landing-ink-strong"
              maw={420}
            >
              Una landing útil para vender, no solo para verse bien.
            </Title>
            <Text
              size="lg"
              className="landing-ink landing-copy"
              lh={1.7}
              maw={420}
            >
              La experiencia queda centrada en rapidez, claridad y actualización
              continua. Cada bloque empuja al mismo resultado: que tu cliente
              llegue al producto correcto sin fricción.
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 7 }}>
              <Paper
                p={{ base: "xl", md: 34 }}
                radius="xl"
                withBorder
                h="100%"
                className="landing-panel surface-card"
              >
                <Stack h="100%" justify="space-between">
                  <Stack gap="lg">
                    <ThemeIcon
                      size={58}
                      radius="xl"
                      variant="light"
                      color="brand"
                    >
                      <Store size={28} aria-hidden="true" />
                    </ThemeIcon>
                    <Badge
                      variant="light"
                      radius="xl"
                      color="brand"
                      w="fit-content"
                    >
                      {featureCards[0].badge}
                    </Badge>
                    <Title
                      order={3}
                      className="landing-card-title landing-ink-strong"
                    >
                      {featureCards[0].title}
                    </Title>
                    <Text
                      size="lg"
                      className="landing-ink landing-copy"
                      lh={1.7}
                      maw={520}
                    >
                      {featureCards[0].description}
                    </Text>
                  </Stack>

                  <Group gap="xs" mt="xl">
                    <Badge variant="dot" color="green" size="lg">
                      Disponible
                    </Badge>
                    <Badge variant="dot" color="red" size="lg">
                      Agotado
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 5 }}>
              <Paper
                p={{ base: "xl", md: 30 }}
                radius="xl"
                h="100%"
                className="landing-panel-strong surface-card"
              >
                <Stack h="100%" justify="space-between">
                  <Stack gap="lg">
                    <ThemeIcon
                      size={58}
                      radius="xl"
                      variant="filled"
                      color="brand.0"
                    >
                      <QrCode size={28} aria-hidden="true" />
                    </ThemeIcon>
                    <Badge
                      variant="light"
                      radius="xl"
                      color="brand"
                      w="fit-content"
                    >
                      {featureCards[1].badge}
                    </Badge>
                    <Title order={3} c="brand.0" className="landing-card-title">
                      {featureCards[1].title}
                    </Title>
                  </Stack>

                  <Text lh={1.7} className="landing-inverse-soft landing-copy">
                    {featureCards[1].description}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={12}>
              <Paper
                p={{ base: "xl", md: 34 }}
                radius="xl"
                withBorder
                className="landing-panel surface-card"
              >
                <Grid align="center" gutter="xl">
                  <Grid.Col span={{ base: 12, md: 7 }}>
                    <Stack gap="md">
                      <Badge
                        variant="light"
                        radius="xl"
                        color="brand"
                        w="fit-content"
                      >
                        {featureCards[2].badge}
                      </Badge>
                      <Title
                        order={3}
                        className="landing-card-title landing-ink-strong"
                      >
                        {featureCards[2].title}
                      </Title>
                      <Text
                        size="lg"
                        className="landing-ink landing-copy"
                        lh={1.7}
                        maw={560}
                      >
                        {featureCards[2].description}
                      </Text>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper
                      p="md"
                      radius="lg"
                      withBorder
                      className="landing-panel-muted"
                      style={cardBorderStyle}
                    >
                      <Group wrap="nowrap" gap="sm">
                        <ThemeIcon
                          size="lg"
                          radius="xl"
                          color="brand"
                          variant="light"
                        >
                          <Smartphone size={20} aria-hidden="true" />
                        </ThemeIcon>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            size="xs"
                            fw={700}
                            className="section-eyebrow landing-ink-soft"
                          >
                            Link compartible
                          </Text>
                          <Text
                            fw={700}
                            className="landing-ink-strong"
                            truncate
                          >
                            catalog.app/menu/tunegocio
                          </Text>
                        </Box>
                        <Button
                          component={Link}
                          to="/register"
                          size="xs"
                          radius="xl"
                          color="brand"
                          variant="light"
                          className="landing-focus"
                        >
                          Ver demo
                        </Button>
                      </Group>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
