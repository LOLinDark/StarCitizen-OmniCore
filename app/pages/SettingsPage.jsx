import { Container, Stack, Text, Tabs, Card, NumberInput, Button, Alert, Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, appendErrorLog, clearOmniCoreStorage, useSettingsStore } from '../platform-core';
import { SciFiFrame } from '../components/ui';
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
    <Container size="xl" py="xl">
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="scifi-heading" style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>
          <DevTag tag="ADM01" />Settings
        </h1>
        <Text c="dimmed" size="sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Configure your OMNI-CORE experience
        </Text>
      </div>

      <Tabs defaultValue="general" color="cyan">
        <Tabs.List style={{ borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="aws">AWS & Costs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="xl">
          <Stack gap="lg">
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Provider
                </h2>
                <Text size="sm" c="dimmed" mb="md">
                  Select the default AI provider for OMNI-CORE
                </Text>
                <Select
                  label="Provider"
                  value={defaultAI}
                  onChange={(value) => value && setDefaultAI(value)}
                  data={[
                    { value: 'gemini', label: 'Google Gemini (Free Tier)' },
                    { value: 'claude', label: 'AWS Claude (Requires Config)' }
                  ]}
                  placeholder="Select a provider"
                  searchable
                />
              </div>
            </SciFiFrame>

            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  HOTAS
                </h2>
                <Text size="sm" c="dimmed" mb="md">
                  Configure your flight controls and input devices.
                </Text>
                <Button color="cyan" variant="light" onClick={() => navigate('/settings/hotas')}>
                  Open HOTAS Settings
                </Button>
              </div>
            </SciFiFrame>

            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ color: '#ff0055', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Danger Zone
                </h2>
                <Text size="sm" c="dimmed" mb="md">
                  Reset all local data and preferences.
                </Text>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => {
                    if (confirm('Clear all local data? This cannot be undone.')) {
                      resetSettings();
                      clearOmniCoreStorage();
                      window.location.reload();
                    }
                  }}
                >
                  Reset All Local Data
                </Button>
              </div>
            </SciFiFrame>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="aws" pt="xl">
          <Stack gap="lg">
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ color: '#b300ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cost Alert Threshold
                </h2>
                <Text size="sm" c="dimmed" mb="md">
                  Get notified when total costs exceed this amount
                </Text>
                <NumberInput
                  value={costThreshold}
                  onChange={setCostThreshold}
                  prefix="$"
                  decimalScale={2}
                  min={0}
                  step={5}
                  style={{ maxWidth: 200 }}
                />
              </div>
            </SciFiFrame>

            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ color: '#b300ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pricing Calculator
                </h2>
                <Text size="sm" c="dimmed" mb="md">
                  Estimate costs for AWS Bedrock Claude models
                </Text>
                {pricing ? (
                  <Stack gap="md">
                    <Select
                      label="Model"
                      value={calcModel}
                      onChange={(value) => value && setCalcModel(value)}
                      data={Object.keys(pricing.pricing).map(m => ({ value: m, label: m }))}
                      placeholder="Select a model"
                      searchable
                    />
                    <NumberInput
                      label="Input Tokens"
                      value={calcInput}
                      onChange={(val) => setCalcInput(val || 0)}
                      min={0}
                    />
                    <NumberInput
                      label="Output Tokens"
                      value={calcOutput}
                      onChange={(val) => setCalcOutput(val || 0)}
                      min={0}
                    />
                    <Button onClick={calculateCost} color="cyan" variant="light">
                      Calculate Cost
                    </Button>
                    {calcResult && (
                      <Alert color="cyan" title="Estimated Cost" variant="light">
                        ${calcResult.cost} for {calcResult.inputTokens} input + {calcResult.outputTokens} output tokens
                      </Alert>
                    )}
                    <Card withBorder style={{ background: 'rgba(0, 217, 255, 0.05)', borderColor: 'rgba(0, 217, 255, 0.2)' }} p="sm">
                      <Text size="xs" fw={600} mb="xs" style={{ color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Current Pricing (per 1K tokens)
                      </Text>
                      {Object.entries(pricing.pricing).map(([model, price]) => (
                        <Text key={model} size="xs" c="dimmed">
                          {model}: ${price.input} input / ${price.output} output
                        </Text>
                      ))}
                    </Card>
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">Loading pricing data...</Text>
                )}
              </div>
            </SciFiFrame>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
