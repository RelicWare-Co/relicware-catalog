import { Badge, Button, Card, Divider, Group, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { Building2, Pencil, Shield, Trash2, Users } from "lucide-react";
import { formatDate } from "./utils";

type ActiveOrganizationProps = {
  activeOrganization?: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date | string;
    members: any[];
    invitations: any[];
  } | null;
  activeRole?: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onEditOpen: () => void;
  onDelete: () => void;
};

export function ActiveOrganizationDetails({
  activeOrganization,
  activeRole,
  canUpdate,
  canDelete,
  isDeleting,
  onEditOpen,
  onDelete,
}: ActiveOrganizationProps) {
  return (
    <Card withBorder radius="xl" p="xl" shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} c="dark.8">
              Organización activa
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Ajusta el nombre, el slug y revisa el estado básico del equipo
              activo en tu sesión.
            </Text>
          </div>
          {activeOrganization ? (
            <Badge color="brand" variant="light">
              {activeRole || "member"}
            </Badge>
          ) : null}
        </Group>

        {!activeOrganization ? (
          <Card withBorder radius="lg" p="lg" bg="warm.0">
            <Stack gap="sm">
              <ThemeIcon color="gray" variant="light" size="lg" radius="xl">
                <Shield size={18} />
              </ThemeIcon>
              <Text fw={700}>No hay organización activa</Text>
              <Text size="sm" c="dimmed">
                Activa una de la lista para ver sus detalles y administrar
                este espacio.
              </Text>
            </Stack>
          </Card>
        ) : (
          <>
            <Card withBorder radius="lg" p="lg" bg="warm.0">
              <Stack gap="md">
                <div>
                  <Text fw={700} c="dark.8">
                    {activeOrganization.name}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    {activeOrganization.slug}
                  </Text>
                </div>

                <Divider />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Card withBorder radius="md" p="md">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon color="brand" variant="light" radius="xl">
                        <Users size={16} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">
                          Miembros
                        </Text>
                        <Text fw={700} c="dark.8">
                          {activeOrganization.members.length}
                        </Text>
                      </div>
                    </Group>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon color="blue" variant="light" radius="xl">
                        <Building2 size={16} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">
                          Invitaciones
                        </Text>
                        <Text fw={700} c="dark.8">
                          {activeOrganization.invitations.length}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </SimpleGrid>

                <Text size="sm" c="dimmed">
                  Creada el {formatDate(activeOrganization.createdAt)}
                </Text>
              </Stack>
            </Card>

            <Group>
              <Button
                variant="light"
                leftSection={<Pencil size={16} />}
                onClick={onEditOpen}
                disabled={!canUpdate}
              >
                Editar organización activa
              </Button>
              <Button
                color="red"
                variant="outline"
                leftSection={<Trash2 size={16} />}
                onClick={onDelete}
                disabled={!canDelete}
                loading={isDeleting}
              >
                Eliminar organización activa
              </Button>
            </Group>

            {!canUpdate || !canDelete ? (
              <Text size="sm" c="dimmed">
                Algunas acciones dependen de los permisos de tu rol dentro de
                esta organización.
              </Text>
            ) : null}
          </>
        )}
      </Stack>
    </Card>
  );
}
