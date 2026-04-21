import { Container, SimpleGrid, Stack, Text, Button, Group, Badge, Box } from '@mantine/core';
import { useState } from 'react';
import { SciFiFrame, SciFiBackground } from '../../components/ui';
import HeroContainerWithVideo from '../../components/HeroContainerWithVideo';
import { useNavigate } from 'react-router-dom';
import { getHeroContainer } from '../../data/mediaLibrary';

// Content status markers
const ContentMarker = ({ status, type }) => {
  const colors = {
    placeholder: '#ff6b00',
    wip: '#b300ff',
    needed: '#ff0055',
  };

  return (
    <Badge
      color={colors[status]}
      variant="outline"
      size="lg"
      style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        zIndex: 10,
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      [{status}] {type}
    </Badge>
  );
};

export default function WelcomeOnline() {
  const navigate = useNavigate();

  const referralCode = 'OMNICORE2026'; // TODO: Replace with your actual code

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--oc-space-deep)', overflow: 'hidden' }}>
      <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.12)" distance={30} size={1} />

      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
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
          🔬 THEME LAB - Online Version
        </div>

        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="scifi-heading" style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>
            OMNI-CORE
          </h1>
          <Text c="dimmed" size="lg" style={{ letterSpacing: '0.1em', marginBottom: '2rem' }}>
            Citizen Operations &amp; Intelligence Network
          </Text>
          <Text c="dimmed" size="sm">
            Your gateway to the Star Citizen universe
          </Text>
        </div>

        {/* Hero Containers */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ marginBottom: '3rem' }}>
          <HeroContainerWithVideo
            heroData={getHeroContainer('starCitizen')}
            title="Star Citizen"
            description="Explore the persistent universe"
            onClick={() => navigate('/theme/star-citizen')}
          />
          <HeroContainerWithVideo
            heroData={getHeroContainer('squadron42')}
            title="Squadron 42"
            description="Answer the call to humanity"
            onClick={() => navigate('/theme/squadron-42')}
          />
        </SimpleGrid>

        {/* Theme Lab Utilities */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <Button
            variant="light"
            color="cyan"
            size="sm"
            onClick={() => navigate('/theme/placeholder-samples')}
            style={{ marginBottom: '2rem' }}
          >
            📐 View Placeholder Design Samples
          </Button>
        </div>

        {/* Blog Gallery Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="scifi-heading" style={{ marginBottom: '2rem' }}>Latest Updates</h2>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  background: 'linear-gradient(135deg, var(--oc-space-mid), var(--oc-space-light))',
                  border: '1px solid var(--oc-cyan-dim)',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    borderColor: 'var(--oc-cyan)',
                  },
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.5)',
                }}>
                  <Text size="sm" c="dimmed">[BLOG THUMBNAIL {i}]</Text>
                </div>
                <ContentMarker status="needed" type="IMAGE" />
              </Box>
            ))}
          </SimpleGrid>
        </div>

        {/* Existing User Login */}
        <SciFiFrame variant="corners" cornerLength={16} strokeWidth={1} padding={4}>
          <Stack align="center" gap="md">
            <Text c="dimmed" size="sm">
              Already have an RSI account?
            </Text>
            <Button
              variant="outline"
              color="cyan"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Stack>
        </SciFiFrame>
      </Container>
    </div>
  );
}
