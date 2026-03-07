import {
  Accordion,
  Avatar,
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
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Coffee,
  QrCode,
  Smartphone,
  Store,
} from "lucide-react";

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

const launchSteps = [
  {
    step: "01",
    title: "Crea tu espacio",
    description:
      "Regístrate, agrega tu logo y define el tono visual de tu negocio sin configuraciones técnicas.",
  },
  {
    step: "02",
    title: "Sube tu menú",
    description:
      "Organiza categorías, productos, fotos y precios desde tu celular o tu computadora.",
  },
  {
    step: "03",
    title: "Comparte y vende",
    description:
      "Publica el enlace en Instagram, WhatsApp o imprime el QR para tus mesas y mostradores.",
  },
] as const;

const faqs = [
  {
    value: "cost",
    question: "¿Tiene algún costo?",
    answer:
      "Empezar es gratis. Puedes crear tu menú, compartir tu link y generar códigos QR sin costo. Más adelante habrá planes opcionales para marca y personalización avanzada.",
  },
  {
    value: "tech",
    question: "¿Necesito saber programar?",
    answer:
      "No. Está pensado para dueños de negocio, no para equipos técnicos. Si sabes subir una foto a una red social, puedes usar la app.",
  },
  {
    value: "domain",
    question: "¿Puedo usar mi propio dominio?",
    answer:
      "Hoy te damos un enlace corto y profesional para publicar rápido. Más adelante podrás conectar tu propio dominio.",
  },
  {
    value: "payments",
    question: "¿Los clientes pueden pagar por ahí?",
    answer:
      "Por ahora funciona como un catálogo digital interactivo para impulsar pedidos y visitas. La recepción directa por WhatsApp está en la hoja de ruta.",
  },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Relic | Menús digitales y catálogos con QR",
      },
      {
        name: "description",
        content:
          "Crea un menú o catálogo digital con tu propio link y códigos QR para compartir en minutos desde tu negocio.",
      },
    ],
  }),
  component: Index,
});

