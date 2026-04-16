import { Stack, Card, Group, Badge, Text, Checkbox, Button, SimpleGrid, ThemeIcon } from '@mantine/core';
import { useState } from 'react';

export default function ChecklistSection({ 
  icon = '✓', 
  title, 
  subtitle,
  color = '#00d9ff',
  tasks = [],
  onTaskToggle,
  showDescription = true,
}) {
  const [expandedTasks, setExpandedTasks] = useState({});

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <Card
      p="lg"
      radius="md"
      style={{
        backgroundColor: 'rgba(11, 20, 40, 0.6)',
        borderLeft: `4px solid ${color}`,
        borderRadius: '8px',
        border: `1px solid rgba(0, 217, 255, 0.2)`,
        boxShadow: `0 0 15px rgba(0, 217, 255, 0.1)`,
      }}
    >
      {/* Section Header */}
      <Group justify="space-between" mb="lg" align="flex-start">
        <Group gap="md" align="flex-start">
          <ThemeIcon
            size="lg"
            radius="md"
            style={{
              backgroundColor: 'rgba(0, 217, 255, 0.1)',
              color: color,
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700} size="lg" style={{ color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Text>
            {subtitle && <Text size="sm" c="dimmed">{subtitle}</Text>}
          </Stack>
        </Group>
        <Badge
          color="cyan"
          variant="light"
          size="lg"
          style={{
            fontSize: '0.85rem',
            padding: '0.5rem 0.75rem',
          }}
        >
          {completedCount}/{totalCount}
        </Badge>
      </Group>

      {/* Progress Bar */}
      <div
        style={{
          height: '4px',
          backgroundColor: 'rgba(0, 217, 255, 0.1)',
          borderRadius: '2px',
          marginBottom: '1rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: color,
            width: `${progressPercent}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Tasks List */}
      <Stack gap="md">
        {tasks.map((task) => (
          <Card
            key={task.id}
            p="md"
            radius="sm"
            style={{
              backgroundColor: task.completed ? 'rgba(0, 255, 136, 0.05)' : 'rgba(11, 20, 40, 0.4)',
              border: `1px solid ${task.completed ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 217, 255, 0.1)'}`,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => toggleExpanded(task.id)}
          >
            {/* Task Header */}
            <Group justify="space-between" align="center" mb={expandedTasks[task.id] ? 'sm' : 0}>
              <Group gap="sm" style={{ flex: 1 }}>
                <Checkbox
                  checked={task.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    onTaskToggle?.(task.id, !task.completed);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  styles={{
                    input: {
                      cursor: 'pointer',
                      borderColor: task.completed ? color : 'rgba(0, 217, 255, 0.3)',
                      backgroundColor: task.completed ? color : 'transparent',
                    },
                  }}
                />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text
                    fw={600}
                    style={{
                      color: task.completed ? 'rgba(255, 255, 255, 0.6)' : '#fff',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      fontSize: '0.95rem',
                    }}
                  >
                    {task.title}
                  </Text>
                  {task.badge && (
                    <Badge size="xs" color={task.badgeColor || 'gray'} variant="light">
                      {task.badge}
                    </Badge>
                  )}
                </Stack>
              </Group>
              {expandedTasks[task.id] ? '▼' : '▶'}
            </Group>

            {/* Task Description (Expandable) */}
            {expandedTasks[task.id] && showDescription && (
              <Stack gap="sm" pl="xl" pt="sm" style={{ borderTop: '1px solid rgba(0, 217, 255, 0.1)', marginTop: 'sm' }}>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                  {task.description}
                </Text>
                {task.cta && (
                  <Button
                    size="sm"
                    color="cyan"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      task.cta.action?.();
                    }}
                    style={{ width: 'fit-content' }}
                  >
                    {task.cta.label}
                  </Button>
                )}
              </Stack>
            )}
          </Card>
        ))}
      </Stack>
    </Card>
  );
}
