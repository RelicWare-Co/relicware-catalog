import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Card,
  Group,
  type MantineTheme,
  Menu,
  Modal,
  NavLink,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { authClient } from "#/lib/auth-client";

const navLinkStyles = (
  theme: MantineTheme,
  options?: { active?: boolean; disabled?: boolean },
) => {
  const isActive = options?.active ?? false;
  const isDisabled = options?.disabled ?? false;

  return {
    root: {
      borderRadius: theme.radius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontWeight: 600,
      color: isDisabled
        ? "var(--mantine-color-gray-6)"
        : isActive
          ? "var(--mantine-color-brand-7)"
          : "var(--mantine-color-dark-6)",
      backgroundColor: isActive
        ? "var(--mantine-color-brand-0)"
        : "transparent",
      transition: "background-color 150ms ease, color 150ms ease",
      cursor: isDisabled ? "default" : "pointer",
      "&:hover": {
        backgroundColor: isDisabled
          ? "transparent"
          : isActive
            ? "var(--mantine-color-brand-0)"
            : "var(--mantine-color-warm-2)",
      },
    },
  };
};

const starterPlanFeatures = [
  "Hasta 50 productos",
  "1 Catálogo",
  "Atención por WhatsApp",
];

const proPlanFeatures = [
  "Productos ilimitados",
  "Catálogos ilimitados",
  "Recibe pedidos web",
  "Dominio personalizado",
  "Sin comisiones por venta",
];

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const [plansModalOpened, { open: openPlans, close: closePlans }] =
    useDisclosure();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate({ from: "/dashboard" });
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const { data: organizations, refetch: refetchOrganizations } =
    authClient.useListOrganizations();
  const {
    data: activeOrganization,
    refetch: refetchActiveOrganization,
  } = authClient.useActiveOrganization();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [switchingOrganizationId, setSwitchingOrganizationId] =
    useState<string | null>(null);
  const [organizationError, setOrganizationError] = useState<string | null>(
    null,
  );

  const displayName = session?.user.name || "Tu cuenta";
  const displayEmail = session?.user.email || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CA";

  const handleSignOut = async () => {
    setIsSigningOut(true);

    await authClient.signOut();

    await navigate({
      to: "/login",
      search: {
        redirect: undefined,
      },
      replace: true,
    });
  };

  const handleOrganizationChange = async (organizationId: string) => {
    if (organizationId === activeOrganization?.id) {
      return;
    }

    setOrganizationError(null);
    setSwitchingOrganizationId(organizationId);

    const { error } = await authClient.organization.setActive({
      organizationId,
    });

    if (error) {
      setOrganizationError(error.message || "No se pudo cambiar la organización");
      setSwitchingOrganizationId(null);
      return;
    }

    await Promise.all([
      refetchOrganizations(),
      refetchActiveOrganization(),
      refetchSession(),
    ]);

    setSwitchingOrganizationId(null);
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
    { icon: BookOpen, label: "Catálogos", path: "/dashboard/catalogs" },
    { icon: ShoppingBag, label: "Productos", path: "/dashboard/products" },
    {
      icon: Building2,
      label: "Organizaciones",
      path: "/dashboard/organizations",
    },
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
    {
      icon: Settings,
      label: "Configuración",
      path: "/dashboard/settings",
    },
  ];

  useEffect(() => {
    if (!pathname) {
      return;
    }

    close();
  }, [close, pathname]);

  return (
    <AppShell
      layout="alt"
      header={{ height: 75 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding={0}
      bg="warm.1" // Referencia a nuestra paleta warm del theme global
    >
      <AppShell.Header
        bg="white"
        withBorder
        styles={{
          header: {
            borderColor: "var(--mantine-color-warm-3)",
            zIndex: 220,
          },
        }}
      >
        <Group h="100%" px="xl" justify="space-between">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label={opened ? "Cerrar navegación" : "Abrir navegación"}
          />

          <Group justify="flex-end" style={{ flex: 1 }}>
            <Menu shadow="sm" width={280} position="bottom-end" radius="md">
              <Menu.Target>
                <UnstyledButton
                  p="xs"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    backgroundColor: "var(--mantine-color-white)",
                    border: "1px solid var(--mantine-color-warm-3)",
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon color="brand" variant="light" radius="xl">
                      <Building2 size={16} />
                    </ThemeIcon>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={700} c="dark.8" truncate>
                        {activeOrganization?.name || "Selecciona organización"}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {activeOrganization?.slug || "Administra equipos y espacios"}
                      </Text>
                    </Stack>
                    <ChevronsUpDown size={16} color="var(--mantine-color-gray-6)" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Organización activa</Menu.Label>
                {organizations?.length ? (
                  organizations.map((organization) => {
                    const isActive = organization.id === activeOrganization?.id;
                    const isLoading = switchingOrganizationId === organization.id;

                    return (
                      <Menu.Item
                        key={organization.id}
                        onClick={() => handleOrganizationChange(organization.id)}
                        disabled={isLoading || isActive}
                        leftSection={<Building2 style={{ width: rem(16), height: rem(16) }} />}
                        rightSection={
                          isActive ? (
                            <Badge size="xs" color="brand" variant="light">
                              Activa
                            </Badge>
                          ) : isLoading ? (
                            <Text size="xs" c="dimmed">
                              Cambiando...
                            </Text>
                          ) : null
                        }
                      >
                        <Stack gap={0}>
                          <Text size="sm" fw={600}>
                            {organization.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {organization.slug}
                          </Text>
                        </Stack>
                      </Menu.Item>
                    );
                  })
                ) : (
                  <Menu.Item disabled>No tienes organizaciones todavía</Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  component={Link}
                  to="/dashboard/organizations"
                  leftSection={
                    <Settings style={{ width: rem(16), height: rem(16) }} />
                  }
                >
                  Administrar organizaciones
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="sm" width={220} position="bottom-end" radius="md">
              <Menu.Target>
                <UnstyledButton
                  p="xs"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    backgroundColor: "var(--mantine-color-white)",
                  }}
                >
                  <Group gap="sm">
                    <Avatar radius="xl" color="brand" variant="light">
                      {initials}
                    </Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="dark.8">
                        {displayName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {displayEmail}
                      </Text>
                    </Stack>
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
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  leftSection={
                    <LogOut style={{ width: rem(16), height: rem(16) }} />
                  }
                >
                  {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        {organizationError ? (
          <Text size="xs" c="red.6" px="xl" pb="sm">
            {organizationError}
          </Text>
        ) : null}
      </AppShell.Header>

      <AppShell.Navbar
        bg="white"
        p="md"
        withBorder
        styles={{
          navbar: {
            borderColor: "var(--mantine-color-warm-3)",
            zIndex: 230,
          },
        }}
      >
        <AppShell.Section mb={40} mt="xs">
          <Group px="md">
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
          <Stack gap={4}>
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
                  styles={(theme) => navLinkStyles(theme, { disabled: true })}
                />
              ) : (
                <NavLink
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={close}
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
                  styles={(theme) => navLinkStyles(theme, { active: isActive })}
                />
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Card withBorder radius="lg" p="lg" bg="brand.0">
            <Text fz="sm" fw={700} c="brand.7" mb={4}>
              Plan Emprendedor
            </Text>
            <Text fz="xs" c="brand.6" mb={12}>
              15 / 50 Productos usados
            </Text>
            <Button
              variant="subtle"
              color="brand"
              size="compact-sm"
              px={0}
              justify="center"
              onClick={openPlans}
            >
              Mejorar plan
            </Button>
          </Card>
        </AppShell.Section>
      </AppShell.Navbar>

      {opened ? (
        <Box
          hiddenFrom="sm"
          onClick={close}
          style={{
            position: "fixed",
            inset: "75px 0 0",
            backgroundColor: "rgba(32, 24, 18, 0.14)",
            zIndex: 210,
          }}
        />
      ) : null}

      <AppShell.Main style={{ backgroundColor: "var(--mantine-color-warm-1)" }}>
        <Modal
          opened={plansModalOpened}
          onClose={closePlans}
          size="lg"
          radius="xl"
          padding="xl"
          centered
          zIndex={1000}
          title={
            <Title order={3} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
              Desbloquea todo el potencial
            </Title>
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
              shadow="xs"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box mb="xl">
                <Text fw={700} fz="lg" mb={4}>
                  Emprendedor
                </Text>
                <Group align="flex-end" gap="xs">
                  <Text
                    fw={900}
                    fz={32}
                    c="dark.8"
                    style={{ letterSpacing: "-0.04em" }}
                  >
                    Gratis
                  </Text>
                </Group>
                <Text c="dimmed" fz="sm" mt="sm">
                  Ideal para empezar y probar la plataforma.
                </Text>
              </Box>

              <Stack gap="sm" style={{ flex: 1 }}>
                {starterPlanFeatures.map((feature) => (
                  <Group
                    key={feature}
                    gap="sm"
                    wrap="nowrap"
                    align="flex-start"
                  >
                    <ThemeIcon
                      size="sm"
                      radius="xl"
                      color="gray"
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

              <Button mt="xl" variant="light" color="gray" fullWidth disabled>
                Plan actual
              </Button>
            </Card>

            {/* Plan Pro */}
            <Card
              withBorder
              radius="xl"
              p="xl"
              bg="brand.0"
              shadow="sm"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <Badge
                color="brand"
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
                  <Text
                    fw={900}
                    fz={32}
                    c="dark.8"
                    style={{ letterSpacing: "-0.04em" }}
                  >
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
                {proPlanFeatures.map((feature) => (
                  <Group
                    key={feature}
                    gap="sm"
                    wrap="nowrap"
                    align="flex-start"
                  >
                    <ThemeIcon size="sm" radius="xl" color="brand" mt={2}>
                      <Check size={12} strokeWidth={3} />
                    </ThemeIcon>
                    <Text fz="sm" c="dark.8" fw={500}>
                      {feature}
                    </Text>
                  </Group>
                ))}
              </Stack>

              <Button mt="xl" variant="filled" color="brand" fullWidth fw={800}>
                Actualizar a Pro
              </Button>
            </Card>
          </SimpleGrid>
        </Modal>

        <Box
          data-vt-shell="dashboard-main"
          mih="calc(100dvh - 75px)"
          p={{ base: "md", sm: "xl" }}
          style={{
            backgroundColor: "var(--mantine-color-warm-1)",
            overflow: "clip",
          }}
        >
          {children || <Outlet />}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
