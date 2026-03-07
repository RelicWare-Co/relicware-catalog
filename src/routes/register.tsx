import {
  Alert,
  Anchor,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { authClient } from "#/lib/auth-client";
import { getServerSession } from "#/lib/session";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async () => {
    const session = await getServerSession();

    if (session) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/register" });
  const search = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) =>
        value.trim().length >= 2
          ? null
          : "Ingresa el nombre de tu negocio o tu nombre",
      email: (value) =>
        /^\S+@\S+$/.test(value.trim()) ? null : "Ingresa un correo válido",
      password: (value) =>
        value.length >= 8
          ? null
          : "La contraseña debe tener al menos 8 caracteres",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Las contraseñas no coinciden",
    },
  });

  const handleRedirect = () => {
    if (search.redirect?.startsWith("/")) {
      window.location.replace(search.redirect);
      return;
    }

    navigate({ to: "/dashboard", replace: true });
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitError(null);

    const { error } = await authClient.signUp.email({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setSubmitError(error.message || "No se pudo crear la cuenta");
      return;
    }

    handleRedirect();
  });

  useEffect(() => {
    if (isPending || !session) {
      return;
    }

    if (search.redirect?.startsWith("/")) {
      window.location.replace(search.redirect);
      return;
    }

    navigate({ to: "/dashboard", replace: true });
  }, [isPending, navigate, search.redirect, session]);

  if (isPending) {
    return (
      <Flex w="100%" h="100vh" align="center" justify="center" bg="warm.1">
        <Loader color="brand.6" />
      </Flex>
    );
  }

  if (session) {
    return null;
  }

  return (
    <Box w="100%" h="100vh" display="flex" bg="warm.1">
      <Flex
        flex={1}
        direction="column"
        justify="center"
        align="center"
        p={{ base: "xl", md: 80 }}
      >
        <Box w="100%" maw={440}>
          <Title
            order={1}
            c="dark.8"
            mb={8}
            style={{ letterSpacing: "-0.02em" }}
          >
            Crea tu espacio en Catalog
          </Title>
          <Text c="dimmed" fz="lg" mb={40}>
            Abre tu cuenta para publicar tu catálogo, recibir leads y compartir
            tus links desde un solo lugar.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              {submitError ? (
                <Alert color="red" radius="lg" icon={<AlertCircle size={18} />}>
                  {submitError}
                </Alert>
              ) : null}

              <TextInput
                label="Nombre"
                placeholder="Tu negocio o tu nombre"
                autoComplete="name"
                key={form.key("name")}
                {...form.getInputProps("name")}
              />

              <TextInput
                label="Correo electrónico"
                placeholder="tu@negocio.com"
                autoComplete="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                key={form.key("password")}
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                key={form.key("confirmPassword")}
                {...form.getInputProps("confirmPassword")}
              />

              <Button
                type="submit"
                size="lg"
                fullWidth
                color="brand.6"
                mt={10}
                loading={form.submitting}
              >
                Crear cuenta
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt={32}>
            <Text fz="sm" c="dimmed">
              ¿Ya tienes cuenta?{" "}
              <Anchor
                href="/login"
                c="brand.6"
                fw={600}
                style={{ textDecoration: "none" }}
              >
                Inicia sesión
              </Anchor>
            </Text>
          </Group>
        </Box>
      </Flex>

      <Box flex={1} display={{ base: "none", lg: "block" }} p={24}>
        <Box
          w="100%"
          h="100%"
          style={{
            borderRadius: 24,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            pos="absolute"
            inset={0}
            bg="linear-gradient(to top, rgba(42, 42, 42, 0.52) 0%, rgba(42, 42, 42, 0.08) 55%)"
          />

          <Box pos="absolute" bottom={40} left={40} right={40} c="white">
            <Title
              order={2}
              mb={12}
              style={{
                letterSpacing: "-0.01em",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              "Pasamos de responder mensajes sueltos a tener todo el menú, los
              horarios y las reservas en un solo sitio."
            </Title>
            <Text
              fz="lg"
              fw={500}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
            >
              — Equipo de Casa Nativa
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
