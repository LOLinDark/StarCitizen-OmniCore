import { Container, Title, Timeline, Text, Badge, Paper, Stack } from '@mantine/core';
import DevTag from '../components/DevTag';

export default function ChangesPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl"><DevTag tag="DEV05" />Changelog</Title>
      <Timeline active={0} bulletSize={24} lineWidth={2}>
        <Timeline.Item title="v0.1.0" bullet={<Badge size="sm">Latest</Badge>}>
          <Text c="dimmed" size="sm">Initial OMNI-CORE Setup</Text>
          <Paper p="md" mt="sm" withBorder>
            <Stack gap="xs">
              <Text size="sm"><strong>Foundation:</strong></Text>
              <Text size="sm">• Project rebranded from NurseryHub boilerplate to OMNI-CORE</Text>
              <Text size="sm">• Stripped all nursery-specific pages and data</Text>
              <Text size="sm">• Deep space theme (cyan/dark) replacing pink nursery theme</Text>
              <Text size="sm">• OMNI-CORE splash/loading screen</Text>
              <Text size="sm">• Dashboard placeholder with Phase 1-2 feature cards</Text>
              <Text size="sm">• About page with project info and CIG disclaimer</Text>
              <Text size="sm" mt="xs"><strong>Retained Infrastructure:</strong></Text>
              <Text size="sm">• Express backend with Gemini + AWS Bedrock integration</Text>
              <Text size="sm">• Rate limiting, cost tracking, analytics</Text>
              <Text size="sm">• Claude and Gemini chat interfaces (admin tools)</Text>
              <Text size="sm">• AI Rules configuration</Text>
              <Text size="sm">• Dev mode with activity monitor</Text>
              <Text size="sm">• Theme customizer, error logging, field history</Text>
              <Text size="sm">• PWA manifest rebranded for OMNI-CORE</Text>
            </Stack>
          </Paper>
        </Timeline.Item>
      </Timeline>
    </Container>
  );
}
