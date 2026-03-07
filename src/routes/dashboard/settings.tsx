import {
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: "-0.02em" }}>
            Configuración
          </Title>
          <Text c="dimmed" mt={4}>
            Administra los detalles de tu negocio y preferencias de la
            plataforma.
          </Text>
        </div>
      </Group>

      <Card
        withBorder
        radius="lg"
        p="xl"
        shadow="sm"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Stack gap="md">
          <Title order={4} c="dark.8">
            Información del Negocio
          </Title>
          <Divider />

          <Group grow align="flex-start">
            <TextInput
              label="Nombre del restaurante/negocio"
              placeholder='Ej: Restaurante "El Sazón"'
              defaultValue='Restaurante "El Sazón"'
            />
            <TextInput
              label="Correo electrónico de contacto"
              placeholder="tu@negocio.com"
              defaultValue="contacto@elsazon.com"
            />
          </Group>

          <TextInput
            label="Número de WhatsApp para pedidos"
            placeholder="+57 300 000 0000"
            defaultValue="+57 300 000 0000"
          />

          <Button
            variant="filled"
            color="brand"
            mt="md"
            w="fit-content"
            style={{ alignSelf: "flex-start" }}
          >
            Guardar Cambios
          </Button>
        </Stack>
      </Card>

      <Card
        withBorder
        radius="lg"
        p="xl"
        shadow="sm"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Stack gap="md">
          <Title order={4} c="dark.8">
            Preferencias de Notificaciones
          </Title>
          <Divider />

          <Switch
            label="Notificaciones por correo electrónico"
            description="Recibe resúmenes semanales sobre el desempeño de tus catálogos."
            defaultChecked
            color="brand"
          />

          <Switch
            label="Avisos de nuevos pedidos"
            description="Recibe alertas cuando un cliente genere un pedido por WhatsApp."
            defaultChecked
            color="brand"
          />
        </Stack>
      </Card>

      <Card
        withBorder
        radius="lg"
        p="xl"
        shadow="sm"
        style={{
          display: "flex",
          flexDirection: "column",
          borderColor: "var(--mantine-color-red-3)",
        }}
      >
        <Stack gap="md">
          <Title order={4} c="red.7">
            Zona de Peligro
          </Title>
          <Divider color="red.2" />

          <Text size="sm" c="dimmed">
            Estas acciones no se pueden deshacer. Por favor, ten mucho cuidado.
          </Text>

          <Button variant="outline" color="red" w="fit-content">
            Eliminar cuenta
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
