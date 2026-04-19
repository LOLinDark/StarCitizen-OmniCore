import { Container, Text, Stack, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import DevTag from '../components/DevTag';

export default function EconomyTrackerPage() {
  const navigate = useNavigate();

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}><DevTag tag="GT03" />Economy Tracker</h1>
          <Text c="dimmed">Monitor commodity prices and identify profitable trading routes</Text>
        </div>
        
        <Text>Coming soon...</Text>
        
        <Button variant="default" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Stack>
    </Container>
  );
}
