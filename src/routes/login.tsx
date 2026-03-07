import { createFileRoute } from '@tanstack/react-router';
import { Box, Title, Text, TextInput, Button, Group, Stack, Flex, Anchor, PasswordInput } from '@mantine/core';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box 
      w="100%" 
      h="100vh" 
      display="flex"
      bg="warm.1" // Referencia a nuestra paleta `warm` en el theme
    >
      {/* Left side: The functional form, clean, spacious, asymmetric */}
      <Flex 
        flex={1} 
        direction="column" 
        justify="center" 
        align="center"
        p={{ base: 'xl', md: 80 }}
      >
        <Box w="100%" maw={400}>
          <Title 
            order={1} 
            c="dark.8"
            mb={8}
            style={{ letterSpacing: '-0.02em' }}
          >
            Tu negocio, digital
          </Title>
          <Text c="dimmed" fz="lg" mb={40}>
            Ingresa a Catalog y empieza a compartir tus menús y catálogos con tus clientes.
          </Text>

          <Stack gap="xl">
            <TextInput
              label="Correo electrónico"
              placeholder="tu@negocio.com"
            />
            
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
            />

            <Button 
              size="lg" 
              fullWidth
              color="brand.6" // Refiere a nuestro color principal en el theme
              mt={10}
            >
              Iniciar sesión
            </Button>
          </Stack>

          <Group justify="center" mt={32}>
            <Text fz="sm" c="dimmed">
              ¿Aún no tienes cuenta?{' '}
              <Anchor 
                href="/register" 
                c="brand.6" 
                fw={600}
                style={{ textDecoration: 'none' }}
              >
                Crea tu catálogo gratis
              </Anchor>
            </Text>
          </Group>
        </Box>
      </Flex>

      {/* Right side: Human connection, photography or soft organic elements */}
      <Box 
        flex={1} 
        display={{ base: 'none', lg: 'block' }}
        p={24} // Padding around the image container
      >
        <Box
          w="100%"
          h="100%"
          style={{
            borderRadius: 24,
            backgroundImage: 'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2674&auto=format&fit=crop")', // A welcoming, warm local business feeling
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle overlay */}
          <Box 
            pos="absolute"
            inset={0}
            bg="linear-gradient(to top, rgba(42, 42, 42, 0.4) 0%, rgba(42, 42, 42, 0) 50%)"
          />
          
          <Box
            pos="absolute"
            bottom={40}
            left={40}
            right={40}
            c="white"
          >
            <Title order={2} mb={12} style={{ letterSpacing: '-0.01em', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              "Nuestros clientes ahora piden el triple por WhatsApp desde que usamos nuestro menú en Catalog."
            </Title>
            <Text fz="lg" fw={500} style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              — María A., Dueña de Restaurante y Panadería
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
