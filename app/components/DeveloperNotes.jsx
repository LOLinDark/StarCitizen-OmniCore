import { Card, Stack, Group, Text, Badge, Button, Collapse, ThemeIcon, List } from '@mantine/core';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../platform-core';
import { getPageContext } from '../data/developerContext';
import { IconChevronDown, IconFileText, IconChecklist } from '@tabler/icons-react';

/**
 * Developer Notes Component
 * 
 * Shows contextual developer information on pages:
 * - Current page status
 * - Relevant documentation links
 * - Task checklist
 * - Developer reminders
 * 
 * Only visible when dev mode is enabled.
 */
export default function DeveloperNotes() {
  const location = useLocation();
  const devMode = useAppStore((s) => s.devMode);
  const [expanded, setExpanded] = useState(false);

  if (!devMode) return null;

  const context = getPageContext(location.pathname);
  if (!context) return null;

  return (
    <Card
      bg="rgba(0, 50, 100, 0.4)"
      style={{
        border: '1px solid rgba(0, 217, 255, 0.3)',
        backdropFilter: 'blur(8px)',
        marginBottom: '2rem',
      }}
      p="md"
    >
      <Card.Section
        style={{
          borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
          padding: '1rem',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="lg" variant="light" color="cyan" radius="md">
              <IconChecklist size={18} />
            </ThemeIcon>
            <div>
              <Text fw={700} style={{ color: '#00d9ff' }}>
                🔧 Developer Notes
              </Text>
              <Text size="sm" c="dimmed">
                {context.title}
              </Text>
            </div>
          </Group>
          <Group gap="xs">
            <Badge
              variant="light"
              color={
                context.status.startsWith('✅')
                  ? 'green'
                  : context.status.startsWith('⏳')
                  ? 'yellow'
                  : context.status.startsWith('🔧')
                  ? 'blue'
                  : 'gray'
              }
            >
              {context.status}
            </Badge>
            <IconChevronDown
              size={20}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            />
          </Group>
        </Group>
      </Card.Section>

      <Collapse in={expanded}>
        <Stack gap="lg" p="md" style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)' }}>
          {/* Reminder */}
          {context.reminder && (
            <div style={{ padding: '1rem', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(255, 107, 0, 0.3)' }}>
              <Text fw={600} size="sm" mb="xs" style={{ color: '#ff6b00' }}>
                💡 Reminder
              </Text>
              <Text size="sm">{context.reminder}</Text>
            </div>
          )}

          {/* Documentation Links */}
          {context.docs && context.docs.length > 0 && (
            <div>
              <Text fw={700} size="sm" mb="xs" style={{ color: '#00d9ff' }}>
                📚 Relevant Docs
              </Text>
              <Stack gap="xs">
                {context.docs.map((doc, idx) => (
                  <Group key={idx} gap="xs">
                    <ThemeIcon size="sm" variant="light" color="cyan">
                      <IconFileText size={14} />
                    </ThemeIcon>
                    <Button
                      variant="subtle"
                      size="xs"
                      p={0}
                      h="auto"
                      component="a"
                      href={`/${doc.path}`}
                      target="_blank"
                      style={{ textDecoration: 'underline', color: '#00d9ff' }}
                    >
                      {doc.title}
                    </Button>
                  </Group>
                ))}
              </Stack>
            </div>
          )}

          {/* Tasks */}
          {context.tasks && context.tasks.length > 0 && (
            <div>
              <Text fw={700} size="sm" mb="xs" style={{ color: '#00d9ff' }}>
                ✓ Pipeline / Tasks
              </Text>
              <List
                size="sm"
                spacing="xs"
                icon={
                  <ThemeIcon size={16} radius="xl" variant="light" color="cyan">
                    ✓
                  </ThemeIcon>
                }
              >
                {context.tasks.map((task, idx) => (
                  <List.Item key={idx} style={{ color: task.startsWith('✅') ? '#00ff88' : task.startsWith('⏳') ? '#ffaa00' : '#ccc' }}>
                    {task}
                  </List.Item>
                ))}
              </List>
            </div>
          )}

          {/* Help Tip */}
          <Text size="xs" c="dimmed" style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '1rem' }}>
            💬 Keep this context updated as you work. It helps all developers stay aligned!
          </Text>
        </Stack>
      </Collapse>
    </Card>
  );
}
