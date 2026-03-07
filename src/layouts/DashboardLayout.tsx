import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  NavLink,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import type React from "react";

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const [plansModalOpened, { open: openPlans, close: closePlans }] =
    useDisclosure();
  // We use useLocation directly from tanstack router
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
    { icon: BookOpen, label: "Catálogos", path: "/dashboard/catalogs" },
    { icon: ShoppingBag, label: "Productos", path: "/dashboard/products" },
    {
      icon: Receipt,
      label: "Pedidos",
      path: "/dashboard/orders",
      comingSoon: true,
    },
    {
      icon: Users,
      label: "Clientes",
      path: "/dashboard/customers",
      comingSoon: true,
    },
    { icon: Settings, label: "Configuración", path: "/dashboard/settings" },
  ];

  return (
    <AppShell
      layout="alt"
      header={{ height: 75 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      bg="warm.1" // Referencia a nuestra paleta warm del theme global
    >
      <AppShell.Header
        bg="white"
        withBorder
        styles={{ header: { borderColor: "var(--mantine-color-warm-3)" } }}
      >
        <Group h="100%" px="xl" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

          <Group justify="flex-end" style={{ flex: 1 }}>
            <Menu shadow="md" width={220} position="bottom-end" radius="md">
              <Menu.Target>
                <UnstyledButton
                  p="xs"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "background-color 0.2s ease",
                  }}
                  className="hover:bg-warm-2"
                >
                  <Group gap="sm">
                    <Avatar radius="xl" color="brand.6">
                      MA
                    </Avatar>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <Text size="sm" fw={600} c="dark.8">
                        María A.
                      </Text>
                      <Text size="xs" c="dimmed">
                        Restaurante "El Sazón"
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Panel de control</Menu.Label>
                <Menu.Item
                  leftSection={
                    <Settings style={{ width: rem(16), height: rem(16) }} />
                  }
                >
                  Configuración
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={
                    <LogOut style={{ width: rem(16), height: rem(16) }} />
                  }
                >
                  Cerrar sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        bg="white"
        p="md"
        withBorder
        styles={{ navbar: { borderColor: "var(--mantine-color-warm-3)" } }}
      >
        <AppShell.Section mb={40} mt="xs">
          <Group px="md">
            {/* Un Branding sútil, que inspira la estética cálida/humana */}
            <Text
              c="brand.6"
              fw={800}
              fz={26}
              style={{ letterSpacing: "-0.03em" }}
            >
              Catalog.
            </Text>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow>
          {navItems.map((item) => {
            const isActive =
              location.pathname.startsWith(item.path) &&
              (item.path !== "/dashboard" ||
                location.pathname === "/dashboard");

            return item.comingSoon ? (
              <NavLink
                key={item.path}
                component="button"
                label={
                  <Group justify="space-between" wrap="nowrap">
                    <Text span>{item.label}</Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color="gray.6"
                      radius="sm"
                      fw={700}
                    >
                      Próximamente
                    </Badge>
                  </Group>
                }
                leftSection={<item.icon size={20} strokeWidth={1.5} />}
                mb={4}
                styles={(theme) => ({
                  root: {
                    borderRadius: theme.radius.md,
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "var(--mantine-color-gray-6)",
                    backgroundColor: "transparent",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                    cursor: "default",
                  },
                })}
              />
            ) : (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                label={
                  <Group justify="space-between" wrap="nowrap">
                    <Text span>{item.label}</Text>
                  </Group>
                }
                leftSection={
                  <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                }
                active={isActive}
                mb={4}
                styles={(theme) => ({
                  root: {
                    borderRadius: theme.radius.md,
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: isActive
                      ? "var(--mantine-color-brand-7)"
                      : "var(--mantine-color-dark-6)",
                    backgroundColor: isActive
                      ? "var(--mantine-color-brand-0)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "var(--mantine-color-brand-0)"
                        : "var(--mantine-color-warm-2)",
                    },
                    cursor: "pointer",
                  },
                })}
              />
            );
          })}
        </AppShell.Section>

        <AppShell.Section>
          <div
            style={{
              padding: "20px",
              backgroundColor: "var(--mantine-color-brand-0)",
              borderRadius: "var(--mantine-radius-md)",
              textAlign: "center",
            }}
          >
            <Text fz="sm" fw={700} c="brand.7" mb={4}>
              Plan Emprendedor
            </Text>
            <Text fz="xs" c="brand.6" mb={12}>
              15 / 50 Productos usados
            </Text>
            <UnstyledButton onClick={openPlans}>
              <Text
                fz="xs"
                c="brand.7"
                fw={600}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Mejorar plan
              </Text>
            </UnstyledButton>
          </div>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Modal
          opened={plansModalOpened}
          onClose={closePlans}
          size="lg"
          radius="xl"
          padding="xl"
          centered
          title={
            <Text fw={800} fz="xl" style={{ letterSpacing: "-0.02em" }}>
              Desbloquea todo el potencial
            </Text>
          }
          overlayProps={{
            backgroundOpacity: 0.5,
            blur: 4,
          }}
        >
          <Text c="dimmed" mb="xl">
            Elige el plan que mejor se adapte al crecimiento de tu negocio.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {/* Plan Emprendedor */}
            <Card
              withBorder
              radius="xl"
              p="xl"
              style={{
                borderColor: "var(--mantine-color-gray-3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box mb="xl">
                <Text fw={700} fz="lg" mb={4}>
                  Emprendedor
                </Text>
                <Group align="flex-end" gap="xs">
                  <Text fw={900} fz={32} style={{ letterSpacing: "-0.04em" }}>
                    Gratis
                  </Text>
                </Group>
                <Text c="dimmed" fz="sm" mt="sm">
                  Ideal para empezar y probar la plataforma.
                </Text>
              </Box>

              <Stack gap="sm" style={{ flex: 1 }}>
                {[
                  "Hasta 50 productos",
                  "1 Catálogo",
                  "Atención por WhatsApp",
                ].map((feature) => (
                  <Group
                    key={feature}
                    gap="sm"
                    wrap="nowrap"
                    align="flex-start"
                  >
                    <ThemeIcon
                      size="sm"
                      radius="xl"
                      color="gray.4"
                      variant="light"
                      mt={2}
                    >
                      <Check size={12} strokeWidth={3} />
                    </ThemeIcon>
                    <Text fz="sm" c="dark.7">
                      {feature}
                    </Text>
                  </Group>
                ))}
              </Stack>

              <Button
                mt="xl"
                variant="light"
                color="gray"
                radius="xl"
                fullWidth
                disabled
              >
                Plan actual
              </Button>
            </Card>

            {/* Plan Pro */}
            <Card
              withBorder
              radius="xl"
              p="xl"
              style={{
                borderColor: "var(--mantine-color-brand-3)",
                backgroundColor: "var(--mantine-color-brand-0)",
                boxShadow: "0 8px 30px rgba(var(--mantine-color-brand-2), 0.5)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <Badge
                color="brand.6"
                variant="filled"
                radius="sm"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontWeight: 800,
                }}
              >
                RECOMENDADO
              </Badge>

              <Box mb="xl">
                <Text fw={800} fz="lg" c="brand.8" mb={4}>
                  Profesional
                </Text>
                <Group align="flex-end" gap="xs">
                  <Text fw={900} fz={32} style={{ letterSpacing: "-0.04em" }}>
                    $39.900
                  </Text>
                  <Text c="dimmed" fz="sm" mb={6}>
                    / mes
                  </Text>
                </Group>
                <Text c="brand.7" fz="sm" mt="sm">
                  Todo lo que necesitas para vender como un profesional.
                </Text>
              </Box>

              <Stack gap="sm" style={{ flex: 1 }}>
                {[
                  "Productos ilimitados",
                  "Catálogos ilimitados",
                  "Recibe pedidos web",
                  "Dominio personalizado",
                  "Sin comisiones por venta",
                ].map((feature) => (
                  <Group
                    key={feature}
                    gap="sm"
                    wrap="nowrap"
                    align="flex-start"
                  >
                    <ThemeIcon size="sm" radius="xl" color="brand.6" mt={2}>
                      <Check size={12} strokeWidth={3} />
                    </ThemeIcon>
                    <Text fz="sm" c="dark.8" fw={500}>
                      {feature}
                    </Text>
                  </Group>
                ))}
              </Stack>

              <Button
                mt="xl"
                variant="filled"
                color="brand.6"
                radius="xl"
                fullWidth
                style={{
                  fontWeight: 800,
                  boxShadow:
                    "0 4px 14px rgba(var(--mantine-color-brand-6), 0.4)",
                }}
              >
                Actualizar a Pro
              </Button>
            </Card>
          </SimpleGrid>
        </Modal>

        {children || <Outlet />}
      </AppShell.Main>
    </AppShell>
  );
}
