import {
  ActionIcon,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Globe,
  MapPin,
  ShoppingBag,
  Users,
} from "lucide-react";

import { orpc } from "#/orpc/client";

const dashboardQueryOptions = () => orpc.organization.getDashboard.queryOptions();

export const Route = createFileRoute("/dashboard/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions()),
  component: DashboardOverview,
});

function DashboardOverview() {
  const { data } = useSuspenseQuery(dashboardQueryOptions());

  const organizationName = data.organization.name || "Tu organizacion";
  const roleLabel = data.roles.join(", ").replaceAll("_", " ");
  const stats = [
    {
      title: "Catalogos activos",
      value: String(data.metrics.catalogs),
      helper: `${data.metrics.sites} sitios conectados`,
      icon: BookOpen,
    },
    {
      title: "Sedes registradas",
      value: String(data.metrics.locations),
      helper: `${data.metrics.brandThemes} temas configurados`,
      icon: MapPin,
    },
    {
      title: "Leads nuevos",
      value: String(data.metrics.leadRequests),
      helper: `${data.metrics.reservationRequests} reservaciones`,
      icon: Users,
    },
  ];
  const tasks = [
    {
      label: "Crear tu primer catalogo",
      done: data.metrics.catalogs > 0,
      to: "/dashboard/catalogs",
    },
    {
      label: "Cargar productos publicados",
      done: data.metrics.catalogs > 0,
      to: "/dashboard/products",
    },
    {
      label: "Conectar un sitio publico",
      done: data.metrics.sites > 0,
      to: "/dashboard/catalogs",
    },
  ] as const;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
            {organizationName}
          </Title>
          <Text c="dimmed" mt="xs">
            Estado real del negocio, estructura publica y senales de operacion.
          </Text>
          <Text c="brand.7" mt={6} fw={600} size="sm">
            Rol activo: {roleLabel || data.membership.role}
          </Text>
        </div>

        <Button
          component={Link}
          to="/dashboard/products"
          size="md"
          color="brand.6"
          radius="md"
        >
          Ir a Productos
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            padding="xl"
            radius="md"
            withBorder
            shadow="sm"
            bg="white"
          >
            <Group justify="space-between">
              <Text size="sm" c="dimmed" fw={600}>
                {stat.title}
              </Text>
                <ThemeIcon variant="light" color="brand.6" size="lg" radius="md">
                  <stat.icon size="1.2rem" />
                </ThemeIcon>
            </Group>

            <Text fw={800} fz={32} c="dark.8" mt={20} style={{ lineHeight: 1 }}>
              {stat.value}
            </Text>
            <Text c="dimmed" fz="sm" mt="xs">
              {stat.helper}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card
          padding="xl"
          radius="md"
          withBorder
          shadow="sm"
          bg="white"
        >
          <Title order={3} fz={20} mb="xs" c="dark.8">
            Proximos pasos
          </Title>
          <Text c="dimmed" mb="xl">
            Acciones minimas para dejar la operacion lista y visible.
          </Text>

          <Stack gap="sm">
            {tasks.map((task) => (
              <Group
                key={task.label}
                p="md"
                justify="space-between"
                style={{
                  backgroundColor: "var(--mantine-color-warm-1)",
                  borderRadius: "var(--mantine-radius-md)",
                }}
              >
                <Group gap="md">
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: task.done
                        ? "none"
                        : "2px solid var(--mantine-color-warm-4)",
                      backgroundColor: task.done
                        ? "var(--mantine-color-teal-5)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {task.done ? (
                      <Text c="white" fz="xs" fw={800}>
                        ✓
                      </Text>
                    ) : null}
                  </div>

                  <Text
                    fw={600}
                    c={task.done ? "dimmed" : "dark.8"}
                    style={{
                      textDecoration: task.done ? "line-through" : "none",
                    }}
                  >
                    {task.label}
                  </Text>
                </Group>

                {!task.done ? (
                  <ActionIcon
                    component={Link}
                    to={task.to}
                    variant="transparent"
                    color="brand.6"
                    aria-label={`Ir a ${task.label}`}
                  >
                    <ArrowRight size={20} />
                  </ActionIcon>
                ) : null}
              </Group>
            ))}
          </Stack>
        </Card>

        <Card
          padding="xl"
          radius="md"
          withBorder
          shadow="sm"
          bg="white"
        >
          <Title order={3} fz={20} mb="xs" c="dark.8">
            Cobertura actual
          </Title>
          <Text c="dimmed" mb="xl">
            Resumen estructural de presencia publica y catalogo comercial.
          </Text>

          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="sm">
                <Globe size={18} />
                <Text fw={600}>Sitios disponibles</Text>
              </Group>
              <Text fw={800}>{data.metrics.sites}</Text>
            </Group>

            <Group justify="space-between">
              <Group gap="sm">
                <BookOpen size={18} />
                <Text fw={600}>Catalogos cargados</Text>
              </Group>
              <Text fw={800}>{data.metrics.catalogs}</Text>
            </Group>

            <Group justify="space-between">
              <Group gap="sm">
                <ShoppingBag size={18} />
                <Text fw={600}>Temas de marca</Text>
              </Group>
              <Text fw={800}>{data.metrics.brandThemes}</Text>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
