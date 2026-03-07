import { ActionIcon, Badge, Button, Card, FileButton, Grid, Group, Image, Menu, Modal, NumberInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { Edit, MoreVertical, Plus, Search, Share2, Trash, Upload } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/products')({
  component: ProductsPage,
});

// Mocked data para inspirar el lado humano y realista de los usuarios (comida, panadería, etc.)
const mockedProducts = [
  {
    id: 1,
    name: 'Pan de Bono Artesanal',
    category: 'Panadería',
    price: '$ 2.500',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80',
  },
  {
    id: 2,
    name: 'Empanada con Ají',
    category: 'Salados',
    price: '$ 3.000',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1628198622814-727eb188da91?w=400&q=80',
  },
  {
    id: 3,
    name: 'Torta de Tres Leches (Porción)',
    category: 'Postres',
    price: '$ 8.000',
    status: 'Pocas unidades',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
  },
  {
    id: 4,
    name: 'Jugo Natural de Lulo',
    category: 'Bebidas',
    price: '$ 4.500',
    status: 'Agotado',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  },
];

function ProductsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [file, setFile] = useState<File | null>(null);

  return (
    <Stack gap="xl">
      {/* Modal para crear un producto */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={<Text fw={800} fz="xl" c="dark.8">Nuevo Producto</Text>}
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        radius="md"
      >
        <Stack gap="md">
          <Group align="center">
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 'var(--mantine-radius-md)',
              border: '2px dashed var(--mantine-color-warm-4)',
              backgroundColor: 'var(--mantine-color-warm-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {file ? (
                <Image src={URL.createObjectURL(file)} w="100%" h="100%" fit="cover" />
              ) : (
                <Upload size={24} color="var(--mantine-color-dimmed)" />
              )}
            </div>
            <FileButton onChange={setFile} accept="image/png,image/jpeg">
              {(props) => <Button {...props} variant="light" color="brand.6">Subir una foto</Button>}
            </FileButton>
            <Text fz="xs" c="dimmed">Resolución recomendada: 800x800. Formatos PNG, JPG.</Text>
          </Group>

          <TextInput
            label="Nombre del producto"
            placeholder="Ej: Empanada de carne"
            autoFocus
          />

          <Group grow>
            <Select
              label="Categoría"
              placeholder="Escoge o escribe"
              data={['Panadería', 'Salados', 'Postres', 'Bebidas', 'Almuerzos']}
              searchable
              creatable
            />
            
            <NumberInput
              label="Precio (COP)"
              placeholder="0"
              prefix="$ "
              thousandSeparator="."
              decimalSeparator=","
              hideControls
            />
          </Group>

          <Select
            label="Estado"
            placeholder="¿Hay en inventario?"
            defaultValue="Disponible"
            data={[
              { value: 'Disponible', label: 'Disponible' },
              { value: 'Agotado', label: 'Agotado' },
              { value: 'Pocas unidades', label: 'Pocas unidades' }
            ]}
          />
          
          <Button fullWidth mt="md" color="brand.6" size="md">
            Guardar Producto
          </Button>
        </Stack>
      </Modal>

      {/* Header del módulo */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} c="dark.8" style={{ letterSpacing: '-0.02em' }}>
            Mis Productos
          </Title>
          <Text c="dimmed" mt={4}>
            Gestiona tu menú. Sube fotos llamativas y actualiza los precios.
          </Text>
        </div>

        <Group>
          <Button 
            variant="light" 
            color="brand.6" 
            leftSection={<Share2 size={16} />}
          >
            Compartir Menú
          </Button>
          <Button 
            color="brand.6" 
            leftSection={<Plus size={18} />}
            onClick={open}
          >
            Nuevo Producto
          </Button>
        </Group>
      </Group>

      {/* Buscador y Filtros (Simulados) */}
      <Card 
        padding="md" 
        radius="md" 
        withBorder={false}
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}
      >
        <Group>
          <TextInput
            placeholder="Buscar por nombre (ej: Empanada...)"
            leftSection={<Search size={16} color="var(--mantine-color-dimmed)" />}
            style={{ flex: 1 }}
          />
          <Button variant="default" c="dark.6">
            Categoría: Todas
          </Button>
          <Button variant="default" c="dark.6">
            Estado: Todos
          </Button>
        </Group>
      </Card>

      {/* Grilla de productos - Diseño visual, ya que queremos alejarnos de las tablas aburridas de "admin" */}
      <Grid gutter="xl">
        {mockedProducts.map((prod) => (
          <Grid.Col key={prod.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card 
              p="xs" 
              radius="md" 
              withBorder={false}
              h="100%"
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                position: 'relative',
                transition: 'transform 0.2s',
              }}
              className="hover:-translate-y-1"
            >
              <Card.Section>
                <div style={{ position: 'relative' }}>
                  <Image
                    src={prod.image}
                    height={160}
                    alt={prod.name}
                    fallbackSrc="https://placehold.co/400x300?text=Sin+Foto"
                  />
                  <Badge 
                    color={
                      prod.status === 'Disponible' ? 'teal.5' : 
                      prod.status === 'Agotado' ? 'red.5' : 'orange.5'
                    }
                    variant="filled"
                    radius="sm"
                    style={{ position: 'absolute', top: 12, left: 12 }}
                  >
                    {prod.status}
                  </Badge>
                </div>
              </Card.Section>

              <Stack gap={4} mt="md" px="xs" pb="sm" style={{ flex: 1 }}>
                <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                  {prod.category}
                </Text>
                
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Text fw={700} fz="md" c="dark.8" lineClamp={2}>
                    {prod.name}
                  </Text>
                  
                  <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <MoreVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<Edit size={14} />}>Editar</Menu.Item>
                      <Menu.Item color="red" leftSection={<Trash size={14} />}>Eliminar</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>

                <Text fw={800} fz="lg" c="brand.6" mt="auto">
                  {prod.price}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}

        {/* Tarjeta para Agregar uno nuevo (Empty State / Acción primaria inline) */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card 
            p="xl" 
            radius="md" 
            withBorder={false}
            onClick={open}
            style={{ 
              backgroundColor: 'var(--mantine-color-warm-2)',
              border: '2px dashed var(--mantine-color-warm-4)',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 280,
            }}
          >
            <ActionIcon variant="light" color="brand.6" size={60} radius="xl" mb="md">
              <Plus size={30} />
            </ActionIcon>
            <Text fw={700} c="dark.8" ta="center">Añadir nuevo plato o producto</Text>
            <Text fz="sm" c="dimmed" ta="center" mt={4}>
              Sube foto, título y precio
            </Text>
          </Card>
        </Grid.Col>

      </Grid>
    </Stack>
  );
}
