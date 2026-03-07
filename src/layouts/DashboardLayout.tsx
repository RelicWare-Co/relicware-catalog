import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Menu,
  NavLink,
  rem,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
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
            <Text
              fz="xs"
              c="brand.7"
              fw={600}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Mejorar plan
            </Text>
          </div>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children || <Outlet />}</AppShell.Main>
    </AppShell>
  );
}
