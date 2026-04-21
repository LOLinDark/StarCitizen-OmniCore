import { Container, Title, Card, Text, Stack, Badge, Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import DevTag from '../components/DevTag';

export default function DeveloperPage() {
  const navigate = useNavigate();

  const adminTools = [
    { label: 'API Test', desc: 'Test Citizen, Gemini, and Rate Limit APIs', path: '/developer/api-test' },
    { label: 'Nav Charts Lab', desc: 'Dual-reality blend slider and command briefing mockup', path: '/developer/nav-charts-lab' },
    { label: 'Developer Context', desc: 'View all page contexts and tasks', path: '/developer/context' },
    { label: 'Error Log', desc: 'View application errors', path: '/developer/errors' },
    { label: 'Changes', desc: 'View recent changes and updates', path: '/developer/changes' },
    { label: 'Settings', desc: 'Configure developer preferences', path: '/settings' },
    { label: 'Analytics', desc: 'View usage statistics', path: '/admin/analytics' },
  ];

  return (
    <Container size="lg">
      <Title mb="md">
        <DevTag tag="DEV01" />
        Developer Tools
      </Title>
      
      <Stack gap="md">
        <Card withBorder>
          <Group justify="space-between" mb="sm">
            <Title order={3}>Environment</Title>
            <Badge color="green">Development</Badge>
          </Group>
          <Text size="sm" c="dimmed">Development mode active. Use tools below to monitor, test, and configure.</Text>
        </Card>

        <Card withBorder>
          <Title order={3} mb="sm">
            <DevTag tag="DEV01.1" />
            Admin Tools
          </Title>
          <Stack gap="xs">
            {adminTools.map((tool) => (
              <Group key={tool.path} justify="space-between" wrap="nowrap">
                <div>
                  <Text size="sm" fw={600}>{tool.label}</Text>
                  <Text size="xs" c="dimmed">{tool.desc}</Text>
                </div>
                <Button size="xs" variant="light" onClick={() => navigate(tool.path)}>
                  Go
                </Button>
              </Group>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
