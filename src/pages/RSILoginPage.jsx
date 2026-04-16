import { Container, Stack, Button, TextInput, Text, Loader, Center } from '@mantine/core';
import { useState } from 'react';
import { SciFiFrame, SciFiBackground } from '../components/ui';

export default function RSILoginPage({ onComplete }) {
  const [rsiHandle, setRsiHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!rsiHandle.trim()) return;

    setLoading(true);
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Store the RSI handle in localStorage or app state
    localStorage.setItem('rsiHandle', rsiHandle);
    setLoading(false);
    onComplete?.(rsiHandle);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--oc-space-deep)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.12)" distance={30} size={1} />

      <Container size="xs" style={{ position: 'relative', zIndex: 1 }}>
        <SciFiFrame variant="corners" cornerLength={24} strokeWidth={1} padding={6}>
          <Stack align="center" gap="lg" py="xl">
            {/* Header */}
            <h1 className="scifi-heading" style={{ fontSize: '2.5rem', margin: 0 }}>
              OMNI-CORE
            </h1>
            <Text
              size="xs"
              style={{
                color: 'var(--oc-text-dim)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Citizen Operations &amp; Intelligence Network
            </Text>

            {/* Login form or loader */}
            {loading ? (
              <Center py="xl">
                <Loader color="cyan" type="dots" size="lg" />
              </Center>
            ) : (
              <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '1rem' }}>
                <Stack gap="md">
                  <TextInput
                    placeholder="RSI Citizen Handle"
                    value={rsiHandle}
                    onChange={(e) => setRsiHandle(e.currentTarget.value)}
                    disabled={loading}
                    styles={{
                      input: {
                        background: 'var(--oc-space-light)',
                        border: '1px solid var(--oc-cyan-dim)',
                        color: 'var(--oc-text)',
                        '&:focus': {
                          borderColor: 'var(--oc-cyan)',
                        },
                      },
                    }}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    fullWidth
                    disabled={!rsiHandle.trim() || loading}
                    variant="outline"
                    color="cyan"
                    size="lg"
                  >
                    Access System
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        </SciFiFrame>
      </Container>
    </div>
  );
}
