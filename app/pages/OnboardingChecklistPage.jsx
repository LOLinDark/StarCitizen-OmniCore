import { Container, Stack, Text, Button, Group, Badge, Progress, Alert, SimpleGrid } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SciFiBackground from '../components/ui/SciFiBackground';
import SciFiFrame from '../components/ui/SciFiFrame';
import ChecklistSection from '../components/ChecklistSection';
import { onboardingChecklist, getTotalTaskCount } from '../data/onboardingChecklist';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import DevTag from '../components/DevTag';

export default function OnboardingChecklistPage() {
  const navigate = useNavigate();
  const { completedTasks, toggleTask, visitSection, getProgress, completeOnboarding, onboardingCompleted } =
    useOnboardingStore();

  useEffect(() => {
    // Mark page as visited
    onboardingChecklist.forEach(section => visitSection(section.id));
  }, [visitSection]);

  const totalTasks = getTotalTaskCount();
  const progress = getProgress(totalTasks);

  // Merge store state with static data
  const sectionsWithState = useMemo(() => {
    return onboardingChecklist.map(section => ({
      ...section,
      tasks: section.tasks.map(task => ({
        ...task,
        completed: completedTasks[task.id] || false,
      })),
    }));
  }, [completedTasks]);

  const handleTaskToggle = (taskId, completed) => {
    toggleTask(taskId, completed);
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <>
      <SciFiBackground />
      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Stack gap="xl">
          {/* Header */}
          <SciFiFrame variant="corners" color="cyan">
            <Stack gap="md" p="lg">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                  <Text
                    size="xl"
                    fw={700}
                    style={{
                      color: '#00d9ff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    <DevTag tag="APP03" />🚀 Welcome to the Verse
                  </Text>
                  <Text size="sm" c="dimmed">
                    Complete this orientation checklist to get the most out of your Star Citizen journey. Each section builds on the last.
                  </Text>
                </Stack>
                <Badge
                  size="lg"
                  color="cyan"
                  variant="light"
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.75rem 1rem',
                  }}
                >
                  {Object.values(completedTasks).filter(Boolean).length}/{totalTasks}
                </Badge>
              </Group>

              {/* Overall Progress */}
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    Overall Progress
                  </Text>
                  <Text size="sm" c="dimmed">
                    {progress}%
                  </Text>
                </Group>
                <Progress value={progress} color="cyan" radius="sm" style={{ height: '8px' }} />
              </Stack>
            </Stack>
          </SciFiFrame>

          {/* Info Alert */}
          <Alert
            icon="ℹ️"
            title="Take Your Time"
            color="blue"
            style={{
              backgroundColor: 'rgba(0, 191, 255, 0.05)',
              borderColor: 'rgba(0, 191, 255, 0.2)',
            }}
          >
            <Text size="sm">
              This is optional and designed to help you get oriented. You can skip items and come back later. Some tasks open external links—new players recommend having multiple tabs open to learn while staying in the game.
            </Text>
          </Alert>

          {/* Completion Alert */}
          {onboardingCompleted && (
            <Alert
              icon="✅"
              title="Onboarding Complete!"
              color="green"
              style={{
                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                borderColor: 'rgba(0, 255, 136, 0.2)',
              }}
            >
              <Text size="sm">
                You're all set! You can now access the full dashboard. Feel free to continue here or head to the main dashboard to explore tools and resources.
              </Text>
            </Alert>
          )}

          {/* Checklists */}
          <Stack gap="lg">
            {sectionsWithState.map((section) => (
              <ChecklistSection
                key={section.id}
                icon={section.icon}
                title={section.title}
                subtitle={section.subtitle}
                color={section.color}
                tasks={section.tasks}
                onTaskToggle={handleTaskToggle}
                showDescription={true}
              />
            ))}
          </Stack>

          {/* Bottom Action */}
          <Group justify="center" gap="md" py="lg">
            <Button
              size="lg"
              color="cyan"
              variant="outline"
              onClick={() => navigate('/')}
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              ← Back to Dashboard
            </Button>
            {progress >= 50 && (
              <Button
                size="lg"
                color="cyan"
                onClick={handleCompleteOnboarding}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                Mark Complete & Continue →
              </Button>
            )}
          </Group>

          {/* Footer Note */}
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              borderTop: '1px solid rgba(0, 217, 255, 0.2)',
              marginTop: '1rem',
            }}
          >
            <Text size="xs" c="dimmed">
              💡 Tip: Share your progress with friends or your org to compare notes and help each other along the way.
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              🎁 Complete the full checklist and earn special recognition in future phases. More features coming soon!
            </Text>
          </div>
        </Stack>
      </Container>
    </>
  );
}
