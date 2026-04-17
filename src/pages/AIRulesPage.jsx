import { Container, Title, Textarea, Button, Stack, Text, Card, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { readJsonStorage, writeJsonStorage } from '../platform-core';
import DevTag from '../components/DevTag';

const DEFAULT_RULES = {
  general: `You are an assistant for OMNI-CORE, a Star Citizen companion dashboard. Be concise, informative, and use in-verse terminology where appropriate.`,
  guides: `When generating guide content:\n- Use clear step-by-step instructions\n- Reference in-game locations and mechanics accurately\n- Include tips for new players`,
  formatting: `Format responses with:\n- Markdown headings for sections\n- Bullet points for lists\n- Bold for key terms`
};

export default function AIRulesPage() {
  const [rules, setRules] = useState(() => {
    return readJsonStorage('aiRules', DEFAULT_RULES);
  });

  const handleSave = () => {
    writeJsonStorage('aiRules', rules);
    notifications.show({ title: 'Saved', message: 'AI Rules saved', color: 'green' });
  };

  const handleReset = () => {
    if (confirm('Reset to default rules?')) {
      setRules(DEFAULT_RULES);
      writeJsonStorage('aiRules', DEFAULT_RULES);
    }
  };

  return (
    <Container size="lg">
      <Title mb="md"><DevTag tag="ADM03" />AI Rules Configuration</Title>
      <Text size="sm" c="dimmed" mb="lg">
        Configure the system instructions sent to AI models across OMNI-CORE.
      </Text>
      <Stack gap="lg">
        <Card withBorder p="lg">
          <Title order={4} mb="sm">General System Prompt</Title>
          <Textarea value={rules.general} onChange={(e) => setRules({ ...rules, general: e.target.value })} minRows={3} />
        </Card>
        <Card withBorder p="lg">
          <Title order={4} mb="sm">Guide Generation Rules</Title>
          <Textarea value={rules.guides} onChange={(e) => setRules({ ...rules, guides: e.target.value })} minRows={4} />
        </Card>
        <Card withBorder p="lg">
          <Title order={4} mb="sm">Formatting Rules</Title>
          <Textarea value={rules.formatting} onChange={(e) => setRules({ ...rules, formatting: e.target.value })} minRows={4} />
        </Card>
        <Group justify="space-between">
          <Button onClick={handleReset} color="red" variant="light">Reset to Defaults</Button>
          <Button onClick={handleSave}>Save Rules</Button>
        </Group>
      </Stack>
    </Container>
  );
}