function LandingStyles() {
  return (
    <style>{`
      @keyframes clickBtn {
        0%, 15% { transform: scale(1); filter: brightness(1); }
        18% { transform: scale(0.96); filter: brightness(0.94); }
        22%, 100% { transform: scale(1); filter: brightness(1); }
      }

      @keyframes flyPayload {
        0%, 20% { transform: translate(0, 0) scale(0.55); opacity: 0; }
        22% { transform: translate(0, 0) scale(1); opacity: 1; }
        45% { transform: translate(168px, -148px) scale(1); opacity: 1; }
        50%, 100% { transform: translate(168px, -148px) scale(0); opacity: 0; }
      }

      @keyframes popAlert {
        0%, 45% { transform: translateY(14px) scale(0.94); opacity: 0; }
        50% { transform: translateY(-4px) scale(1.02); opacity: 1; }
        55%, 85% { transform: translateY(0) scale(1); opacity: 1; }
        90%, 100% { transform: translateY(-12px) scale(0.96); opacity: 0; }
      }

      @keyframes pathDash {
        to { stroke-dashoffset: -12; }
      }

      @keyframes heroFloat {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, -8px, 0); }
      }

      .landing-root {
        overflow: clip;
        --landing-ink-strong: var(--mantine-color-brand-9);
        --landing-ink: color-mix(
          in srgb,
          var(--mantine-color-brand-9) 74%,
          var(--mantine-color-warm-7)
        );
        --landing-ink-soft: color-mix(
          in srgb,
          var(--mantine-color-brand-9) 62%,
          var(--mantine-color-warm-7)
        );
        --landing-inverse: var(--mantine-color-brand-0);
        --landing-inverse-soft: color-mix(
          in srgb,
          var(--mantine-color-brand-0) 82%,
          var(--mantine-color-warm-2)
        );
        background:
          radial-gradient(circle at top left, rgba(250, 227, 213, 0.75), transparent 32%),
          linear-gradient(180deg, var(--mantine-color-warm-0) 0%, #fffdfa 28%, var(--mantine-color-warm-1) 66%, #fffdfa 100%);
      }

      .landing-ink-strong {
        color: var(--landing-ink-strong);
      }

      .landing-ink {
        color: var(--landing-ink);
      }

      .landing-ink-soft {
        color: var(--landing-ink-soft);
      }

      .landing-inverse {
        color: var(--landing-inverse);
      }

      .landing-inverse-soft {
        color: var(--landing-inverse-soft);
      }

      .hero-shell {
        position: relative;
      }

      .hero-shell::before,
      .hero-shell::after {
        content: "";
        position: absolute;
        border-radius: 999px;
        pointer-events: none;
        z-index: 0;
      }

      .hero-shell::before {
        width: min(48vw, 540px);
        height: min(48vw, 540px);
        right: -12%;
        top: -6%;
        background: radial-gradient(circle, rgba(232, 117, 48, 0.18) 0%, rgba(232, 117, 48, 0.04) 55%, transparent 72%);
        filter: blur(12px);
      }

      .hero-shell::after {
        width: min(32vw, 360px);
        height: min(32vw, 360px);
        left: -10%;
        top: 8%;
        border: 1px solid rgba(232, 117, 48, 0.12);
      }

      .section-eyebrow {
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .surface-card {
        transition:
          transform 220ms cubic-bezier(0.19, 1, 0.22, 1),
          box-shadow 220ms cubic-bezier(0.19, 1, 0.22, 1),
          border-color 220ms ease;
      }

      .surface-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 50px rgba(160, 65, 24, 0.08);
        border-color: rgba(232, 117, 48, 0.2);
      }

      .proof-chip {
        min-height: 48px;
      }

      .hero-animation-frame {
        animation: heroFloat 6s cubic-bezier(0.19, 1, 0.22, 1) infinite;
      }

      .metric-card {
        background: linear-gradient(180deg, rgba(255, 245, 239, 0.16), rgba(255, 245, 239, 0.08));
        border: 1px solid rgba(255, 244, 238, 0.18);
        backdrop-filter: blur(8px);
      }

      .faq-shell .mantine-Accordion-item {
        border: 1px solid rgba(232, 117, 48, 0.1);
        background: rgba(255, 252, 248, 0.88);
      }

      .faq-shell .mantine-Accordion-control {
        min-height: 60px;
      }

      @media (max-width: 62em) {
        .hero-shell::before {
          right: -20%;
          top: 6%;
        }
      }

      @media (max-width: 48em) {
        .hero-shell::after {
          display: none;
        }

        .hero-animation-frame {
          transform: scale(0.92);
          transform-origin: top center;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .surface-card,
        .hero-animation-frame,
        .proof-chip,
        .faq-shell .mantine-Accordion-chevron {
          transition: none !important;
          animation: none !important;
        }

        .surface-card:hover {
          transform: none;
        }

        svg path[style],
        [style*="animation"] {
          animation: none !important;
        }
      }
    `}</style>
  );
}

