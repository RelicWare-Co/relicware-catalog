import {
  Accordion,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Coffee, QrCode, Smartphone, Store } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function HeroAnimation() {
  return (
    <Box pos="relative" w="100%" maw={360} h={380} mx="auto" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes clickBtn {
          0%, 15% { transform: scale(1); filter: brightness(1); }
          18% { transform: scale(0.95); filter: brightness(0.9); }
          22%, 100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes flyPayload {
          0%, 20% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          22% { transform: translate(0, 0) scale(1); opacity: 1; }
          45% { transform: translate(160px, -150px) scale(1); opacity: 1; }
          50%, 100% { transform: translate(160px, -150px) scale(0); opacity: 0; }
        }
        @keyframes popAlert {
          0%, 45% { transform: translateY(15px) scale(0.9); opacity: 0; }
          50% { transform: translateY(-5px) scale(1.02); opacity: 1; box-shadow: 0 10px 20px rgba(255, 100, 100, 0.1); }
          55%, 85% { transform: translateY(0) scale(1); opacity: 1; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          90%, 100% { transform: translateY(-15px) scale(0.9); opacity: 0; }
        }
        @keyframes pathDash {
          to { stroke-dashoffset: -12; }
        }
      `}</style>
      
      {/* Background SVG path to show connection */}
      <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }} aria-hidden="true">
        <path 
          d="M 80 270 Q 140 200, 220 120" 
          stroke="var(--mantine-color-brand-2)" 
          strokeWidth="3" 
          strokeDasharray="6 6" 
          fill="none" 
          style={{ animation: 'pathDash 1s linear infinite' }}
        />
      </svg>

      {/* FLYING PAYLOAD */}
      <Box 
        pos="absolute" 
        bottom={100} 
        left={60} 
        style={{ animation: 'flyPayload 4s ease-in-out infinite', zIndex: 3 }}
      >
        <ThemeIcon size="md" radius="xl" color="brand">
          <Check size={14} />
        </ThemeIcon>
      </Box>

      {/* PHONE (Customer side) */}
      <Paper shadow="xl" radius="xl" p="md" withBorder w={160} pos="absolute" bottom={0} left={0} bg="white" style={{ zIndex: 2 }}>
        <Box bg="gray.1" h={90} style={{ borderRadius: 12, overflow: "hidden" }} mb="sm" pos="relative">
           <ThemeIcon size="xl" radius="md" variant="subtle" color="gray" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
             <Coffee size={24} />
           </ThemeIcon>
        </Box>
        <Box bg="gray.2" h={10} w="70%" mb={6} style={{ borderRadius: 4 }} />
        <Box bg="gray.1" h={8} w="50%" mb="xl" style={{ borderRadius: 4 }} />
        
        <Box 
          bg="brand.5" 
          h={36} 
          style={{ borderRadius: 18, animation: 'clickBtn 4s ease-in-out infinite' }} 
          display="flex"
        >
          <Text size="xs" fw={700} c="white" m="auto">Ordenar $3.50</Text>
        </Box>
      </Paper>

      {/* DASHBOARD (Business side) */}
      <Paper shadow="xl" radius="lg" p="md" withBorder w={220} pos="absolute" top={20} right={0} bg="white" style={{ zIndex: 2 }}>
        <Group mb="md" wrap="nowrap">
          <Avatar size="sm" color="brand" radius="md"><Store size={14}/></Avatar>
          <Box style={{ flex: 1 }}>
            <Text size="xs" fw={700}>Órdenes de Hoy</Text>
            <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>Actualizado ahora</Text>
          </Box>
        </Group>

        <Stack gap="xs" pos="relative">
          {/* Animated new order alert */}
          <Paper 
            shadow="sm" 
            p="xs" 
            radius="md" 
            withBorder 
            bg="brand.0"
            style={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, 
              animation: 'popAlert 4s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite',
              zIndex: 10 
            }}
          >
            <Group wrap="nowrap">
              <ThemeIcon color="brand" variant="filled" size="sm" radius="xl"><Check size={12} /></ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={700} c="brand.9">Nuevo Pedido</Text>
                <Text size="xs" c="brand.7" style={{ fontSize: 10 }}>Mesa 4 • Café x1</Text>
              </Box>
              <Text size="xs" fw={800} c="brand.9">$3.5</Text>
            </Group>
          </Paper>

          {/* Older orders (static) */}
          <Box p="xs" bg="gray.0" style={{ borderRadius: 8, opacity: 0.6, transform: 'translateY(50px)' }}>
            <Group wrap="nowrap">
              <ThemeIcon color="gray" variant="light" size="sm" radius="md"><Coffee size={12} /></ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={600}>Para llevar</Text>
                <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>Hace 5 min</Text>
              </Box>
              <Text size="xs" fw={600} c="dimmed">$7.0</Text>
            </Group>
          </Box>
          <Box p="xs" bg="gray.0" style={{ borderRadius: 8, opacity: 0.4, transform: 'translateY(50px)' }}>
            <Group wrap="nowrap">
              <ThemeIcon color="gray" variant="light" size="sm" radius="md"><Store size={12} /></ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={600}>En local</Text>
                <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>Hace 18 min</Text>
              </Box>
              <Text size="xs" fw={600} c="dimmed">$12.5</Text>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function Index() {
  return (
    <main>
      {/* HERO SECTION */}
      <Container size="xl" pt={{ base: "xl", md: 80 }} pb={{ base: "xl", md: 80 }}>
        <Grid align="center" gutter={{ base: "xl", md: 60 }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack align="flex-start" ta="left" gap="lg">
              <Badge size="lg" variant="light" color="brand" radius="xl">
                Hecho para dueños de negocios
              </Badge>
              <Title
                order={1}
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)", lineHeight: 1.1, textWrap: "balance" }}
                fw={900}
              >
                Tu menú y catálogo, <br />
                <Text component="span" c="brand" inherit>
                  listos en minutos.
                </Text>
              </Title>
              <Text c="dimmed" size="xl" maw={500} style={{ textWrap: "pretty" }}>
                Deja atrás los PDFs. Crea un catálogo digital interactivo, con tu propio link y códigos QR, para que tus clientes pidan más rápido y fácil.
              </Text>

              <Group mt="md">
                <Button
                  component={Link}
                  to="/register"
                  size="xl"
                  variant="filled"
                  color="brand"
                  radius="xl"
                  rightSection={<ChevronRight size={20} aria-hidden="true" />}
                >
                  Crear mi menú gratis
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  size="lg"
                  variant="subtle"
                  color="gray"
                  radius="xl"
                >
                  Iniciar Sesión
                </Button>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box pos="relative" w="100%" h="100%" display="flex" style={{ justifyContent: "center", alignItems: "center" }}>
              {/* Decorative background blob */}
              <Box
                pos="absolute"
                w={400}
                h={400}
                bg="brand.1"
                style={{ borderRadius: "50%", filter: "blur(60px)", opacity: 0.6, zIndex: 0 }}
              />
              {/* Mockup */}
              <HeroAnimation />
            </Box>
          </Grid.Col>
        </Grid>
      </Container>

      {/* BENTO GRID FEATURES */}
      <Box bg="gray.0" py={{ base: 60, md: 100 }} mt={{ base: 40, md: 60 }}>
        <Container size="xl">
          <Title order={2} ta="center" mb={60} style={{ textWrap: "balance" }}>
            Todo diseñado para simplificar tus ventas
          </Title>
          
          <Grid gutter="xl">
            {/* Feature 1: Large */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper radius="xl" p={{ base: "xl", md: 50 }} bg="white" shadow="sm" h="100%">
                <Box mb="xl">
                  <ThemeIcon size={60} radius="xl" variant="light" color="brand">
                    <Store size={30} aria-hidden="true" />
                  </ThemeIcon>
                </Box>
                <Title order={3} mb="md">Actualiza tus productos en vivo</Title>
                <Text size="lg" c="dimmed" mb="xl" maw={500}>
                  Ya no necesitas reimprimir menús ni reenviar PDFs. Agrega fotos, cambia precios o marca productos como agotados con un solo clic. Tus clientes siempre verán la versión más reciente.
                </Text>
                <Group gap="xs">
                  <Badge variant="dot" color="green" size="lg">Disponible</Badge>
                  <Badge variant="dot" color="red" size="lg">Agotado</Badge>
                </Group>
              </Paper>
            </Grid.Col>

            {/* Feature 2: Small (QR) */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper radius="xl" p={{ base: "xl", md: 40 }} bg="brand.9" c="white" shadow="sm" h="100%">
                <Box mb="xl">
                  <ThemeIcon size={60} radius="xl" color="white" c="brand.9">
                    <QrCode size={30} aria-hidden="true" />
                  </ThemeIcon>
                </Box>
                <Title order={3} mb="md" c="white">Escanea y Ordena</Title>
                <Text size="md" c="white" style={{ opacity: 0.9 }}>
                  Genera pósters y mostradores con códigos QR al instante. Útil para mesas en restaurantes o la vitrina de tu local.
                </Text>
              </Paper>
            </Grid.Col>

            {/* Feature 3: Full Width Banner */}
            <Grid.Col span={12}>
              <Paper radius="xl" p={{ base: "xl", md: 50 }} bg="white" shadow="sm">
                <Grid align="center" gutter="xl">
                  <Grid.Col span={{ base: 12, md: 7 }}>
                    <Title order={3} mb="md">Un solo link en tu bio</Title>
                    <Text size="lg" c="dimmed" mb="xl" style={{ textWrap: "pretty" }}>
                      Centraliza todas tus redes, tu ubicación en Maps, tu WhatsApp y tu menú en un solo lugar adaptado a móviles.
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <Group bg="gray.1" p="md" style={{ borderRadius: 16 }} wrap="nowrap">
                      <Smartphone size={24} color="gray" />
                      <Text fw={500} truncate style={{ flex: 1 }}>
                        relic.app/menu
                      </Text>
                      <Button size="xs" radius="xl" color="gray" variant="light">Ver demo</Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* HOW IT WORKS */}
      <Container size="lg" py={{ base: 60, md: 100 }} mt={{ base: 20, md: 40 }}>
        <Title order={2} ta="center" mb={60} style={{ textWrap: "balance" }}>
          De tu idea a estar en línea en 3 pasos
        </Title>
        <Grid gutter={50}>
          {[
            { step: "01", title: "Crea tu espacio", desc: "Regístrate en segundos y personaliza el perfil con tu logo, colores y horarios." },
            { step: "02", title: "Sube tu menú", desc: "Agrega categorías, platillos, fotos y precios desde tu celular o computadora." },
            { step: "03", title: "Comparte y vende", desc: "Pon el enlace en tu biografía de Instagram, WhatsApp o imprime el código QR para tus mesas." }
          ].map((item) => (
            <Grid.Col span={{ base: 12, md: 4 }} key={item.step}>
              <Box>
                <Text size="xl" fw={900} c="brand.2" style={{ fontSize: "4rem", lineHeight: 1 }}>{item.step}</Text>
                <Title order={4} mt="sm" mb="xs">{item.title}</Title>
                <Text c="dimmed" lh={1.6} style={{ textWrap: "pretty" }}>{item.desc}</Text>
              </Box>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* TESTIMONIAL / IMPACT */}
      <Box bg="brand.9" c="white" py={{ base: 60, md: 100 }}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 40, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="lg" c="white" style={{ textWrap: "balance" }}>
                "Mis clientes ya no me piden el PDF, solo entran al link en mi perfil."
              </Title>
              <Text size="lg" mb="xl" lh={1.6} style={{ opacity: 0.8, textWrap: "pretty" }}>
                Antes perdíamos tiempo enviando fotos del menú por WhatsApp cada que alguien preguntaba. Ahora, actualizar un precio me toma 5 segundos y todos lo ven al instante.
              </Text>
              <Group>
                <Avatar radius="xl" color="brand" />
                <Box>
                  <Text fw={700}>María Fernández</Text>
                  <Text size="sm" style={{ opacity: 0.8 }}>Dueña de Pastelería</Text>
                </Box>
              </Group>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Grid>
                <Grid.Col span={6}>
                  <Paper p="xl" radius="xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }} c="white">
                    <Text size="sm" style={{ opacity: 0.8 }} mb={4}>Visitas al menú</Text>
                    <Text size="xl" fw={900} style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}>+10k</Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper p="xl" radius="xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }} c="white">
                    <Text size="sm" style={{ opacity: 0.8 }} mb={4}>Tiempo ahorrado</Text>
                    <Text size="xl" fw={900} style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}>14h</Text>
                    <Text size="xs" style={{ opacity: 0.8 }} mt={4}>al mes en atención</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Container size="sm" py={{ base: 60, md: 100 }}>
        <Title order={2} ta="center" mb={50} style={{ textWrap: "balance" }}>
          Preguntas Frecuentes
        </Title>
        <Accordion variant="separated" radius="md">
          <Accordion.Item value="cost">
            <Accordion.Control fw={600} fz="lg">¿Tiene algún costo?</Accordion.Control>
            <Accordion.Panel c="dimmed" lh={1.6}>Empezar es completamente gratis. Podrás crear tu menú, compartir tu link y generar códigos QR sin costo. Más adelante ofreceremos planes premium opcionales con funciones avanzadas de marca y personalización.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="tech">
            <Accordion.Control fw={600} fz="lg">¿Necesito saber programar?</Accordion.Control>
            <Accordion.Panel c="dimmed" lh={1.6}>En absoluto. Nuestra plataforma funciona tan fácil como usar alguna red social: si sabes subir una foto a Instagram, sabes usar nuestra app. Todo es visual y los cambios son al instante.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="domain">
            <Accordion.Control fw={600} fz="lg">¿Puedo usar mi propio dominio?</Accordion.Control>
            <Accordion.Panel c="dimmed" lh={1.6}>Actualmente te brindamos un enlace corto y profesional (ej: relic.app/menu/tunegocio). En futuras actualizaciones permitiremos conectar tu propio domino .com o de tu país.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="payments">
            <Accordion.Control fw={600} fz="lg">¿Los clientes pueden pagar por ahí?</Accordion.Control>
            <Accordion.Panel c="dimmed" lh={1.6}>Por ahora, la plataforma funciona como un catálogo digital interactivo. Puedes mostrar tus productos de forma atractiva para que te contacten o te visiten. Próximamente habilitaremos recepciones directas con WhatsApp.</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Container>

      {/* FOOTER CTA */}
      <Container size="md" py={{ base: 80, md: 120 }} ta="center">
        <Title order={2} mb="md" style={{ textWrap: "balance" }}>
          Toma el control de tu presencia digital
        </Title>
        <Text c="dimmed" size="lg" mb="xl" mx="auto" maw={500}>
          Regístrate gratis y crea la primera versión de tu menú en menos de 5 minutos.
        </Text>
        <Button
          component={Link}
          to="/register"
          size="xl"
          variant="filled"
          color="brand"
          radius="xl"
          rightSection={<ChevronRight size={20} aria-hidden="true" />}
        >
          Crear mi cuenta
        </Button>
      </Container>
    </main>
  );
}
