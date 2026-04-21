import { Container, Stack, Button, TextInput, Group, Text, Badge, Card, Code, Tabs, Loader, Center, CopyButton, ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { SciFiFrame } from '../components/ui';
import DevTag from '../components/DevTag';

export default function APITestPage() {
  const [citizenHandle, setCitizenHandle] = useState('LOLinDark');
  const [citizenData, setCitizenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geminiMessage, setGeminiMessage] = useState('What are the best ships for bounty hunting?');
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // Test Star Citizen API
  const testCitizenAPI = async () => {
    setLoading(true);
    setError(null);
    setCitizenData(null);
    
    try {
      const response = await fetch(`/api/citizen/${citizenHandle}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setCitizenData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test Gemini API
  const testGeminiAPI = async () => {
    setGeminiLoading(true);
    setError(null);
    setGeminiResponse(null);
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: geminiMessage }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setGeminiResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGeminiLoading(false);
    }
  };

  // Get Rate Limits
  const [rateLimits, setRateLimits] = useState(null);
  const fetchRateLimits = async () => {
    try {
      const response = await fetch('/api/rate-limits');
      const data = await response.json();
      setRateLimits(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}><DevTag tag="DEV03" />🧪 API Test Suite</h1>
          <Text c="dimmed">Test all external and internal APIs</Text>
        </div>

        {/* Error Display */}
        {error && (
          <Card bg="red" style={{ border: '1px solid #ff0055' }}>
            <Stack gap="xs">
              <Text fw={700} c="white">⚠️ Error</Text>
              <Code block style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
                {error}
              </Code>
            </Stack>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="citizen" variant="outline" color="cyan">
          {/* Tab 1: Star Citizen API */}
          <Tabs.List>
            <Tabs.Tab value="citizen">Star Citizen API</Tabs.Tab>
            <Tabs.Tab value="gemini">Gemini AI</Tabs.Tab>
            <Tabs.Tab value="limits">Rate Limits</Tabs.Tab>
            <Tabs.Tab value="docs">Docs</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="citizen" pt="xl">
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1} padding={2}>
              <Stack gap="lg">
                <div>
                  <Text fw={700} mb="xs">Citizen Profile Lookup</Text>
                  <Text size="sm" c="dimmed">Fetch RSI citizen data by handle</Text>
                </div>

                <Group>
                  <TextInput
                    placeholder="Enter RSI handle (e.g., LOLinDark)"
                    value={citizenHandle}
                    onChange={(e) => setCitizenHandle(e.currentTarget.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <Button
                    onClick={testCitizenAPI}
                    loading={loading}
                    color="cyan"
                    variant="outline"
                  >
                    Lookup
                  </Button>
                </Group>

                {/* Results */}
                {loading && (
                  <Center py="xl">
                    <Loader color="cyan" />
                  </Center>
                )}

                {citizenData && (
                  <Stack gap="md">
                    <Badge color="green">✓ Success</Badge>

                    {/* Profile Card */}
                    <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <div>
                            <Text fw={700} size="lg">{citizenData.profile?.displayName || citizenData.profile?.handle}</Text>
                            <Text size="sm" c="dimmed">@{citizenData.profile?.handle}</Text>
                          </div>
                          {citizenData.profile?.avatar && (
                            <img
                              src={citizenData.profile.avatar}
                              alt="Avatar"
                              style={{ width: 60, height: 60, borderRadius: '50%' }}
                            />
                          )}
                        </Group>

                        <div style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '1rem' }}>
                          <Text fw={600} mb="xs">Details</Text>
                          <Stack gap="xs" style={{ fontSize: '0.9rem' }}>
                            <Group justify="space-between">
                              <Text>Enlisted:</Text>
                              <Text c="cyan">
                                {new Date(citizenData.profile?.enlisted).toLocaleDateString()}
                              </Text>
                            </Group>
                            {citizenData.profile?.location && (
                              <Group justify="space-between">
                                <Text>Location:</Text>
                                <Text c="cyan">
                                  {citizenData.profile.location.country}
                                  {citizenData.profile.location.region ? `, ${citizenData.profile.location.region}` : ''}
                                </Text>
                              </Group>
                            )}
                            {citizenData.organization && (
                              <Group justify="space-between">
                                <Text>Organization:</Text>
                                <Text c="cyan">{citizenData.organization.name}</Text>
                              </Group>
                            )}
                          </Stack>
                        </div>

                        {citizenData.profile?.bio && (
                          <div style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '1rem' }}>
                            <Text fw={600} mb="xs">Bio</Text>
                            <Text size="sm" style={{ fontStyle: 'italic' }}>
                              {citizenData.profile.bio}
                            </Text>
                          </div>
                        )}

                        {citizenData.profile?.website && (
                          <Group>
                            <Button
                              size="xs"
                              variant="subtle"
                              component="a"
                              href={citizenData.profile.website}
                              target="_blank"
                            >
                              Visit Website
                            </Button>
                          </Group>
                        )}
                      </Stack>
                    </Card>

                    {/* Raw JSON */}
                    <div>
                      <Text fw={600} mb="xs">Raw Response</Text>
                      <Code block style={{ maxHeight: 300, overflow: 'auto', fontSize: '0.75rem' }}>
                        {JSON.stringify(citizenData, null, 2)}
                      </Code>
                    </div>
                  </Stack>
                )}
              </Stack>
            </SciFiFrame>
          </Tabs.Panel>

          {/* Tab 2: Gemini AI */}
          <Tabs.Panel value="gemini" pt="xl">
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1} padding={2}>
              <Stack gap="lg">
                <div>
                  <Text fw={700} mb="xs">Gemini AI Chat</Text>
                  <Text size="sm" c="dimmed">Test AI-powered responses</Text>
                </div>

                <TextInput
                  placeholder="Enter your message..."
                  value={geminiMessage}
                  onChange={(e) => setGeminiMessage(e.currentTarget.value)}
                  disabled={geminiLoading}
                  multiline
                  rows={3}
                />

                <Button
                  onClick={testGeminiAPI}
                  loading={geminiLoading}
                  color="cyan"
                  variant="outline"
                >
                  Send
                </Button>

                {geminiLoading && (
                  <Center py="xl">
                    <Loader color="cyan" />
                  </Center>
                )}

                {geminiResponse && (
                  <Stack gap="md">
                    <Badge color="green">✓ Success</Badge>
                    <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                      <Stack gap="md">
                        <div>
                          <Text fw={600} mb="xs">Response</Text>
                          <Text size="sm">{geminiResponse.response || geminiResponse.message}</Text>
                        </div>

                        {geminiResponse.usage && (
                          <div style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '1rem' }}>
                            <Text fw={600} mb="xs">Usage</Text>
                            <Group gap="md">
                              <Badge size="lg">
                                Input: {geminiResponse.usage.inputTokens} tokens
                              </Badge>
                              <Badge size="lg" color="yellow">
                                Output: {geminiResponse.usage.outputTokens} tokens
                              </Badge>
                            </Group>
                          </div>
                        )}
                      </Stack>
                    </Card>

                    {/* Raw JSON */}
                    <div>
                      <Text fw={600} mb="xs">Raw Response</Text>
                      <Code block style={{ maxHeight: 300, overflow: 'auto', fontSize: '0.75rem' }}>
                        {JSON.stringify(geminiResponse, null, 2)}
                      </Code>
                    </div>
                  </Stack>
                )}
              </Stack>
            </SciFiFrame>
          </Tabs.Panel>

          {/* Tab 3: Rate Limits */}
          <Tabs.Panel value="limits" pt="xl">
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1} padding={2}>
              <Stack gap="lg">
                <div>
                  <Text fw={700} mb="xs">Rate Limiting</Text>
                  <Text size="sm" c="dimmed">Current API usage and limits</Text>
                </div>

                <Button
                  onClick={fetchRateLimits}
                  color="cyan"
                  variant="outline"
                >
                  Fetch Limits
                </Button>

                {rateLimits && (
                  <Stack gap="md">
                    <Badge color="green">✓ Retrieved</Badge>

                    <Group gap="xl">
                      <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)', flex: 1 }}>
                        <Stack gap="sm">
                          <Text fw={700} size="sm">Hourly Limit</Text>
                          <Group justify="space-between">
                            <Text>{rateLimits.hourly?.current || 0}/{rateLimits.hourly?.limit || 'N/A'}</Text>
                            <Badge>{rateLimits.hourly?.percent || 0}%</Badge>
                          </Group>
                          <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${rateLimits.hourly?.percent || 0}%`,
                                background: rateLimits.hourly?.percent > 80 ? '#ff0055' : '#00d9ff',
                                transition: 'all 0.3s ease',
                              }}
                            />
                          </div>
                        </Stack>
                      </Card>

                      <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)', flex: 1 }}>
                        <Stack gap="sm">
                          <Text fw={700} size="sm">Daily Limit</Text>
                          <Group justify="space-between">
                            <Text>{rateLimits.daily?.current || 0}/{rateLimits.daily?.limit || 'N/A'}</Text>
                            <Badge>{rateLimits.daily?.percent || 0}%</Badge>
                          </Group>
                          <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${rateLimits.daily?.percent || 0}%`,
                                background: rateLimits.daily?.percent > 80 ? '#ff0055' : '#00d9ff',
                                transition: 'all 0.3s ease',
                              }}
                            />
                          </div>
                        </Stack>
                      </Card>
                    </Group>

                    {/* Raw JSON */}
                    <div>
                      <Text fw={600} mb="xs">Raw Response</Text>
                      <Code block style={{ maxHeight: 300, overflow: 'auto', fontSize: '0.75rem' }}>
                        {JSON.stringify(rateLimits, null, 2)}
                      </Code>
                    </div>
                  </Stack>
                )}
              </Stack>
            </SciFiFrame>
          </Tabs.Panel>

          {/* Tab 4: Docs */}
          <Tabs.Panel value="docs" pt="xl">
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1} padding={2}>
              <Stack gap="lg">
                <div>
                  <Text fw={700} mb="xs">📖 API Documentation</Text>
                  <Text size="sm" c="dimmed">Reference and guides</Text>
                </div>

                <Stack gap="md">
                  <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <div>
                          <Text fw={700}>API Integration Guide</Text>
                          <Text size="sm" c="dimmed">Full documentation with examples</Text>
                        </div>
                        <Button
                          size="xs"
                          variant="outline"
                          component="a"
                          href="/docs/API-INTEGRATION.md"
                          target="_blank"
                        >
                          View
                        </Button>
                      </Group>
                    </Stack>
                  </Card>

                  <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                    <Stack gap="sm">
                      <Text fw={700}>Available Endpoints</Text>
                      <Group gap="xs" wrap="wrap">
                        <Badge>GET /api/citizen/:handle</Badge>
                        <Badge>POST /api/gemini</Badge>
                        <Badge>GET /api/rate-limits</Badge>
                        <Badge>GET /api/usage</Badge>
                      </Group>
                    </Stack>
                  </Card>

                  <Card bg="rgba(0, 217, 255, 0.05)" style={{ border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                    <Stack gap="sm">
                      <Text fw={700}>Environment Setup</Text>
                      <Code block>RSI_API_KEY=3z53rRXaw5a8nKUirs1mvwWE5bzdisle</Code>
                      <Text size="xs" c="dimmed">Key is already configured in .env</Text>
                    </Stack>
                  </Card>
                </Stack>
              </Stack>
            </SciFiFrame>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
