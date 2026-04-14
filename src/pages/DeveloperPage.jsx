import { Container, Title, Card, Text, Stack, Badge, Group } from '@mantine/core';

export default function DeveloperPage() {
  return (
    <Container size="lg">
      <Title mb="md">Developer Tools</Title>
      
      <Stack gap="md">
        <Card withBorder>
          <Group justify="space-between" mb="sm">
            <Title order={3}>Environment</Title>
            <Badge color="green">Development</Badge>
          </Group>
          <Text size="sm" c="dimmed">Use the left sidebar to access developer pages</Text>
        </Card>

        <Card withBorder>
          <Title order={3} mb="sm">Quick Links</Title>
          <Stack gap="xs">
            <Text size="sm">• Rate Limits - Monitor API usage</Text>
            <Text size="sm">• Analytics - View usage statistics</Text>
            <Text size="sm">• Theme - Test UI components</Text>
            <Text size="sm">• Settings - Configure developer pages</Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
