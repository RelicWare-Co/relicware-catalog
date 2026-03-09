import {
  Avatar,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Check, Coffee, Store } from "lucide-react";

const cardBorderStyle = { borderColor: "var(--landing-border)" } as const;

export function HeroAnimation() {
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
        shadow="md"
        radius="xl"
        p="md"
        withBorder
        w={174}
        pos="absolute"
        bottom={0}
        left={0}
        bg="white"
        style={cardBorderStyle}
      >
        <Box
          h={96}
          mb="sm"
          pos="relative"
          style={{
            borderRadius: "var(--mantine-radius-lg)",
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
        shadow="md"
        radius="xl"
        p="md"
        withBorder
        w={228}
        pos="absolute"
        top={18}
        right={0}
        bg="white"
        style={cardBorderStyle}
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
              borderColor: "var(--landing-border-strong)",
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
              borderRadius: "var(--mantine-radius-md)",
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
              borderRadius: "var(--mantine-radius-md)",
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
