import { Container, Title, Card, Text, Stack, Button, Badge, Code, Group } from '@mantine/core';
import { useState, useEffect } from 'react';
import { clearErrorLog, getErrorLog } from '../platform-core';

export default function ErrorLogPage() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = () => {
    setErrors(getErrorLog());
  };

  const clearErrors = () => {
    clearErrorLog();
    setErrors([]);
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Error Log</Title>
        <Group>
          <Button onClick={loadErrors} variant="outline">Refresh</Button>
          <Button onClick={clearErrors} color="red">Clear All</Button>
        </Group>
      </Group>

      {errors.length === 0 ? (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">No errors logged</Text>
        </Card>
      ) : (
        <Stack gap="md">
          {errors.map((error, i) => (
            <Card key={i} withBorder p="md">
              <Group justify="space-between" mb="sm">
                <Group>
                  <Badge color="red">Error</Badge>
                  <Badge variant="outline">{error.button}</Badge>
                  <Badge variant="outline">{error.page}</Badge>
                </Group>
                <Text size="xs" c="dimmed">{new Date(error.timestamp).toLocaleString()}</Text>
              </Group>
              
              <Text fw={600} mb="xs">Message:</Text>
              <Code block mb="md">{error.error}</Code>
              
              {error.stack && (
                <>
                  <Text fw={600} mb="xs">Stack Trace:</Text>
                  <Code block style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}>
                    {error.stack}
                  </Code>
                </>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
