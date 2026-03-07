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

export const Route = createFileRoute("/login")({
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
  const navigate = useNavigate({ from: "/login" });
  const search = Route.useSearch();
  const { data: session, isPending } = authClient.useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value.trim()) ? null : "Ingresa un correo válido",
      password: (value) =>
        value.length >= 8
          ? null
          : "La contraseña debe tener al menos 8 caracteres",
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

    const { error } = await authClient.signIn.email({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setSubmitError(error.message || "No se pudo iniciar sesión");
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
        p={{ base: "xl", md: 80 }}
      >
        <Box w="100%" maw={400}>
          <Title
            order={1}
            c="dark.8"
            mb={8}
            style={{ letterSpacing: "-0.02em" }}
          >
            Tu negocio, digital
          </Title>
          <Text c="dimmed" fz="lg" mb={40}>
            Ingresa a Catalog y empieza a compartir tus menús y catálogos con
            tus clientes.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="xl">
              {submitError ? (
                <Alert color="red" radius="lg" icon={<AlertCircle size={18} />}>
                  {submitError}
                </Alert>
              ) : null}

              <TextInput
                label="Correo electrónico"
                placeholder="tu@negocio.com"
                autoComplete="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Contraseña"
                placeholder="••••••••"
                autoComplete="current-password"
                key={form.key("password")}
                {...form.getInputProps("password")}
              />

              <Button
                type="submit"
                size="lg"
                fullWidth
                color="brand.6"
                mt={10}
                loading={form.submitting}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt={32}>
            <Text fz="sm" c="dimmed">
              ¿Aún no tienes cuenta?{" "}
              <Anchor
                href="/register"
                c="brand.6"
                fw={600}
                style={{ textDecoration: "none" }}
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
        display={{ base: "none", lg: "block" }}
        p={24} // Padding around the image container
      >
        <Box
          w="100%"
          h="100%"
          style={{
            borderRadius: 24,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2674&auto=format&fit=crop")', // A welcoming, warm local business feeling
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle overlay */}
          <Box
            pos="absolute"
            inset={0}
            bg="linear-gradient(to top, rgba(42, 42, 42, 0.4) 0%, rgba(42, 42, 42, 0) 50%)"
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
              "Nuestros clientes ahora piden el triple por WhatsApp desde que
              usamos nuestro menú en Catalog."
            </Title>
            <Text
              fz="lg"
              fw={500}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
            >
              — María A., Dueña de Restaurante y Panadería
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
