import { Accordion, Container, Stack, Text, Title } from "@mantine/core";

const faqs = [
  {
    value: "cost",
    question: "¿Tiene algún costo?",
    answer:
      "Empezar es gratis. Puedes crear tu menú, compartir tu link y generar códigos QR sin costo. Más adelante habrá planes opcionales para marca y personalización avanzada.",
  },
  {
    value: "tech",
    question: "¿Necesito saber programar?",
    answer:
      "No. Está pensado para dueños de negocio, no para equipos técnicos. Si sabes subir una foto a una red social, puedes usar la app.",
  },
  {
    value: "domain",
    question: "¿Puedo usar mi propio dominio?",
    answer:
      "Hoy te damos un enlace corto y profesional para publicar rápido. Más adelante podrás conectar tu propio dominio.",
  },
  {
    value: "payments",
    question: "¿Los clientes pueden pagar por ahí?",
    answer:
      "Por ahora funciona como un catálogo digital interactivo para impulsar pedidos y visitas. La recepción directa por WhatsApp está en la hoja de ruta.",
  },
] as const;

const sectionSpacing = { base: 64, md: 104 } as const;

export function FaqsSection() {
  return (
    <Container size="sm" py={sectionSpacing}>
      <Stack gap={18} mb={42} ta="center" align="center">
        <Text size="sm" fw={800} c="brand.7" className="section-eyebrow">
          Preguntas frecuentes
        </Text>
        <Title order={2} className="landing-section-title landing-ink-strong">
          Lo necesario para decidir si te sirve hoy.
        </Title>
      </Stack>

      <Accordion variant="separated" radius="xl" className="faq-shell">
        {faqs.map((item) => (
          <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Control fw={700} fz="lg" className="landing-ink-strong">
              {item.question}
            </Accordion.Control>
            <Accordion.Panel className="landing-ink" lh={1.7}>
              {item.answer}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
