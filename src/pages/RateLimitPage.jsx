import { Container, Title, Card, Text, Stack, Group, Badge, Progress, Alert, Timeline } from '@mantine/core';
import { useState, useEffect } from 'react';
import { apiGet, appendErrorLog } from '../platform-core';
import DevTag from '../components/DevTag';

export default function RateLimitPage() {
  const [limits, setLimits] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const data = await apiGet('/api/rate-limits');
        setLimits(data);

        if (data.hourly.percent >= 80 || data.daily.percent >= 80) {
          setNotification({
            type: data.hourly.percent >= 100 || data.daily.percent >= 100 ? 'error' : 'warning',
            message: data.hourly.percent >= 100 || data.daily.percent >= 100
              ? 'Rate limit reached! API calls are blocked.'
              : 'Warning: Approaching rate limit threshold'
          });
        } else {
          setNotification(null);
        }
      } catch (error) {
        appendErrorLog({
          page: '/admin/rate-limits',
          button: 'fetchLimits',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    fetchLimits();
    const interval = setInterval(fetchLimits, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!limits) return <Container><Text>Loading...</Text></Container>;

  const hourlyColor = limits.hourly.percent >= 100 ? 'red' : limits.hourly.percent >= 80 ? 'orange' : 'green';
  const dailyColor = limits.daily.percent >= 100 ? 'red' : limits.daily.percent >= 80 ? 'orange' : 'green';

  return (
    <Container size="lg">
      <Title mb="md"><DevTag tag="ADM07" />Rate Limit Monitor</Title>
      
      {notification && (
        <Alert color={notification.type === 'error' ? 'red' : 'orange'} mb="md" title={notification.type === 'error' ? 'Blocked' : 'Warning'}>
          {notification.message}
        </Alert>
      )}
      
      <Stack gap="md">
        <Card withBorder>
          <Title order={3} mb="md">Hourly Limit</Title>
          <Group justify="space-between" mb="xs">
            <Text size="sm">{limits.hourly.current} / {limits.hourly.limit} requests</Text>
            <Badge color={hourlyColor}>{limits.hourly.percent}%</Badge>
          </Group>
          <Progress value={parseFloat(limits.hourly.percent)} color={hourlyColor} size="xl" />
          <Text size="xs" c="dimmed" mt="xs">Resets: {new Date(limits.lastHourReset).toLocaleTimeString()}</Text>
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Daily Limit</Title>
          <Group justify="space-between" mb="xs">
            <Text size="sm">{limits.daily.current} / {limits.daily.limit} requests</Text>
            <Badge color={dailyColor}>{limits.daily.percent}%</Badge>
          </Group>
          <Progress value={parseFloat(limits.daily.percent)} color={dailyColor} size="xl" />
          <Text size="xs" c="dimmed" mt="xs">Resets: {new Date(limits.lastReset).toLocaleDateString()}</Text>
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Recent Activity</Title>
          <Timeline>
            {limits.history.slice(-10).reverse().map((entry, i) => (
              <Timeline.Item key={i} title={new Date(entry.timestamp).toLocaleTimeString()}>
                <Text size="xs">Hourly: {entry.hourly} | Daily: {entry.daily}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </Stack>
    </Container>
  );
}
