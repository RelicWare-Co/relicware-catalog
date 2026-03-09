import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { Building2, Plus } from "lucide-react";
import { formatDate } from "./utils";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date | string;
};

type OrganizationListProps = {
  organizationList: Organization[];
  activeOrganizationId?: string | null;
  pendingOrganizationId: string | null;
  onCreateOpen: () => void;
  onActivate: (id: string) => void;
};

export function OrganizationList({
  organizationList,
  activeOrganizationId,
  pendingOrganizationId,
  onCreateOpen,
  onActivate,
}: OrganizationListProps) {
  return (
    <Card withBorder radius="xl" p="xl" shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} c="dark.8">
              Tus organizaciones
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Activa una organización para trabajar con sus catálogos,
              productos y sitios.
            </Text>
          </div>
          <Badge color="gray" variant="light">
            {organizationList.length} total
          </Badge>
        </Group>

        <Stack gap="md">
          {organizationList.length === 0 ? (
            <Card withBorder radius="lg" p="lg" bg="warm.0">
              <Stack gap="sm" align="flex-start">
                <ThemeIcon color="brand" variant="light" size="lg" radius="xl">
                  <Building2 size={18} />
                </ThemeIcon>
                <Text fw={700}>Todavía no tienes organizaciones</Text>
                <Text size="sm" c="dimmed">
                  Crea tu primera organización para empezar a configurar tu
                  negocio y compartir catálogos.
                </Text>
                <Button
                  variant="light"
                  leftSection={<Plus size={16} />}
                  onClick={onCreateOpen}
                >
                  Crear primera organización
                </Button>
              </Stack>
            </Card>
          ) : (
            organizationList.map((organization) => {
              const isActive = organization.id === activeOrganizationId;
              const isPending = pendingOrganizationId === organization.id;

              return (
                <Card
                  key={organization.id}
                  withBorder
                  radius="lg"
                  p="lg"
                  bg={isActive ? "brand.0" : "white"}
                >
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Group gap="xs">
                          <Text fw={700} c="dark.8">
                            {organization.name}
                          </Text>
                          {isActive ? (
                            <Badge color="brand" variant="filled">
                              Activa
                            </Badge>
                          ) : null}
                        </Group>
                        <Text size="sm" c="dimmed" mt={4}>
                          {organization.slug}
                        </Text>
                      </div>

                      <Button
                        variant={isActive ? "light" : "filled"}
                        color={isActive ? "gray" : "brand"}
                        disabled={isActive}
                        loading={isPending}
                        onClick={() => onActivate(organization.id)}
                      >
                        {isActive ? "En uso" : "Activar"}
                      </Button>
                    </Group>

                    <Group gap="xs">
                      <Badge variant="light" color="gray">
                        Creada {formatDate(organization.createdAt)}
                      </Badge>
                      {organization.logo ? (
                        <Badge variant="light" color="blue">
                          Con logo
                        </Badge>
                      ) : null}
                    </Group>
                  </Stack>
                </Card>
              );
            })
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
