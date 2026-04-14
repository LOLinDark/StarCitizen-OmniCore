import { Container, Title, Card, Text, Stack, Group, Badge, Progress } from '@mantine/core';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [usage, setUsage] = useState(null);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, pricingRes] = await Promise.all([
          fetch('http://localhost:3001/api/usage'),
          fetch('http://localhost:3001/api/pricing')
        ]);
        
        if (usageRes.ok) setUsage(await usageRes.json());
        if (pricingRes.ok) setPricing(await pricingRes.json());
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    
    fetchData();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  if (!usage || !pricing) return <Container><Text>Loading...</Text></Container>;

  const costThreshold = pricing.threshold;
  const costPercent = (usage.totalCost / costThreshold) * 100;

  return (
    <Container size="lg">
      <Title mb="md">Analytics Dashboard</Title>
      
      <Stack gap="md">
        <Card withBorder>
          <Title order={3} mb="md">Usage Overview</Title>
          <Group grow>
            <div>
              <Text size="sm" c="dimmed">Total Requests</Text>
              <Text size="xl" fw={700}>{usage.totalRequests}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Total Tokens</Text>
              <Text size="xl" fw={700}>{usage.totalTokens.toLocaleString()}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Total Cost</Text>
              <Text size="xl" fw={700} c={costPercent > 100 ? 'red' : 'green'}>
                ${usage.totalCost.toFixed(4)}
              </Text>
            </div>
          </Group>
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Cost Tracking</Title>
          <Text size="sm" c="dimmed" mb="xs">
            ${usage.totalCost.toFixed(2)} / ${costThreshold.toFixed(2)} ({costPercent.toFixed(1)}%)
          </Text>
          <Progress 
            value={costPercent} 
            color={costPercent > 100 ? 'red' : costPercent > 75 ? 'orange' : 'green'}
            size="xl"
          />
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Requests by Model</Title>
          <Stack gap="xs">
            {Object.entries(usage.requestsByModel).map(([model, count]) => (
              <Group key={model} justify="space-between">
                <Text size="sm">{model}</Text>
                <Badge>{count} requests</Badge>
              </Group>
            ))}
          </Stack>
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Pricing (per 1K tokens)</Title>
          <Stack gap="xs">
            {Object.entries(pricing.pricing).map(([model, price]) => (
              <Group key={model} justify="space-between">
                <Text size="sm">{model}</Text>
                <Group gap="xs">
                  <Badge color="blue">${price.input} in</Badge>
                  <Badge color="green">${price.output} out</Badge>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>

        {usage.lastRequest && (
          <Card withBorder>
            <Text size="sm" c="dimmed">Last Request</Text>
            <Text>{new Date(usage.lastRequest).toLocaleString()}</Text>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