function HeroAnimation() {
  return (
    <Box
      pos="relative"
      w="100%"
      maw={390}
      h={400}
      mx="auto"
      className="hero-animation-frame"
      style={{ zIndex: 1 }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
        aria-hidden="true"
      >
        <path
          d="M 84 284 Q 148 208, 236 122"
          stroke="var(--mantine-color-brand-2)"
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
          style={{ animation: "pathDash 1s linear infinite" }}
        />
      </svg>

      <Box
        pos="absolute"
        bottom={110}
        left={66}
        style={{
          animation: "flyPayload 4s cubic-bezier(0.19, 1, 0.22, 1) infinite",
          zIndex: 3,
        }}
      >
        <ThemeIcon size="md" radius="xl" color="brand">
          <Check size={14} aria-hidden="true" />
        </ThemeIcon>
      </Box>

      <Paper
        shadow="xl"
        radius="32px"
        p="md"
        withBorder
        w={174}
        pos="absolute"
        bottom={0}
        left={0}
        bg="white"
        style={{ zIndex: 2, borderColor: "rgba(232, 117, 48, 0.16)" }}
      >
        <Box
          h={96}
          mb="sm"
          pos="relative"
          style={{
            borderRadius: 18,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, var(--mantine-color-warm-0), var(--mantine-color-warm-2))",
          }}
        >
          <ThemeIcon
            size="xl"
            radius="lg"
            variant="light"
            color="brand"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Coffee size={24} aria-hidden="true" />
          </ThemeIcon>
        </Box>
        <Box bg="warm.2" h={10} w="72%" mb={6} style={{ borderRadius: 999 }} />
        <Box bg="warm.3" h={8} w="52%" mb="xl" style={{ borderRadius: 999 }} />

        <Box
          bg="brand.6"
          h={40}
          display="flex"
          style={{
            borderRadius: 999,
            animation: "clickBtn 4s cubic-bezier(0.19, 1, 0.22, 1) infinite",
          }}
        >
          <Text size="xs" fw={800} c="white" m="auto">
            Ordenar $3.50
          </Text>
        </Box>
      </Paper>

      <Paper
        shadow="xl"
        radius="28px"
        p="md"
        withBorder
        w={228}
        pos="absolute"
        top={18}
        right={0}
        bg="white"
        style={{ zIndex: 2, borderColor: "rgba(232, 117, 48, 0.14)" }}
      >
        <Group mb="md" wrap="nowrap">
          <Avatar size="sm" color="brand" radius="md">
            <Store size={14} aria-hidden="true" />
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text size="xs" fw={800} className="landing-ink-strong">
              Órdenes de hoy
            </Text>
            <Text
              size="xs"
              className="landing-ink-soft"
              style={{ fontSize: 10 }}
            >
              Actualizado ahora
            </Text>
          </Box>
        </Group>

        <Stack gap="xs" pos="relative">
          <Paper
            p="xs"
            radius="md"
            withBorder
            bg="brand.0"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              animation: "popAlert 4s cubic-bezier(0.19, 1, 0.22, 1) infinite",
              zIndex: 10,
              borderColor: "rgba(232, 117, 48, 0.18)",
            }}
          >
            <Group wrap="nowrap">
              <ThemeIcon color="brand" variant="filled" size="sm" radius="xl">
                <Check size={12} aria-hidden="true" />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={800} c="brand.9">
                  Nuevo pedido
                </Text>
                <Text
                  size="xs"
                  c="brand.9"
                  style={{ fontSize: 10, opacity: 0.78 }}
                >
                  Mesa 4 • Café x1
                </Text>
              </Box>
              <Text size="xs" fw={800} c="brand.9">
                $3.5
              </Text>
            </Group>
          </Paper>

          <Box
            p="xs"
            bg="warm.0"
            style={{
              borderRadius: 12,
              opacity: 0.7,
              transform: "translateY(52px)",
            }}
          >
            <Group wrap="nowrap">
              <ThemeIcon color="warm" variant="light" size="sm" radius="md">
                <Coffee size={12} aria-hidden="true" />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={700} className="landing-ink-strong">
                  Para llevar
                </Text>
                <Text
                  size="xs"
                  className="landing-ink-soft"
                  style={{ fontSize: 10 }}
                >
                  Hace 5 min
                </Text>
              </Box>
              <Text size="xs" fw={700} className="landing-ink">
                $7.0
              </Text>
            </Group>
          </Box>

          <Box
            p="xs"
            bg="warm.0"
            style={{
              borderRadius: 12,
              opacity: 0.46,
              transform: "translateY(52px)",
            }}
          >
            <Group wrap="nowrap">
              <ThemeIcon color="warm" variant="light" size="sm" radius="md">
                <Store size={12} aria-hidden="true" />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={700} className="landing-ink-strong">
                  En local
                </Text>
                <Text
                  size="xs"
                  className="landing-ink-soft"
                  style={{ fontSize: 10 }}
                >
                  Hace 18 min
                </Text>
              </Box>
              <Text size="xs" fw={700} className="landing-ink">
                $12.5
              </Text>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function Index() {
  return (
    <main className="landing-root">
      <LandingStyles />

      <Box className="hero-shell">
        <Container
          size="xl"
          pt={{ base: 24, md: 56 }}
          pb={{ base: 64, md: 92 }}
        >
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
                    style={{
                      fontSize: "clamp(2.85rem, 6vw, 5.4rem)",
                      lineHeight: 0.98,
                      letterSpacing: "-0.04em",
                      textWrap: "balance",
                      color: "var(--landing-ink-strong)",
                    }}
                  >
                    Tu menú y catálogo dejan de sentirse improvisados.
                  </Title>

                  <Text
                    size="xl"
                    maw={580}
                    className="landing-ink"
                    lh={1.65}
                    style={{ textWrap: "pretty" }}
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
                    size="xl"
                    color="brand"
                    radius="xl"
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
                    styles={{
                      root: {
                        background: "rgba(255, 252, 248, 0.9)",
                        borderColor: "rgba(232, 117, 48, 0.18)",
                        color: "var(--landing-ink-strong)",
                      },
                    }}
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
                      bg="rgba(255, 252, 248, 0.82)"
                      className="proof-chip surface-card"
                      style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
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
                      bg="rgba(255, 252, 248, 0.82)"
                      className="proof-chip surface-card"
                      style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
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
                      bg="rgba(255, 252, 248, 0.82)"
                      className="proof-chip surface-card"
                      style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
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
                  p={{ base: "lg", md: 26 }}
                  radius="36px"
                  bg="rgba(255, 250, 246, 0.76)"
                  withBorder
                  style={{
                    borderColor: "rgba(232, 117, 48, 0.12)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <HeroAnimation />
                </Paper>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 7 }}>
                    <Paper
                      p="lg"
                      radius="28px"
                      bg="brand.9"
                      className="surface-card"
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
                        style={{
                          fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
                          textWrap: "balance",
                        }}
                      >
                        Menos mensajes repetidos. Más clientes listos para
                        decidir.
                      </Title>
                    </Paper>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <Paper
                      p="lg"
                      radius="28px"
                      withBorder
                      bg="rgba(255, 252, 248, 0.92)"
                      className="surface-card"
                      style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
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

      <Container size="xl" py={{ base: 64, md: 110 }}>
        <Grid gutter={{ base: 28, md: 46 }} align="stretch">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md" pr={{ md: 16 }}>
              <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
                Lo importante
              </Text>
              <Title
                order={2}
                className="landing-ink-strong"
                maw={420}
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.4rem)",
                  lineHeight: 1.02,
                  textWrap: "balance",
                }}
              >
                Una landing útil para vender, no solo para verse bien.
              </Title>
              <Text size="lg" className="landing-ink" lh={1.7} maw={420}>
                La experiencia queda centrada en rapidez, claridad y
                actualización continua. Cada bloque empuja al mismo resultado:
                que tu cliente llegue al producto correcto sin fricción.
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Paper
                  p={{ base: "xl", md: 34 }}
                  radius="32px"
                  withBorder
                  h="100%"
                  className="surface-card"
                  bg="rgba(255, 252, 248, 0.96)"
                  style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
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
                        className="landing-ink-strong"
                        style={{ textWrap: "balance" }}
                      >
                        {featureCards[0].title}
                      </Title>
                      <Text
                        size="lg"
                        className="landing-ink"
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
                  radius="32px"
                  h="100%"
                  className="surface-card"
                  bg="brand.8"
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
                      <Title
                        order={3}
                        c="brand.0"
                        style={{ textWrap: "balance" }}
                      >
                        {featureCards[1].title}
                      </Title>
                    </Stack>

                    <Text lh={1.7} className="landing-inverse-soft">
                      {featureCards[1].description}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={12}>
                <Paper
                  p={{ base: "xl", md: 34 }}
                  radius="32px"
                  withBorder
                  className="surface-card"
                  bg="rgba(255, 252, 248, 0.96)"
                  style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
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
                          className="landing-ink-strong"
                          style={{ textWrap: "balance" }}
                        >
                          {featureCards[2].title}
                        </Title>
                        <Text
                          size="lg"
                          className="landing-ink"
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
                        radius="22px"
                        bg="warm.1"
                        withBorder
                        style={{ borderColor: "rgba(232, 117, 48, 0.1)" }}
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
                              relic.app/menu/tunegocio
                            </Text>
                          </Box>
                          <Button
                            size="xs"
                            radius="xl"
                            color="brand"
                            variant="light"
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

      <Box py={{ base: 54, md: 96 }} bg="warm.1">
        <Container size="xl">
          <Stack gap={18} mb={{ base: 34, md: 54 }} ta="center" align="center">
            <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
              Cómo funciona
            </Text>
            <Title
              order={2}
              className="landing-ink-strong"
              maw={760}
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                lineHeight: 1.02,
                textWrap: "balance",
              }}
            >
              De la idea al QR publicado en tres movimientos claros.
            </Title>
          </Stack>

          <Grid gutter="md">
            {launchSteps.map((item) => (
              <Grid.Col span={{ base: 12, md: 4 }} key={item.step}>
                <Paper
                  p={{ base: "xl", md: 30 }}
                  radius="30px"
                  withBorder
                  h="100%"
                  className="surface-card"
                  bg="rgba(255, 252, 248, 0.95)"
                  style={{ borderColor: "rgba(232, 117, 48, 0.1)" }}
                >
                  <Stack gap="md">
                    <Text
                      fw={900}
                      c="brand.2"
                      style={{ fontSize: "3.9rem", lineHeight: 0.92 }}
                    >
                      {item.step}
                    </Text>
                    <Title order={4} className="landing-ink-strong">
                      {item.title}
                    </Title>
                    <Text
                      className="landing-ink"
                      lh={1.7}
                      style={{ textWrap: "pretty" }}
                    >
                      {item.description}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box py={{ base: 62, md: 108 }} bg="brand.9">
        <Container size="lg">
          <Grid align="center" gutter={{ base: 36, md: 72 }}>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="lg">
                <Text
                  size="sm"
                  fw={800}
                  className="section-eyebrow"
                  style={{ color: "var(--landing-inverse-soft)" }}
                >
                  Impacto real
                </Text>
                <Title
                  order={2}
                  c="brand.0"
                  maw={720}
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3.4rem)",
                    lineHeight: 1.02,
                    textWrap: "balance",
                  }}
                >
                  “Mis clientes ya no me piden el PDF. Entran al link, miran y
                  deciden.”
                </Title>
                <Text
                  size="lg"
                  lh={1.75}
                  maw={620}
                  className="landing-inverse-soft"
                >
                  Antes perdíamos tiempo mandando fotos del menú cada vez que
                  alguien escribía. Ahora un cambio tarda segundos y toda la
                  información queda actualizada para cualquiera que llegue por
                  WhatsApp o Instagram.
                </Text>

                <Group gap="sm" wrap="nowrap">
                  <Avatar radius="xl" color="brand">
                    MF
                  </Avatar>
                  <Box>
                    <Text fw={700} c="brand.0">
                      María Fernández
                    </Text>
                    <Text size="sm" className="landing-inverse-soft">
                      Dueña de pastelería
                    </Text>
                  </Box>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="md">
                <Paper p="xl" radius="28px" className="metric-card">
                  <Text
                    size="sm"
                    fw={700}
                    className="landing-inverse-soft"
                    mb={4}
                  >
                    Visitas al menú
                  </Text>
                  <Text
                    fw={900}
                    c="brand.0"
                    style={{
                      fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
                      lineHeight: 1,
                    }}
                  >
                    +10k
                  </Text>
                </Paper>

                <Paper p="xl" radius="28px" className="metric-card">
                  <Text
                    size="sm"
                    fw={700}
                    className="landing-inverse-soft"
                    mb={4}
                  >
                    Tiempo ahorrado al mes
                  </Text>
                  <Text
                    fw={900}
                    c="brand.0"
                    style={{
                      fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
                      lineHeight: 1,
                    }}
                  >
                    14h
                  </Text>
                  <Text size="sm" mt="sm" className="landing-inverse-soft">
                    menos atención repetitiva y más foco en vender
                  </Text>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size="sm" py={{ base: 64, md: 104 }}>
        <Stack gap={18} mb={42} ta="center" align="center">
          <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
            Preguntas frecuentes
          </Text>
          <Title
            order={2}
            className="landing-ink-strong"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.04,
              textWrap: "balance",
            }}
          >
            Lo necesario para decidir si te sirve hoy.
          </Title>
        </Stack>

        <Accordion variant="separated" radius="xl" className="faq-shell">
          {faqs.map((item) => (
            <Accordion.Item key={item.value} value={item.value}>
              <Accordion.Control
                fw={700}
                fz="lg"
                className="landing-ink-strong"
              >
                {item.question}
              </Accordion.Control>
              <Accordion.Panel className="landing-ink" lh={1.7}>
                {item.answer}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>

      <Container size="md" pb={{ base: 78, md: 116 }}>
        <Paper
          p={{ base: "xl", md: 44 }}
          radius="36px"
          bg="rgba(255, 250, 246, 0.92)"
          withBorder
          ta="center"
          style={{ borderColor: "rgba(232, 117, 48, 0.12)" }}
        >
          <Stack align="center" gap="lg">
            <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
              Cierre simple
            </Text>
            <Title
              order={2}
              className="landing-ink-strong"
              maw={640}
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                lineHeight: 1.02,
                textWrap: "balance",
              }}
            >
              Toma el control de tu presencia digital sin complicarte el día.
            </Title>
            <Text size="lg" className="landing-ink" maw={560} lh={1.7}>
              Regístrate gratis y publica la primera versión de tu menú en menos
              de cinco minutos.
            </Text>
            <Button
              component={Link}
              to="/register"
              size="xl"
              color="brand"
              radius="xl"
              rightSection={<ChevronRight size={20} aria-hidden="true" />}
            >
              Crear mi cuenta
            </Button>
          </Stack>
        </Paper>
      </Container>
    </main>
  );
}
