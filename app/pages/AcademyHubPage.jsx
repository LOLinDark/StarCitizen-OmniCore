import { Badge, Box, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { SciFiBackground } from '../components/ui';
import HeroContainerWithVideo from '../components/HeroContainerWithVideo';
import { getHeroContainer } from '../data/mediaLibrary';

// Cross-game guidance modules — items marked enabled:false show as Coming Soon
const CROSS_GAME_MODULES = [
  {
    id: 'feature-library',
    title: 'Feature Library',
    desc: 'Complete reference table of controls, keybindings, and gameplay features with training notes.',
    path: '/academy/feature-library',
    color: '#00d9ff',
    enabled: true,
  },
  {
    id: 'new-player-guide',
    title: 'New Player Guide',
    desc: 'Structured onboarding modules covering careers, controls, core gameplay, economy, and safety.',
    path: '/new-player-guide',
    color: '#22d17b',
    enabled: true,
  },
  {
    id: 'combat-fundamentals',
    title: 'Combat Fundamentals',
    desc: 'Weapons, targeting, shields, IFCS, and dogfighting techniques — applicable to both titles.',
    path: '/academy/combat',
    color: '#ff6b00',
    enabled: false,
  },
  {
    id: 'flight-model',
    title: 'Flight Model',
    desc: 'VTOL, hover, boost, decoupled mode, and precision maneuvering in depth.',
    path: '/academy/flight',
    color: '#00d9ff',
    enabled: false,
  },
  {
    id: 'fps-mechanics',
    title: 'FPS Mechanics',
    desc: 'On-foot combat, traversal, environmental hazards, and suit management.',
    path: '/academy/fps',
    color: '#b300ff',
    enabled: false,
  },
  {
    id: 'ship-systems',
    title: 'Ship Systems',
    desc: 'Power management, cooling, shields, quantum travel, and component interactions.',
    path: '/academy/ship-systems',
    color: '#22d17b',
    enabled: false,
  },
];

function GuidanceCard({ mod }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (mod.enabled) navigate(mod.path);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        padding: '1.25rem',
        border: `1px solid ${mod.enabled ? mod.color + '55' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 6,
        background: mod.enabled
          ? `linear-gradient(135deg, ${mod.color}0d, rgba(0,10,20,0.6))`
          : 'rgba(0,10,20,0.4)',
        cursor: mod.enabled ? 'pointer' : 'default',
        opacity: mod.enabled ? 1 : 0.55,
        transition: 'all 0.2s ease',
        boxShadow: mod.enabled ? `0 0 12px ${mod.color}1a` : 'none',
      }}
      onMouseEnter={(e) => {
        if (mod.enabled) {
          e.currentTarget.style.borderColor = mod.color + 'aa';
          e.currentTarget.style.boxShadow = `0 0 20px ${mod.color}33`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = mod.enabled ? mod.color + '55' : 'rgba(255,255,255,0.1)';
        e.currentTarget.style.boxShadow = mod.enabled ? `0 0 12px ${mod.color}1a` : 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Stack gap={6}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text
            fw={700}
            size="sm"
            style={{
              color: mod.enabled ? mod.color : 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {mod.title}
          </Text>
          {!mod.enabled && (
            <Badge size="xs" variant="outline" color="gray" style={{ flexShrink: 0, marginLeft: 8 }}>
              Coming Soon
            </Badge>
          )}
          {mod.enabled && (
            <Badge size="xs" variant="light" color="cyan" style={{ flexShrink: 0, marginLeft: 8 }}>
              Available
            </Badge>
          )}
        </Box>
        <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
          {mod.desc}
        </Text>
        {mod.enabled && (
          <Text size="xs" style={{ color: mod.color + 'cc', marginTop: 4 }}>
            Open →
          </Text>
        )}
      </Stack>
    </div>
  );
}

export default function AcademyHubPage() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.08)" distance={30} size={1} />

      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack gap={4} mb="xl">
          <Title order={1} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Training Academy
          </Title>
          <Text c="dimmed" size="sm" style={{ letterSpacing: '0.1em' }}>
            Structured guidance for Star Citizen and Squadron 42 — from recruit to veteran.
          </Text>
        </Stack>

        {/* Game hero containers */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl">
          <div style={{ position: 'relative' }}>
            <HeroContainerWithVideo
              heroData={getHeroContainer('starCitizen')}
              title="Star Citizen"
              description="Persistent universe — exploration, combat, trading, and more"
              onClick={() => {}}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
              borderRadius: 8,
              pointerEvents: 'none',
            }}>
              <Text fw={700} size="xl" style={{ color: '#00d9ff', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: '0 0 16px rgba(0,217,255,0.8)' }}>
                Coming Soon
              </Text>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <HeroContainerWithVideo
              heroData={getHeroContainer('squadron42')}
              title="Squadron 42"
              description="Single-player campaign — master your skills before the verse"
              onClick={() => {}}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
              borderRadius: 8,
              pointerEvents: 'none',
            }}>
              <Text fw={700} size="xl" style={{ color: '#00d9ff', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: '0 0 16px rgba(0,217,255,0.8)' }}>
                Coming Soon
              </Text>
            </div>
          </div>
        </SimpleGrid>

        {/* Cross-game guidance section */}
        <Stack gap="md">
          <div>
            <Title order={3} style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Cross-Game Guidance
            </Title>
            <Text c="dimmed" size="xs" mt={4}>
              These tools and references apply to both Star Citizen and Squadron 42.
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {CROSS_GAME_MODULES.map((mod) => (
              <GuidanceCard key={mod.id} mod={mod} />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </div>
  );
}
