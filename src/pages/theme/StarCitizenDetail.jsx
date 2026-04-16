import { Container, Stack, Text, Button, SimpleGrid, Box, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { SciFiFrame, SciFiBackground } from '../../components/ui';

const ContentMarker = ({ status, type }) => {
  const colors = {
    placeholder: '#ff6b00',
    wip: '#b300ff',
    needed: '#ff0055',
  };

  return (
    <div
      style={{
        display: 'inline-block',
        background: colors[status],
        color: '#000',
        padding: '0.25rem 0.75rem',
        borderRadius: '2px',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
      }}
    >
      [{status}] {type}
    </div>
  );
};

const Section = ({ title, subtitle, children, marker, bgColor = 'var(--oc-space-deep)' }) => (
  <div style={{ background: bgColor, padding: '4rem 0', borderTop: '1px solid var(--oc-cyan-dim)' }}>
    <Container size="lg">
      {marker && <ContentMarker {...marker} />}
      {title && <h2 className="scifi-heading" style={{ marginBottom: '1rem' }}>{title}</h2>}
      {subtitle && <Text c="dimmed" size="lg" style={{ marginBottom: '2rem' }}>{subtitle}</Text>}
      {children}
    </Container>
  </div>
);

const FeatureCard = ({ icon, title, description, marker }) => (
  <Box
    style={{
      background: 'var(--oc-space-mid)',
      border: '1px solid var(--oc-cyan-dim)',
      padding: '1.5rem',
      borderRadius: '2px',
      transition: 'all 0.3s ease',
      ':hover': {
        borderColor: 'var(--oc-cyan)',
      },
    }}
  >
    {marker && <ContentMarker {...marker} />}
    <Text size="xl" style={{ marginBottom: '0.5rem' }}>{icon}</Text>
    <Text fw={600} style={{ color: 'var(--oc-cyan)', marginBottom: '0.5rem' }}>{title}</Text>
    <Text size="sm" c="dimmed">{description}</Text>
  </Box>
);

export default function StarCitizenDetail() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--oc-space-deep)' }}>
      <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.12)" distance={30} size={1} />

      {/* Back Navigation */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 100,
      }}>
        <Button
          variant="outline"
          color="cyan"
          size="sm"
          onClick={() => navigate('/theme')}
        >
          ← Back
        </Button>
      </div>

      {/* Dev Mode Indicator */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: 'rgba(0, 217, 255, 0.1)',
        border: '1px solid var(--oc-cyan)',
        padding: '0.5rem 1rem',
        borderRadius: '2px',
        fontSize: '0.75rem',
        color: 'var(--oc-cyan)',
        zIndex: 100,
      }}>
        🔬 STAR CITIZEN DETAIL
      </div>

      {/* Hero Section */}
      <Section marker={{ status: 'needed', type: 'HERO VIDEO' }}>
        <Container size="lg" py="8rem" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--oc-space-mid), var(--oc-space-light))',
              border: '2px solid var(--oc-cyan)',
              borderRadius: '2px',
              padding: '4rem 2rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <h1 className="scifi-heading" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              Star Citizen
            </h1>
            <Text size="lg" c="dimmed" style={{ marginBottom: '2rem' }}>
              An open-universe exploration game
            </Text>
            <Button
              variant="outline"
              color="cyan"
              size="lg"
              onClick={() => window.open('https://robertsspaceindustries.com', '_blank')}
            >
              Create RSI Account (Referral Link)
            </Button>
          </div>
        </Container>
      </Section>

      {/* What is Star Citizen */}
      <Section
        title="What is Star Citizen?"
        subtitle="Explore an entire living, breathing universe"
        marker={{ status: 'needed', type: 'EMBEDDED VIDEO' }}
      >
        <Stack gap="2rem">
          <Box
            style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: '2px dashed var(--oc-cyan-dim)',
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: '2px',
            }}
          >
            <Text size="lg" c="dimmed">[EMBEDDED YOUTUBE CLIP - NO EXTERNAL LINKS]</Text>
            <Text size="xs" c="dimmed" style={{ marginTop: '1rem' }}>
              Community created content or official CIG clips
            </Text>
          </Box>
          <Text c="dimmed">
            Star Citizen is an open-universe space simulator and action game currently in development by Cloud Imperium Games. 
            Players take the role of space explorers, traders, mercenaries, and more in a massive multiplayer universe.
          </Text>
        </Stack>
      </Section>

      {/* Core Features */}
      <Section
        title="Core Features"
        bgColor="var(--oc-space-mid)"
      >
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          <FeatureCard
            icon="🚀"
            title="Exploration"
            description="Discover hundreds of planets and moons"
            marker={{ status: 'placeholder', type: 'DESCRIPTION' }}
          />
          <FeatureCard
            icon="💰"
            title="Trading"
            description="Establish profitable trading routes across the verse"
            marker={{ status: 'placeholder', type: 'DESCRIPTION' }}
          />
          <FeatureCard
            icon="⚔️"
            title="Combat"
            description="Engage in thrilling space battles and skirmishes"
            marker={{ status: 'placeholder', type: 'DESCRIPTION' }}
          />
          <FeatureCard
            icon="🤝"
            title="Cooperation"
            description="Join crews and corporations with other players"
            marker={{ status: 'placeholder', type: 'DESCRIPTION' }}
          />
          <FeatureCard
            icon="🛠️"
            title="Crafting"
            description="Build and customize your ships and equipment"
            marker={{ status: 'placeholder', type: 'DESCRIPTION' }}
          />
          <FeatureCard
            icon="🌌"
            title="Universe"
            description="Experience a living, dynamic star system"
            marker={{ status: 'placeholder', type: 'DESCRIPTION' }}
          />
        </SimpleGrid>
      </Section>

      {/* Gameplay Showcase */}
      <Section
        title="Experience the Verse"
        marker={{ status: 'needed', type: 'IMAGE CAROUSEL' }}
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {[1, 2].map((i) => (
            <Box
              key={i}
              style={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, var(--oc-space-mid), var(--oc-space-light))',
                border: '1px solid var(--oc-cyan-dim)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text c="dimmed">[GAMEPLAY SCREENSHOT {i}]</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Section>

      {/* Community Section */}
      <Section
        title="Join the Community"
        bgColor="var(--oc-space-mid)"
        marker={{ status: 'wip', type: 'SOCIAL INTEGRATION' }}
      >
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <FeatureCard
            icon="💬"
            title="Forums"
            description="Connect with thousands of citizens"
          />
          <FeatureCard
            icon="🎮"
            title="Discord"
            description="Join community organizations"
          />
          <FeatureCard
            icon="🏆"
            title="Events"
            description="Participate in organized gameplay"
          />
        </SimpleGrid>
      </Section>

      {/* CTA Section */}
      <Section
        title="Ready to Join?"
        subtitle="Create your RSI account and start your journey"
        bgColor="var(--oc-space-deep)"
      >
        <Group justify="center" gap="lg">
          <Button
            variant="outline"
            color="cyan"
            size="lg"
            onClick={() => window.open('https://robertsspaceindustries.com', '_blank')}
          >
            Create Account (with Referral)
          </Button>
          <Button
            variant="outline"
            color="cyan"
            size="lg"
            onClick={() => navigate('/login')}
          >
            Already a Citizen?
          </Button>
        </Group>
      </Section>

      {/* Footer */}
      <div style={{
        padding: '3rem 0',
        borderTop: '1px solid var(--oc-cyan-dim)',
        textAlign: 'center',
      }}>
        <Container size="lg">
          <Text size="xs" c="dimmed">
            Star Citizen is a trademark of Cloud Imperium Games • OmniCore is a community fan project
          </Text>
        </Container>
      </div>
    </div>
  );
}
