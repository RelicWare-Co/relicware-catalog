import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function CtaSection() {
  return (
    <Container size="md" pb={{ base: 78, md: 116 }}>
      <Paper
        p={{ base: "xl", md: 44 }}
        radius="xl"
        withBorder
        ta="center"
        className="landing-panel"
      >
        <Stack align="center" gap="lg">
          <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
            Cierre simple
          </Text>
          <Title
            order={2}
            className="landing-section-title landing-ink-strong"
            maw={640}
          >
            Toma el control de tu presencia digital sin complicarte el día.
          </Title>
          <Text
            size="lg"
            className="landing-ink landing-copy"
            maw={560}
            lh={1.7}
          >
            Regístrate gratis y publica la primera versión de tu menú en menos
            de cinco minutos.
          </Text>
          <Button
            component={Link}
            to="/register"
            size="lg"
            color="brand"
            radius="xl"
            className="landing-focus"
            rightSection={<ChevronRight size={20} aria-hidden="true" />}
          >
            Crear mi cuenta
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
