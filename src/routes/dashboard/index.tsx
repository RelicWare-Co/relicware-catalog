import { ActionIcon, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
});

const stats = [
  { title: 'Vistas del Catálogo', value: '1,204', diff: '+14%', icon: TrendingUp },
  { title: 'Productos', value: '15', diff: '', icon: ShoppingBag },
  { title: 'Contactos nuevos', value: '38', diff: '+8%', icon: Users },
];

function DashboardOverview() {
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: '-0.02em' }}>
            Hola, María 👋
          </Title>
          <Text c="dimmed" mt="xs">
            Aquí tienes un resumen de cómo va tu negocio hoy.
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
            withBorder={false}
            style={{ 
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}
          >
            <Group justify="space-between">
              <Text size="sm" c="dimmed" fw={600}>{stat.title}</Text>
              <ActionIcon variant="light" color="brand.6" size="lg" radius="md">
                <stat.icon size="1.2rem" />
              </ActionIcon>
            </Group>
            
            <Group align="flex-end" gap="xs" mt={20}>
              <Text fw={800} fz={32} c="dark.8" style={{ lineHeight: 1 }}>{stat.value}</Text>
              {stat.diff && (
                <Text c="teal.6" fz="sm" fw={600} mb={4}>
                  {stat.diff}
                </Text>
              )}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Un pequeño espacio para "Tareas recomendadas" -> Toque humano e intuitivo */}
      <Card 
        mt="lg" 
        padding="xl" 
        radius="md" 
        withBorder={false}
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}
      >
        <Title order={3} fz={20} mb="xs" c="dark.8" style={{ letterSpacing: '-0.01em' }}>
          Tus próximos pasos
        </Title>
        <Text c="dimmed" mb="xl">
          Te sugerimos estas acciones para mejorar tu catálogo y atraer más ventas.
        </Text>
        
        <Stack gap="sm">
          {[
            { label: 'Sube 3 productos que estén en promoción', done: false },
            { label: 'Comparte el enlace de tu catálogo por WhatsApp', done: false },
            { label: 'Agrega métodos de pago a tu perfil', done: true },
          ].map((task) => (
            <Group 
              key={task.label}
              p="md" 
              style={{
                backgroundColor: 'var(--mantine-color-warm-1)',
                borderRadius: 'var(--mantine-radius-md)'
              }}
              justify="space-between"
            >
              <Group gap="md">
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: task.done ? 'none' : '2px solid var(--mantine-color-warm-4)',
                  backgroundColor: task.done ? 'var(--mantine-color-teal-5)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {task.done && <Text c="white" fz="xs" fw={800}>✓</Text>}
                </div>
                <Text fw={600} c={task.done ? 'dimmed' : 'dark.8'} style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.label}
                </Text>
              </Group>
              {!task.done && (
                <ActionIcon variant="transparent" color="brand.6">
                  <ArrowRight size={20} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
