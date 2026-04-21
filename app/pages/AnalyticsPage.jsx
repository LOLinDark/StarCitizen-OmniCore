import { Container, Title, Card, Text, Stack, Group, Badge, Progress } from '@mantine/core';
import { useState, useEffect } from 'react';
import {
  analytics,
  apiGet,
  assessRuntimeReadiness,
  appendErrorLog,
  buildRuntimeReport,
  buildSupportBundle,
  copyRuntimeReport,
  downloadRuntimeReport,
  getErrorLog,
  getPerformanceSnapshot
} from '../platform-core';
import DevTag from '../components/DevTag';

export default function AnalyticsPage() {
  const [usage, setUsage] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [telemetrySnapshot, setTelemetrySnapshot] = useState(() => analytics.getSnapshot());
  const [performanceSnapshot, setPerformanceSnapshot] = useState(() => getPerformanceSnapshot());
  const [reportStatus, setReportStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageData, pricingData] = await Promise.all([
          apiGet('/api/usage'),
          apiGet('/api/pricing')
        ]);
        const analyticsData = await apiGet('/api/analytics/summary').catch(() => null);

        setUsage(usageData);
        setPricing(pricingData);
        setAnalyticsSummary(analyticsData);
        setTelemetrySnapshot(analytics.getSnapshot());
        setPerformanceSnapshot(getPerformanceSnapshot());
      } catch (error) {
        appendErrorLog({
          page: '/admin/analytics',
          button: 'fetchData',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
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
  const readiness = assessRuntimeReadiness({
    usage,
    pricing,
    telemetry: telemetrySnapshot,
    performance: performanceSnapshot,
    analyticsSummary
  });
  const runtimeReport = buildRuntimeReport({
    usage,
    pricing,
    telemetry: telemetrySnapshot,
    performance: performanceSnapshot,
    analyticsSummary,
    route: '/admin/analytics'
  });
  const supportBundle = buildSupportBundle({
    runtimeReport,
    errors: getErrorLog()
  });

  async function onCopyReport() {
    try {
      await copyRuntimeReport(runtimeReport);
      setReportStatus('Runtime report copied to clipboard.');
    } catch (error) {
      appendErrorLog({
        page: '/admin/analytics',
        button: 'copyReport',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setReportStatus('Clipboard copy failed.');
    }
  }

  function onDownloadReport() {
    downloadRuntimeReport(runtimeReport);
    setReportStatus('Runtime report downloaded.');
  }

  function onDownloadSupportBundle() {
    downloadRuntimeReport(supportBundle, 'omni-core-support-bundle');
    setReportStatus('Support bundle downloaded.');
  }

  return (
    <Container size="lg">
      <Title mb="md"><DevTag tag="ADM04" />Analytics Dashboard</Title>
      
      <Stack gap="md">
        <Card withBorder>
          <Title order={3} mb="md">Runtime Readiness</Title>
          <Group mb="md">
            <Badge color={readiness.level === 'ready' ? 'teal' : readiness.level === 'warning' ? 'orange' : 'red'}>
              {readiness.level.toUpperCase()}
            </Badge>
            <Text>{readiness.summary}</Text>
          </Group>
          {readiness.blockers.length > 0 && (
            <Stack gap="xs" mb="sm">
              {readiness.blockers.map((item) => (
                <Text key={item} c="red">{item}</Text>
              ))}
            </Stack>
          )}
          {readiness.warnings.length > 0 && (
            <Stack gap="xs">
              {readiness.warnings.map((item) => (
                <Text key={item} c="orange">{item}</Text>
              ))}
            </Stack>
          )}
        </Card>

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
          <Title order={3} mb="md">Frontend Telemetry</Title>
          <Group grow>
            <div>
              <Text size="sm" c="dimmed">Analytics Queue</Text>
              <Text size="xl" fw={700}>{telemetrySnapshot.queueLength}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Sent Events</Text>
              <Text size="xl" fw={700}>{telemetrySnapshot.sentCount}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Dropped Events</Text>
              <Text size="xl" fw={700}>{telemetrySnapshot.droppedCount}</Text>
            </div>
          </Group>
          <Group mt="md" gap="xs">
            <Badge color={telemetrySnapshot.endpointConfigured ? 'teal' : 'gray'}>
              {telemetrySnapshot.endpointConfigured ? 'Endpoint configured' : 'Endpoint disabled'}
            </Badge>
            <Badge variant="outline">{telemetrySnapshot.appId}</Badge>
          </Group>
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Runtime Report</Title>
          <Text size="sm" c="dimmed" mb="md">
            Export a snapshot of client telemetry, server usage, pricing, and web vitals for review or support.
          </Text>
          <Group>
            <Badge color={analyticsSummary ? 'teal' : 'gray'}>
              {analyticsSummary ? `${analyticsSummary.totalEvents || 0} analytics events tracked` : 'Server analytics unavailable'}
            </Badge>
            <Badge variant="outline">Route /admin/analytics</Badge>
          </Group>
          <Group mt="md">
            <button type="button" onClick={onDownloadReport}>Download Report</button>
            <button type="button" onClick={onCopyReport}>Copy JSON</button>
            <button type="button" onClick={onDownloadSupportBundle}>Support Bundle</button>
          </Group>
          {reportStatus && <Text size="sm" mt="md">{reportStatus}</Text>}
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Web Vitals</Title>
          <Group grow>
            <div>
              <Text size="sm" c="dimmed">Monitoring</Text>
              <Text size="xl" fw={700}>{performanceSnapshot.started ? 'On' : 'Off'}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Samples</Text>
              <Text size="xl" fw={700}>{performanceSnapshot.samples}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Metrics</Text>
              <Text size="xl" fw={700}>{Object.keys(performanceSnapshot.metrics).length}</Text>
            </div>
          </Group>
        </Card>

        {analyticsSummary && (
          <Card withBorder>
            <Title order={3} mb="md">Server Analytics Summary</Title>
            <Group grow>
              <div>
                <Text size="sm" c="dimmed">Tracked Events</Text>
                <Text size="xl" fw={700}>{analyticsSummary.totalEvents || 0}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Last Event</Text>
                <Text size="xl" fw={700}>{analyticsSummary.lastEventAt ? 'Seen' : 'None'}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Event Types</Text>
                <Text size="xl" fw={700}>{Object.keys(analyticsSummary.eventsByName || {}).length}</Text>
              </div>
            </Group>
          </Card>
        )}

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
