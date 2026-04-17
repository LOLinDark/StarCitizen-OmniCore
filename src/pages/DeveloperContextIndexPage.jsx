import { Container, Stack, Text, Badge, Card, Group, Grid, Button, SimpleGrid } from '@mantine/core';
import { Link } from 'react-router-dom';
import { getAllContexts } from '../data/developerContext';
import { SciFiFrame } from '../components/ui';
import DevTag from '../components/DevTag';

export default function DeveloperContextIndexPage() {
  const contexts = getAllContexts();

  // Group by status
  const completed = Object.entries(contexts).filter(([, c]) => c.status.startsWith('✅'));
  const inProgress = Object.entries(contexts).filter(([, c]) => c.status.startsWith('⏳'));
  const maintenance = Object.entries(contexts).filter(([, c]) => c.status.startsWith('🔧'));

  const ContextCard = ({ path, context }) => (
    <SciFiFrame variant="corners" cornerLength={8} strokeWidth={1} padding={1}>
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Text fw={700} size="sm" style={{ color: '#00d9ff' }}>
              {path}
            </Text>
            <Text size="xs" c="dimmed">
              {context.title}
            </Text>
          </div>
          <Badge
            size="sm"
            color={
              context.status.startsWith('✅')
                ? 'green'
                : context.status.startsWith('⏳')
                ? 'yellow'
                : 'blue'
            }
          >
            {context.status}
          </Badge>
        </Group>

        {/* Quick stats */}
        <Group gap="xs">
          {context.docs && <Badge size="xs" variant="light">{context.docs.length} docs</Badge>}
          {context.tasks && <Badge size="xs" variant="light">{context.tasks.length} tasks</Badge>}
        </Group>

        {/* Navigate button */}
        <Button
          size="xs"
          variant="outline"
          color="cyan"
          component={Link}
          to={path}
          fullWidth
        >
          View Page →
        </Button>
      </Stack>
    </SciFiFrame>
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}><DevTag tag="DEV02" />🗂️ Developer Context Index</h1>
          <Text c="dimmed">Overview of all pages, their status, docs, and tasks</Text>
          <Text size="sm" c="dimmed" mt="xs">
            💡 Tip: Developer notes appear on each page when Dev Mode is enabled. Toggle it in the header menu.
          </Text>
        </div>

        {/* Stats */}
        <Group gap="xl">
          <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
            <Stack gap="xs">
              <Text fw={700} size="sm">Total Pages</Text>
              <Text size="lg" style={{ color: '#00d9ff' }}>
                {Object.keys(contexts).length}
              </Text>
            </Stack>
          </Card>

          <Card bg="rgba(0, 255, 136, 0.05)" style={{ border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <Stack gap="xs">
              <Text fw={700} size="sm">Completed</Text>
              <Text size="lg" style={{ color: '#00ff88' }}>
                {completed.length}
              </Text>
            </Stack>
          </Card>

          <Card bg="rgba(255, 170, 0, 0.05)" style={{ border: '1px solid rgba(255, 170, 0, 0.2)' }}>
            <Stack gap="xs">
              <Text fw={700} size="sm">In Progress</Text>
              <Text size="lg" style={{ color: '#ffaa00' }}>
                {inProgress.length}
              </Text>
            </Stack>
          </Card>

          <Card bg="rgba(100, 200, 255, 0.05)" style={{ border: '1px solid rgba(100, 200, 255, 0.2)' }}>
            <Stack gap="xs">
              <Text fw={700} size="sm">Maintenance</Text>
              <Text size="lg" style={{ color: '#64c8ff' }}>
                {maintenance.length}
              </Text>
            </Stack>
          </Card>
        </Group>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <Text fw={700} mb="md" size="lg" style={{ color: '#00ff88' }}>
              ✅ Completed Features
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {completed.map(([path, context]) => (
                <ContextCard key={path} path={path} context={context} />
              ))}
            </SimpleGrid>
          </div>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div>
            <Text fw={700} mb="md" size="lg" style={{ color: '#ffaa00' }}>
              ⏳ In Development
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {inProgress.map(([path, context]) => (
                <ContextCard key={path} path={path} context={context} />
              ))}
            </SimpleGrid>
          </div>
        )}

        {/* Maintenance */}
        {maintenance.length > 0 && (
          <div>
            <Text fw={700} mb="md" size="lg" style={{ color: '#64c8ff' }}>
              🔧 Maintenance & Refactoring
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {maintenance.map(([path, context]) => (
                <ContextCard key={path} path={path} context={context} />
              ))}
            </SimpleGrid>
          </div>
        )}

        {/* How to Use */}
        <Card bg="rgba(0, 50, 100, 0.3)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
          <Stack gap="md">
            <Text fw={700} style={{ color: '#00d9ff' }}>
              🎯 How to Use This System
            </Text>

            <Stack gap="sm">
              <div>
                <Text fw={600} size="sm">1. Enable Dev Mode</Text>
                <Text size="sm" c="dimmed">
                  Click the dev mode toggle in the menu to enable Developer Notes on every page
                </Text>
              </div>

              <div>
                <Text fw={600} size="sm">2. View Context Notes</Text>
                <Text size="sm" c="dimmed">
                  Navigate to any page. Dev Notes appear at the top showing status, docs, and tasks
                </Text>
              </div>

              <div>
                <Text fw={600} size="sm">3. Stay Aligned</Text>
                <Text size="sm" c="dimmed">
                  Keep the context updated in <code>src/data/developerContext.js</code> as you work
                </Text>
              </div>

              <div>
                <Text fw={600} size="sm">4. Document as You Go</Text>
                <Text size="sm" c="dimmed">
                  Add links to docs and update task status. This becomes your shared knowledge base
                </Text>
              </div>
            </Stack>
          </Stack>
        </Card>

        {/* Tips */}
        <Card bg="rgba(255, 107, 0, 0.05)" style={{ border: '1px solid rgba(255, 107, 0, 0.2)' }}>
          <Stack gap="sm">
            <Text fw={700} style={{ color: '#ff6b00' }}>
              💡 Tips for Maintaining Context
            </Text>

            <Text size="sm">
              • Update context immediately after major changes<br/>
              • Link to relevant documentation files<br/>
              • Keep task lists realistic and current<br/>
              • Use reminders to highlight important gotchas<br/>
              • Review context before starting work on a feature
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
