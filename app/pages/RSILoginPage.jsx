import { Stack, Button, TextInput, Text, Loader, Center } from '@mantine/core';
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

      {/* Three-panel row */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'stretch',
          gap: '1.5rem',
          padding: '1rem',
          width: '100%',
          maxWidth: '980px',
        }}
      >
        {/* ── LEFT PANEL — Enlist ── */}
        <div style={{ flex: 1 }}>
          <SciFiFrame variant="corners" cornerLength={16} strokeWidth={1} padding={4}>
            <Stack align="center" justify="center" gap="md" py="xl" px="md" style={{ height: '100%', textAlign: 'center' }}>
              <Text
                size="xs"
                style={{
                  color: 'var(--oc-cyan)',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                }}
              >
                Not yet a citizen?
              </Text>
              <Text size="sm" style={{ color: 'var(--oc-text-dim)', lineHeight: 1.6 }}>
                Join the universe. Explore the stars. Start your journey with Star Citizen today.
              </Text>
              <Button
                fullWidth
                size="sm"
                onClick={() =>
                  window.open(
                    'https://robertsspaceindustries.com/en/star-citizen?referral=STAR-TBYK-XVFK',
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                style={{
                  color: '#0b1428',
                  background: 'linear-gradient(135deg, #22d17b 0%, #00d9ff 100%)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 0 14px rgba(0,217,255,0.4)',
                }}
              >
                Enlist Now
              </Button>
            </Stack>
          </SciFiFrame>
        </div>

        {/* ── CENTRE PANEL — Login ── */}
        <div style={{ flex: 2 }}>
          <SciFiFrame variant="corners" cornerLength={24} strokeWidth={1} padding={6}>
            <Stack align="center" gap="lg" py="xl" px="md">
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
                          '&:focus': { borderColor: 'var(--oc-cyan)' },
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
        </div>

        {/* ── RIGHT PANEL — Skip / Guest ── */}
        <div style={{ flex: 1 }}>
          <SciFiFrame variant="corners" cornerLength={16} strokeWidth={1} padding={4}>
            <Stack align="center" justify="center" gap="md" py="xl" px="md" style={{ height: '100%', textAlign: 'center' }}>
              <Text
                size="xs"
                style={{
                  color: 'var(--oc-text-dim)',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                }}
              >
                No backer yet?
              </Text>
              <Text size="sm" style={{ color: 'var(--oc-text-dim)', lineHeight: 1.6 }}>
                You can still browse OmniCore in guest mode — no handle required.
              </Text>
              <Button
                fullWidth
                variant="outline"
                color="gray"
                size="sm"
                onClick={() => onComplete?.('')}
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--oc-text-dim)' }}
              >
                Browse as Guest
              </Button>
            </Stack>
          </SciFiFrame>
        </div>
      </div>
    </div>
  );
}
