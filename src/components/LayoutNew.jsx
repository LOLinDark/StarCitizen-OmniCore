import { AppShell, NavLink, Badge, Button, Stack, Title, Indicator, Text, Divider, Alert, Switch, Group, Menu, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { apiGet, useAppStore, useSettingsStore } from '../platform-core';
import DevFooter from './DevFooter';
import DeveloperNotes from './DeveloperNotes';
import AerobookBar from './AerobookBar';
import BrandWordmark from './BrandWordmark';

const FRONTEND_VERSION = 'Alpha V0.1.0';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const { colorScheme, toggleColorScheme, devMode, toggleDevMode, logActivity, resetWelcome } = useAppStore();
  const { costThreshold } = useSettingsStore();

  const [serverOnline, setServerOnline] = useState(false);
  const [serverVersion, setServerVersion] = useState(null);
  const [usage, setUsage] = useState(null);
  const [projectHours, setProjectHours] = useState(0);
  const [rateLimitAlert, setRateLimitAlert] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const handleAIStart = () => setAiLoading(true);
    const handleAIEnd = () => setAiLoading(false);
    window.addEventListener('ai-request-start', handleAIStart);
    window.addEventListener('ai-request-end', handleAIEnd);
    return () => {
      window.removeEventListener('ai-request-start', handleAIStart);
      window.removeEventListener('ai-request-end', handleAIEnd);
    };
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      try {
        logActivity('API', 'GET /api/version');
        const data = await apiGet('/api/version');
        logActivity('DATA', `Server ${data.version} - ${data.projectHours}h`);
        setServerVersion(data.version);
        setProjectHours(data.projectHours || 0);
        setServerOnline(true);
      } catch {
        logActivity('ERROR', 'Server offline');
        setServerOnline(false);
      }
    };

    const checkUsage = async () => {
      try {
        setUsage(await apiGet('/api/usage'));
      } catch {
        setUsage(null);
      }
    };

    const checkRateLimits = async () => {
      try {
        const data = await apiGet('/api/rate-limits');
        if (data.hourly.percent >= 80 || data.daily.percent >= 80) {
          setRateLimitAlert({ type: data.hourly.percent >= 100 || data.daily.percent >= 100 ? 'error' : 'warning', hourly: data.hourly, daily: data.daily });
        } else {
          setRateLimitAlert(null);
        }
      } catch {
        setRateLimitAlert(null);
      }
    };

    checkServer();
    checkUsage();
    checkRateLimits();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkServer();
        checkUsage();
        checkRateLimits();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [logActivity]);

  const isActive = (route) => path === route || path.startsWith(route + '/');

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      aside={{ width: 220, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <BrandWordmark onClick={() => navigate('/')} size="1.25rem" color="#4cc9f0" />
            <Badge size="sm" variant="light">{FRONTEND_VERSION}</Badge>
            <Badge size="sm" variant="light" color="blue">📊 {projectHours}h</Badge>
            <Indicator color={aiLoading ? 'yellow' : 'green'} processing={aiLoading} size={8}>
              <Badge size="sm" variant="light" color={aiLoading ? 'yellow' : 'teal'}>
                {aiLoading ? '⚡' : '🤖'} AI
              </Badge>
            </Indicator>
          </Group>
          <Group gap="xs">
            <Button variant={path === '/' ? 'filled' : 'subtle'} color="cyan" component={Link} to="/">Dashboard</Button>
            <Menu>
              <Menu.Target>
                <Button variant={path.startsWith('/admin') ? 'filled' : 'subtle'}>Admin</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} to="/admin/chat/claude">Claude Chat</Menu.Item>
                <Menu.Item component={Link} to="/admin/chat/gemini">Gemini Chat</Menu.Item>
                <Menu.Item component={Link} to="/admin/ai-rules">AI Rules</Menu.Item>
                <Menu.Divider />
                <Menu.Item component={Link} to="/admin/analytics">Analytics</Menu.Item>
                <Menu.Item component={Link} to="/admin/rate-limits">Rate Limits</Menu.Item>
                <Menu.Item component={Link} to="/admin/history">Field History</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button variant={path.startsWith('/developer') ? 'filled' : 'subtle'} component={Link} to="/developer">Developer</Button>
            <Button variant="subtle" onClick={() => {
              resetWelcome();
              window.location.href = '/welcome';
            }}>Sign Out</Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={5} mb="md" c="dimmed" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>Navigation</Title>
        <Stack gap="xs">
          <NavLink label="Dashboard" active={path === '/'} component={Link} to="/" />
          <Divider my="xs" label="Admin Tools" labelPosition="center" />
          <NavLink label="Claude Chat" active={isActive('/admin/chat/claude')} component={Link} to="/admin/chat/claude" />
          <NavLink label="Gemini Chat" active={isActive('/admin/chat/gemini')} component={Link} to="/admin/chat/gemini" />
          <NavLink label="AI Rules" active={isActive('/admin/ai-rules')} component={Link} to="/admin/ai-rules" />
          <NavLink label="Analytics" active={isActive('/admin/analytics')} component={Link} to="/admin/analytics" />
          <NavLink label="Rate Limits" active={isActive('/admin/rate-limits')} component={Link} to="/admin/rate-limits" />
          <NavLink label="Field History" active={isActive('/admin/history')} component={Link} to="/admin/history" />
          <Divider my="xs" label="Config" labelPosition="center" />
          <NavLink label="Settings" active={path === '/settings'} component={Link} to="/settings" />
          <NavLink label="Theme" active={isActive('/settings/theme')} component={Link} to="/settings/theme" />
          <NavLink label="HOTAS" active={isActive('/settings/hotas')} component={Link} to="/settings/hotas" />
          <NavLink label="Error Log" active={isActive('/developer/errors')} component={Link} to="/developer/errors" />
          <NavLink label="Changes" active={isActive('/developer/changes')} component={Link} to="/developer/changes" />
          <NavLink label="About" active={isActive('/about')} component={Link} to="/about" />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Aside p="md">
        <Stack>
          <Group justify="space-between">
            <Title order={5}>Theme</Title>
            <Switch
              checked={colorScheme === 'dark'}
              onChange={toggleColorScheme}
              onLabel="🌙"
              offLabel="☀️"
            />
          </Group>
          <Divider />
          <Group justify="space-between">
            <Title order={5}>Dev Mode</Title>
            <Switch checked={devMode} onChange={toggleDevMode} onLabel="ON" offLabel="OFF" />
          </Group>
          <Divider />
          <Title order={5}>Server Status</Title>

          {serverVersion && serverVersion !== FRONTEND_VERSION && (
            <Alert color="orange" title="Version Mismatch" mb="sm">
              <Text size="xs">Backend: {serverVersion}</Text>
              <Text size="xs">Frontend: {FRONTEND_VERSION}</Text>
            </Alert>
          )}

          {usage && usage.totalCost >= costThreshold && (
            <Alert color="red" title="Cost Alert" mb="sm">
              <Text size="xs">${usage.totalCost.toFixed(2)} exceeds ${costThreshold.toFixed(2)}</Text>
            </Alert>
          )}

          {rateLimitAlert && (
            <Alert color={rateLimitAlert.type === 'error' ? 'red' : 'orange'} title="Rate Limit" mb="sm">
              <Text size="xs">Hourly: {rateLimitAlert.hourly.current}/{rateLimitAlert.hourly.limit}</Text>
              <Text size="xs">Daily: {rateLimitAlert.daily.current}/{rateLimitAlert.daily.limit}</Text>
            </Alert>
          )}

          <Indicator color={serverOnline ? 'green' : 'red'} processing={serverOnline}>
            <Text size="sm">{serverOnline ? 'Backend Online' : 'Backend Offline'}</Text>
          </Indicator>
          {serverVersion && <Text size="xs" c="dimmed">{serverVersion}</Text>}

          <Button onClick={async () => {
            try {
              const data = await apiGet('/api/usage');
              notifications.show({
                title: 'Usage Stats',
                message: `Requests: ${data.totalRequests} | Cost: $${data.totalCost?.toFixed(4) || '0.00'}`,
                color: 'cyan',
              });
            } catch {
              notifications.show({ title: 'Error', message: 'Server offline', color: 'red' });
            }
          }} color="blue" size="sm">View Usage</Button>
          <Button onClick={() => window.location.reload()} color="blue" size="sm">Reload</Button>
        </Stack>
      </AppShell.Aside>

      <AppShell.Main>
        <AerobookBar />
        <Container size="xl" py="md">
          <DeveloperNotes />
          <Outlet />
        </Container>
      </AppShell.Main>
      <DevFooter />
    </AppShell>
  );
}
