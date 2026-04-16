import { Container, Text, SimpleGrid, Stack, Image, Group } from '@mantine/core';
import React from 'react';
import { SciFiFrame } from '../components/ui';

const TOOLS = [
  {
    id: 'new-player-guide',
    icon: '📚',
    title: 'New Player Guide',
    desc: 'Path to Prosperity - Your journey from recruit to veteran',
    image: '/assets/tools/new-player-guide.jpg',
    alt: 'New Player Guide - Star Citizen onboarding and tutorials',
    color: '#00d9ff',
  },
  {
    id: 'loadout-builder',
    icon: '⚔️',
    title: 'Loadout Builder',
    desc: 'Design combat configurations with weapons, armor, and components',
    image: '/assets/tools/loadout-builder.jpg',
    alt: 'Loadout Builder - Weapon and equipment configuration',
    color: '#ff0055',
  },
  {
    id: 'economy-tracker',
    icon: '💰',
    title: 'Economy Tracker',
    desc: 'Monitor commodity prices and identify profitable trading routes',
    image: '/assets/tools/economy-tracker.jpg',
    alt: 'Economy Tracker - Trading and commodity price data',
    color: '#b300ff',
  },
  {
    id: 'location-guide',
    icon: '📍',
    title: 'Location Guide',
    desc: 'Discover stations, outposts, and points of interest across the galaxy',
    image: '/assets/tools/location-guide.jpg',
    alt: 'Location Guide - Star Citizen universe map and locations',
    color: '#00ff88',
  },
  {
    id: 'hotas-config',
    icon: '🎮',
    title: 'HOTAS Config',
    desc: 'Configure and optimize your flight stick for precision piloting',
    image: '/assets/tools/hotas-config.jpg',
    alt: 'HOTAS Configuration - Flight stick and control setup',
    color: '#ff6b00',
  },
  {
    id: 'ship-database',
    icon: '🚀',
    title: 'Ship Database',
    desc: 'Explore specifications, pricing, and loadouts for every ship in the verse',
    image: '/assets/tools/ship-database.jpg',
    alt: 'Ship Database - Star Citizen spacecraft database',
    color: '#00d9ff',
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
    {tool.icon}
  </div>
);

const ToolCard = ({ tool }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
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
            <Text size="xl">{tool.icon}</Text>
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
  );
};

export default function DashboardPage() {
  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="scifi-heading" style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>
          OMNI-CORE
        </h1>
        <Text c="dimmed" size="sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Citizen Operations &amp; Intelligence Network
        </Text>
        <Text c="dimmed" size="xs" style={{ marginTop: '1rem', opacity: 0.6 }}>
          Select a tool to begin
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
