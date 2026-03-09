import { Box, Container, Grid, Paper, Stack, Text, Title } from "@mantine/core";

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

export function LaunchStepsSection() {
  return (
    <Box py={{ base: 54, md: 96 }} bg="warm.1">
      <Container size="xl">
        <Stack gap={18} mb={{ base: 34, md: 54 }} ta="center" align="center">
          <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
            Cómo funciona
          </Text>
          <Title
            order={2}
            className="landing-section-title landing-ink-strong"
            maw={760}
          >
            De la idea al QR publicado en tres movimientos claros.
          </Title>
        </Stack>

        <Grid gutter="md">
          {launchSteps.map((item) => (
            <Grid.Col span={{ base: 12, md: 4 }} key={item.step}>
              <Paper
                p={{ base: "xl", md: 30 }}
                radius="xl"
                withBorder
                h="100%"
                className="landing-panel surface-card"
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
                  <Text className="landing-ink landing-copy" lh={1.7}>
                    {item.description}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
