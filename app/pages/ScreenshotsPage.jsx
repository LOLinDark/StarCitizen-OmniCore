import { Container, Title, Text, Box, Stack } from '@mantine/core';
import ScreenshotsGallery from '../components/ScreenshotsGallery';

export default function ScreenshotsPage() {
  // Screenshots array - update this as you add images to public/screenshots/
  const screenshots = [
    {
      src: `${import.meta.env.BASE_URL}screenshots/verse-operations-hub.png`,
      title: 'Verse Operations Hub',
      description: 'Main dashboard with operational overview',
      alt: 'Verse Operations Hub',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/ship-database.png`,
      title: 'Ship Database',
      description: 'Browse and search Star Citizen ships with detailed specs',
      alt: 'Ship Database',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/dossier.png`,
      title: 'Dossier',
      description: 'Ship information and specifications dossier',
      alt: 'Ship Dossier',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/login.png`,
      title: 'Login',
      description: 'RSI account authentication interface',
      alt: 'Login Page',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/configuration.png`,
      title: 'Configuration',
      description: 'User settings and preferences',
      alt: 'Configuration Page',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/hotas-test-lab.png`,
      title: 'HOTAS Test Lab',
      description: 'HOTAS controller testing and configuration',
      alt: 'HOTAS Test Lab',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/hotas-three-mode-profiles-setup.png`,
      title: 'HOTAS Three-Mode Profiles Setup',
      description: 'Advanced HOTAS multi-mode profile configuration',
      alt: 'HOTAS Profiles Setup',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/stream-monitor.png`,
      title: 'Stream Monitor',
      description: 'Real-time monitoring and analytics dashboard',
      alt: 'Stream Monitor',
    },
    {
      src: `${import.meta.env.BASE_URL}screenshots/development-area.png`,
      title: 'Development Area',
      description: 'Developer tools and diagnostic information',
      alt: 'Development Area',
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Box>
          <Title order={1} mb="sm">
            OmniCore Screenshots
          </Title>
          <Text c="dimmed">
            Explore the features and interface of OmniCore
          </Text>
        </Box>

        {screenshots.length > 0 ? (
          <ScreenshotsGallery screenshots={screenshots} />
        ) : (
          <Box p="lg" ta="center" c="dimmed">
            <Text>Screenshots coming soon! Add images to public/screenshots/</Text>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
