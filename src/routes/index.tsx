import { Button, Container, Group, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Container size="md" pt="xl">
      <Title order={1}>Welcome</Title>
      <Text c="dimmed" mt="md">
        Mantine has been installed and configured successfully.
      </Text>
      <Group mt="xl">
        <Button variant="filled">Get Started</Button>
        <Button variant="light">Documentation</Button>
      </Group>
    </Container>
  );
}
