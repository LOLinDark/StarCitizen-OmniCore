import { Container, Title, Stack, Text, Tabs, Card, NumberInput, Button, Alert, Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, appendErrorLog, clearOmniCoreStorage, useSettingsStore } from '../platform-core';
import DevTag from '../components/DevTag';

export default function SettingsPage() {
  const navigate = useNavigate();
  const costThreshold = useSettingsStore((s) => s.costThreshold);
  const setCostThreshold = useSettingsStore((s) => s.setCostThreshold);
  const defaultAI = useSettingsStore((s) => s.defaultAI);
  const setDefaultAI = useSettingsStore((s) => s.setDefaultAI);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const [pricing, setPricing] = useState(null);
  const [calcModel, setCalcModel] = useState('sonnet-3.5');
  const [calcInput, setCalcInput] = useState(1000);
  const [calcOutput, setCalcOutput] = useState(1000);
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    apiGet('/api/pricing')
      .then((data) => setPricing(data))
      .catch((error) => {
        appendErrorLog({
          page: '/settings',
          button: 'loadPricing',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      });
  }, []);

  const calculateCost = async () => {
    try {
      setCalcResult(await apiPost('/api/pricing/calculate', { model: calcModel, inputTokens: calcInput, outputTokens: calcOutput }));
    } catch (error) {
      appendErrorLog({
        page: '/settings',
        button: 'calculateCost',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };
  return (
    <Container size="lg">
      <Title mb="md"><DevTag tag="ADM01" />Settings</Title>
      <Tabs defaultValue="aws">
        <Tabs.List>
          <Tabs.Tab value="aws">AWS & Costs</Tabs.Tab>
          <Tabs.Tab value="general">General</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="aws" pt="md">
          <Stack gap="xl">
            <Card withBorder>
              <Title order={3} mb="md">Cost Alert Threshold</Title>
              <Text size="sm" c="dimmed" mb="md">Get notified when total costs exceed this amount</Text>
              <NumberInput value={costThreshold} onChange={setCostThreshold} prefix="$" decimalScale={2} min={0} step={5} style={{ maxWidth: 200 }} />
            </Card>
            <Card withBorder>
              <Title order={3} mb="md">Pricing Calculator</Title>
              <Text size="sm" c="dimmed" mb="md">Estimate costs for AWS Bedrock Claude models</Text>
              {pricing && (
                <Stack gap="md">
                  <Select
                    value={calcModel}
                    onChange={setCalcModel}
                    data={Object.keys(pricing.pricing).map(m => ({ value: m, label: m }))}
                  />
                  <NumberInput label="Input Tokens" value={calcInput} onChange={setCalcInput} min={0} />
                  <NumberInput label="Output Tokens" value={calcOutput} onChange={setCalcOutput} min={0} />
                  <Button onClick={calculateCost}>Calculate Cost</Button>
                  {calcResult && (
                    <Alert color="blue" title="Estimated Cost">
                      ${calcResult.cost} for {calcResult.inputTokens} input + {calcResult.outputTokens} output tokens
                    </Alert>
                  )}
                  <Card bg="gray.0" p="sm">
                    <Text size="xs" fw={600} mb="xs">Current Pricing (per 1K tokens)</Text>
                    {Object.entries(pricing.pricing).map(([model, price]) => (
                      <Text key={model} size="xs">{model}: ${price.input} input / ${price.output} output</Text>
                    ))}
                  </Card>
                </Stack>
              )}
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="general" pt="md">
          <Stack gap="md">
            <Card withBorder>
              <Title order={3} mb="md">HOTAS</Title>
              <Text size="sm" c="dimmed" mb="md">
                Open HOTAS connection, live input, and configuration tools.
              </Text>
              <Button onClick={() => navigate('/settings/hotas')}>
                Open HOTAS Settings
              </Button>
            </Card>
            <Card withBorder>
              <Title order={3} mb="md">AI Provider</Title>
              <Text size="sm" c="dimmed" mb="md">Select the default AI provider for OMNI-CORE</Text>
              <Select
                value={defaultAI}
                onChange={(value) => value && setDefaultAI(value)}
                data={[
                  { value: 'gemini', label: 'Google Gemini (Free Tier)' },
                  { value: 'claude', label: 'AWS Claude (Requires Config)' }
                ]}
              />
            </Card>
            <Card withBorder>
              <Title order={3} mb="md">Data</Title>
              <Button color="red" variant="light" onClick={() => {
                if (confirm('Clear all local data? This cannot be undone.')) {
                  resetSettings();
                  clearOmniCoreStorage();
                  window.location.reload();
                }
              }}>Reset All Local Data</Button>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
