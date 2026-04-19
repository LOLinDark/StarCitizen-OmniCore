import { Container, Text, SimpleGrid, Stack, Image, Group } from '@mantine/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SciFiFrame } from '../components/ui';
import DevTag from '../components/DevTag';

const TOOLS = [
  {
    id: 'new-player-guide',
    title: 'Training Academy',
    desc: 'Structured courses and field briefings for recruits entering the verse',
    image: '/assets/tools/new-player-guide.jpg',
    alt: 'Training Academy - Citizen recruit training and course modules',
    color: '#00d9ff',
    path: '/new-player-guide',
  },
  {
    id: 'economy-tracker',
    title: 'Economy Tracker',
    desc: 'Monitor commodity prices and identify profitable trading routes',
    image: '/assets/tools/economy-tracker.jpg',
    alt: 'Economy Tracker - Trading and commodity price data',
    color: '#b300ff',
    path: '/economy-tracker',
  },
  {
    id: 'location-guide',
    title: 'Nav Charts',
    desc: 'Charted systems, stations, and points of interest across known space',
    image: '/assets/tools/location-guide.jpg',
    alt: 'Nav Charts - Verse navigation, systems and locations',
    color: '#00ff88',
    path: '/location-guide',
  },
  {
    id: 'hotas-config',
    title: 'Technology Config',
    desc: 'Configure your flight stick, mouse, and keyboard for precision control',
    image: '/assets/tools/hotas-config.jpg',
    alt: 'Technology Config - Flight controls, HOTAS, mouse and keyboard setup',
    color: '#ff6b00',
    path: '/hotas-config',
  },
  {
    id: 'ship-database',
    title: 'Ship Database',
    desc: 'Explore specifications, pricing, and loadouts for every ship in the verse',
    image: '/assets/tools/ship-database.jpg',
    alt: 'Ship Database - Star Citizen spacecraft database',
    color: '#00d9ff',
    path: '/ship-database',
  },
];

// Fallback image placeholder for missing assets
const PlaceholderImage = ({ tool }) => (
  <div
    style={{
      width: '100%',
      height: '200px',
      background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}40)`,
      border: `1px solid ${tool.color}60`,
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      opacity: 0.8,
    }}
  >
    <Text
      fw={700}
      size="sm"
      style={{
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: tool.color,
      }}
    >
      Preview
    </Text>
  </div>
);

const ToolCard = ({ tool }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <div
      onClick={() => navigate(tool.path)}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 217, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <SciFiFrame variant="corners" cornerLength={16} strokeWidth={1.5} padding={0}>
        <Stack gap={0}>
          {/* Image section */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderBottom: `1px solid var(--oc-cyan-dim)`,
            }}
          >
            <Image
              src={tool.image}
              alt={tool.alt}
              onLoad={() => setImageLoaded(true)}
              fallback={<PlaceholderImage tool={tool} />}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
            {!imageLoaded && <PlaceholderImage tool={tool} />}
          </div>

          {/* Content section */}
          <div style={{ padding: '1rem' }}>
            <Group gap={6} mb={6}>
              <Text fw={700} style={{ color: tool.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {tool.title}
              </Text>
            </Group>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
              {tool.desc}
            </Text>
          </div>
        </Stack>
      </SciFiFrame>
    </div>
  );
};

export default function MainDashboardPage() {
  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="scifi-heading" style={{ marginBottom: '0.5rem', fontSize: '2rem', margin: 0 }}>
          <DevTag tag="APP01" />Verse Operations Hub
        </h1>
        <Text c="dimmed" size="sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
          Access your tools and resources
        </Text>
      </div>

      {/* Tools Grid */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="lg"
        style={{
          marginBottom: '2rem',
        }}
      >
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
