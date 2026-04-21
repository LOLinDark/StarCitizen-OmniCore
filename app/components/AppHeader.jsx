import { Group, Button, Badge, Menu, Avatar, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import BrandWordmark from './BrandWordmark';

const FRONTEND_VERSION = 'Alpha V0.1.0';

export default function AppHeader() {
  const navigate = useNavigate();
  const rsiHandle = localStorage.getItem('rsiHandle') || 'Citizen';

  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        backgroundColor: 'rgba(11, 20, 40, 0.95)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
        backdropFilter: 'blur(8px)',
        minHeight: '60px',
      }}
    >
      {/* Left: Title */}
      <Group gap="md">
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <BrandWordmark size="1.5rem" color="#00d9ff" />
        </div>
        <Badge size="sm" variant="light" color="cyan">{FRONTEND_VERSION}</Badge>
      </Group>

      {/* Right: Menu & User */}
      <Group gap="lg">
        {/* Navigation Menu */}
        <Menu position="bottom-end" shadow="md">
          <Menu.Target>
            <Button
              variant="subtle"
              size="sm"
              style={{
                color: '#00d9ff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ☰ Menu
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => navigate('/')}>Home</Menu.Item>
            <Menu.Item onClick={() => navigate('/settings')}>Settings</Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => navigate('/about')}>About</Menu.Item>
            <Menu.Item
              onClick={() => {
                localStorage.removeItem('rsiHandle');
                navigate('/login');
              }}
              color="red"
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* User Avatar */}
        <Group gap="xs">
          <div>
            <Text size="sm" fw={500}>{rsiHandle}</Text>
            <Text size="xs" c="dimmed">Pilot</Text>
          </div>
          <Avatar
            size="md"
            radius="xl"
            style={{ backgroundColor: '#00d9ff', cursor: 'pointer' }}
          >
            {rsiHandle.substring(0, 2).toUpperCase()}
          </Avatar>
        </Group>
      </Group>
    </Group>
  );
}
