import { Container, Button, Stack, Loader } from '@mantine/core';
import { useState, useEffect } from 'react';
import { SciFiFrame, SciFiBackground } from '../components/ui';

export default function WelcomePage({ onComplete }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--oc-space-deep)', overflow: 'hidden' }}>
      <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.12)" distance={30} size={1} />
      <Container size="xs" style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: '25vh' }}>
        <SciFiFrame variant="corners" cornerLength={24} strokeWidth={1} padding={6}>
          <Stack align="center" gap="lg" py="xl">
            <h1 className="scifi-heading" style={{ fontSize: '2.5rem', margin: 0 }}>
              OMNI-CORE
            </h1>
            <p style={{ color: 'var(--oc-text-dim)', letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.75rem', margin: 0 }}>
              Citizen Operations &amp; Intelligence Network
            </p>
            {loading ? (
              <Loader color="cyan" type="dots" size="lg" />
            ) : (
              <Button size="lg" variant="outline" color="cyan" onClick={onComplete}>
                Enter the Verse
              </Button>
            )}
          </Stack>
        </SciFiFrame>
      </Container>
    </div>
  );
}
