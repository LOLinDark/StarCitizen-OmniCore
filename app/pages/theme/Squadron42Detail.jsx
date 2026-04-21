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

const StoryCard = ({ chapter, title, description, marker }) => (
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
    <Text size="xs" style={{ color: 'var(--oc-orange)', fontWeight: 600, marginBottom: '0.5rem' }}>
      {chapter}
    </Text>
    <Text fw={600} style={{ color: 'var(--oc-cyan)', marginBottom: '0.5rem' }}>{title}</Text>
    <Text size="sm" c="dimmed">{description}</Text>
  </Box>
);

export default function Squadron42Detail() {
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
        🔬 SQUADRON 42 DETAIL
      </div>

      {/* Hero Section */}
      <Section marker={{ status: 'needed', type: 'HERO VIDEO' }}>
        <Container size="lg" py="8rem" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #2a0a0a, var(--oc-space-light))',
              border: '2px solid var(--oc-orange)',
              borderRadius: '2px',
              padding: '4rem 2rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <h1 className="scifi-heading" style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#ff6b00' }}>
              Squadron 42
            </h1>
            <Text size="lg" style={{ color: '#ff6b00', marginBottom: '2rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Answer the Call
            </Text>
            <Text size="md" c="dimmed" style={{ marginBottom: '2rem' }}>
              A cinematic single-player campaign by Cloud Imperium Games
            </Text>
            <Button
              variant="outline"
              color="orange"
              size="lg"
              onClick={() => window.open('https://robertsspaceindustries.com', '_blank')}
            >
              Enlist Now (Referral Link)
            </Button>
          </div>
        </Container>
      </Section>

      {/* The Story */}
      <Section
        title="Answer the Call"
        subtitle="Humanity faces an imminent threat. Join the UEE Navy and fight for survival."
        marker={{ status: 'needed', type: 'STORY VIDEO' }}
      >
        <Stack gap="2rem">
          <Box
            style={{
              background: 'rgba(255, 107, 0, 0.05)',
              border: '2px dashed var(--oc-orange)',
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: '2px',
            }}
          >
            <Text size="lg" c="dimmed">[EMBEDDED YOUTUBE CLIP - NO EXTERNAL LINKS]</Text>
            <Text size="xs" c="dimmed" style={{ marginTop: '1rem' }}>
              Squadron 42 campaign trailer or lore video
            </Text>
          </Box>
          <Text c="dimmed">
            Squadron 42 is a single-player military campaign where you'll experience humanity's struggle against an alien threat. 
            Featuring cinematic storytelling, tactical missions, and iconic characters—prepare for an unforgettable journey.
          </Text>
        </Stack>
      </Section>

      {/* Campaign Chapters */}
      <Section
        title="The Campaign"
        subtitle="Progressive missions across multiple chapters"
        bgColor="var(--oc-space-mid)"
        marker={{ status: 'placeholder', type: 'CHAPTER COUNT' }}
      >
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          <StoryCard
            chapter="Chapter I"
            title="Orientation"
            description="Enter the UEE Navy and begin your training"
            marker={{ status: 'needed', type: 'DESCRIPTION' }}
          />
          <StoryCard
            chapter="Chapter II"
            title="First Contact"
            description="Face the enemy in your first combat deployment"
            marker={{ status: 'needed', type: 'DESCRIPTION' }}
          />
          <StoryCard
            chapter="Chapter III"
            title="Deep Strike"
            description="Take the fight to enemy territory"
            marker={{ status: 'needed', type: 'DESCRIPTION' }}
          />
        </SimpleGrid>
      </Section>

      {/* UEE Navy Features */}
      <Section
        title="Military Life"
        subtitle="Experience tactical combat and strategic warfare"
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Box
            style={{
              background: 'var(--oc-space-mid)',
              border: '1px solid var(--oc-cyan-dim)',
              padding: '2rem',
              borderRadius: '2px',
            }}
          >
            <ContentMarker status="needed" type="FEATURE VIDEO" />
            <Text fw={600} style={{ color: 'var(--oc-cyan)', marginBottom: '1rem' }}>⚔️ Combat Missions</Text>
            <Text c="dimmed">Engage in intense dogfights, bombing runs, and tactical strikes</Text>
          </Box>
          <Box
            style={{
              background: 'var(--oc-space-mid)',
              border: '1px solid var(--oc-cyan-dim)',
              padding: '2rem',
              borderRadius: '2px',
            }}
          >
            <ContentMarker status="needed" type="CHARACTER VIDEO" />
            <Text fw={600} style={{ color: 'var(--oc-cyan)', marginBottom: '1rem' }}>🤖 Iconic Characters</Text>
            <Text c="dimmed">Meet compelling allies and enemies with rich backstories</Text>
          </Box>
          <Box
            style={{
              background: 'var(--oc-space-mid)',
              border: '1px solid var(--oc-cyan-dim)',
              padding: '2rem',
              borderRadius: '2px',
            }}
          >
            <ContentMarker status="needed" type="GAMEPLAY FOOTAGE" />
            <Text fw={600} style={{ color: 'var(--oc-cyan)', marginBottom: '1rem' }}>🎯 Strategic Depth</Text>
            <Text c="dimmed">Choose your approach—stealth, aggression, or diplomacy</Text>
          </Box>
          <Box
            style={{
              background: 'var(--oc-space-mid)',
              border: '1px solid var(--oc-cyan-dim)',
              padding: '2rem',
              borderRadius: '2px',
            }}
          >
            <ContentMarker status="needed" type="CINEMATIC CLIP" />
            <Text fw={600} style={{ color: 'var(--oc-cyan)', marginBottom: '1rem' }}>🎬 Cinematic Quality</Text>
            <Text c="dimmed">Experience AAA-level production and storytelling</Text>
          </Box>
        </SimpleGrid>
      </Section>

      {/* Gameplay Showcase */}
      <Section
        title="See It In Action"
        marker={{ status: 'needed', type: 'IMAGE CAROUSEL' }}
        bgColor="var(--oc-space-mid)"
      >
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              style={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, #2a0a0a, var(--oc-space-light))',
                border: '1px solid var(--oc-orange)',
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

      {/* CTA Section */}
      <Section
        title="Join the Fight"
        subtitle="Become a UEE Navy Pilot and defend humanity"
        bgColor="var(--oc-space-deep)"
      >
        <Group justify="center" gap="lg">
          <Button
            variant="outline"
            color="orange"
            size="lg"
            onClick={() => window.open('https://robertsspaceindustries.com', '_blank')}
          >
            Enlist Now (with Referral)
          </Button>
          <Button
            variant="outline"
            color="cyan"
            size="lg"
            onClick={() => navigate('/login')}
          >
            Already Enlisted?
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
            Squadron 42 is a trademark of Cloud Imperium Games • OmniCore is a community fan project
          </Text>
        </Container>
      </div>
    </div>
  );
}
