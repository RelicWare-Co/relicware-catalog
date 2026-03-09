import {
  Avatar,
  Box,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

const sectionSpacing = { base: 64, md: 104 } as const;

export function TestimonialSection() {
  return (
    <Box py={sectionSpacing} bg="brand.9">
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
                className="landing-section-title"
              >
                “Mis clientes ya no me piden el PDF. Entran al link, miran y
                deciden.”
              </Title>
              <Text
                size="lg"
                lh={1.75}
                maw={620}
                className="landing-inverse-soft landing-copy"
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
              <Paper p="xl" radius="xl" className="metric-card">
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

              <Paper p="xl" radius="xl" className="metric-card">
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
  );
}
