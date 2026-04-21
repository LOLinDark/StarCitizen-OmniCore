import { Container, Stack, Text, SimpleGrid, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { SciFiFrame } from '../../components/ui';

// ═══════════════════════════════════════════════════════════════
// 1. SCI-FI TERMINAL STYLE
// ═══════════════════════════════════════════════════════════════
const TerminalStyle = ({ tool }) => {
  const [displayText, setDisplayText] = useState('');
  const fullText = tool.id === 'tech' ? 'HOTAS.CONFIG > INITIALIZING...' : 'VERSE.DB > QUERYING...';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div
      style={{
        width: '100%',
        height: '250px',
        background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(0, 217, 255, 0.02))',
        border: '2px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '"Courier New", monospace',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0, 217, 255, 0.03) 2px, transparent 2px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {tool.id === 'tech' ? '⚙️' : '🚀'}
        </div>
        <div
          style={{
            color: '#00d9ff',
            fontSize: '1.2rem',
            letterSpacing: '0.05em',
            minHeight: '1.5rem',
            textShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
          }}
        >
          {displayText}
          <span style={{ animation: 'blink 1s infinite' }}>|</span>
        </div>
      </div>
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 2. ICON + STATS GRID
// ═══════════════════════════════════════════════════════════════
const IconStatsStyle = ({ tool }) => {
  const stats = tool.id === 'tech' 
    ? { count: '4', label: 'profiles loaded' }
    : { count: '847', label: 'vessels catalogued' };

  return (
    <div
      style={{
        width: '100%',
        height: '250px',
        background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08), rgba(255, 107, 0, 0.08))',
        border: `2px solid ${tool.id === 'tech' ? '#ff6b00' : '#00d9ff'}`,
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.3))',
        }}
      >
        {tool.id === 'tech' ? '⚙️' : '🚀'}
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', color: tool.id === 'tech' ? '#ff6b00' : '#00d9ff', fontWeight: 700 }}>
          {stats.count}
        </div>
        <Text size="sm" c="dimmed" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {stats.label}
        </Text>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          width: '80%',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              width: '100%',
              aspectRatio: '1',
              background: `rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.1)`,
              border: `1px solid rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.3)`,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 3. ANIMATED GRID PATTERN
// ═══════════════════════════════════════════════════════════════
const AnimatedGridStyle = ({ tool }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '250px',
        background: `linear-gradient(135deg, rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.05), rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.02))`,
        border: `2px solid rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.3)`,
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.3 }}
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
      >
        <defs>
          <style>{`
            @keyframes gridPulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.6; }
            }
            .grid-line { stroke: ${tool.id === 'tech' ? '#ff6b00' : '#00d9ff'}; stroke-width: 1; animation: gridPulse 3s ease-in-out infinite; }
            .grid-node { fill: ${tool.id === 'tech' ? '#ff6b00' : '#00d9ff'}; animation: gridPulse 3s ease-in-out infinite; }
          `}</style>
        </defs>
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 62.5}
            x2="400"
            y2={i * 62.5}
            className="grid-line"
          />
        ))}
        {[...Array(7)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 57.14}
            y1="0"
            x2={i * 57.14}
            y2="250"
            className="grid-line"
          />
        ))}
        {/* Grid nodes */}
        {[...Array(12)].map((_, i) => (
          <circle
            key={`node${i}`}
            cx={(i % 4) * 133.33 + 67}
            cy={Math.floor(i / 4) * 83.33 + 41}
            r="3"
            className="grid-node"
          />
        ))}
      </svg>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          fontSize: '3rem',
          filter: `drop-shadow(0 0 15px rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.5))`,
        }}
      >
        {tool.id === 'tech' ? '⚙️' : '🚀'}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 4. DATA VISUALIZATION
// ═══════════════════════════════════════════════════════════════
const DataVisualizationStyle = ({ tool }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '250px',
        background: `linear-gradient(135deg, rgba(${tool.id === 'tech' ? '179, 0, 255' : '0, 255, 136'}, 0.05), rgba(${tool.id === 'tech' ? '179, 0, 255' : '0, 255, 136'}, 0.02))`,
        border: `2px solid rgba(${tool.id === 'tech' ? '179, 0, 255' : '0, 255, 136'}, 0.3)`,
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
      >
        <defs>
          <style>{`
            @keyframes nodeGlow {
              0%, 100% { r: 4; opacity: 0.6; }
              50% { r: 6; opacity: 1; }
            }
            @keyframes lineFlow {
              0%, 100% { stroke-dashoffset: 0; }
              50% { stroke-dashoffset: 10; }
            }
            .node { animation: nodeGlow 2s ease-in-out infinite; }
            .connection { stroke: ${tool.id === 'tech' ? '#b300ff' : '#00ff88'}; stroke-width: 1.5; stroke-dasharray: 10; animation: lineFlow 4s linear infinite; opacity: 0.4; }
          `}</style>
        </defs>
        {/* Connections */}
        {tool.id === 'tech' ? (
          <>
            <line x1="80" y1="50" x2="200" y2="125" className="connection" />
            <line x1="200" y1="125" x2="320" y2="50" className="connection" />
            <line x1="200" y1="125" x2="80" y2="200" className="connection" />
            <line x1="200" y1="125" x2="320" y2="200" className="connection" />
          </>
        ) : (
          <>
            <circle cx="100" cy="50" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="150" cy="80" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="200" cy="120" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="250" cy="80" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="300" cy="50" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="120" cy="200" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="200" cy="180" r="3" fill="#00ff88" opacity="0.2" />
            <circle cx="280" cy="200" r="3" fill="#00ff88" opacity="0.2" />
          </>
        )}
        {/* Nodes */}
        {tool.id === 'tech' ? (
          <>
            <circle cx="80" cy="50" r="4" fill="#b300ff" className="node" />
            <circle cx="320" cy="50" r="4" fill="#b300ff" className="node" />
            <circle cx="200" cy="125" r="5" fill="#b300ff" className="node" />
            <circle cx="80" cy="200" r="4" fill="#b300ff" className="node" />
            <circle cx="320" cy="200" r="4" fill="#b300ff" className="node" />
          </>
        ) : (
          <>
            <circle cx="100" cy="50" r="4" fill="#00ff88" className="node" />
            <circle cx="150" cy="80" r="4" fill="#00ff88" className="node" />
            <circle cx="200" cy="120" r="5" fill="#00ff88" className="node" />
            <circle cx="250" cy="80" r="4" fill="#00ff88" className="node" />
            <circle cx="300" cy="50" r="4" fill="#00ff88" className="node" />
            <circle cx="120" cy="200" r="4" fill="#00ff88" className="node" />
            <circle cx="200" cy="180" r="4" fill="#00ff88" className="node" />
            <circle cx="280" cy="200" r="4" fill="#00ff88" className="node" />
          </>
        )}
      </svg>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// WIREFRAME COMPONENTS
// ═══════════════════════════════════════════════════════════════

// HOTAS Wireframe - Generic throttle and joystick setup
const HOTASWireframe = ({ color }) => (
  <svg viewBox="0 0 200 240" style={{ width: '100%', height: '100%', maxWidth: '120px' }}>
    {/* Throttle unit - left side */}
    <g opacity="0.9">
      {/* Throttle grip */}
      <rect x="20" y="80" width="35" height="100" stroke={color} strokeWidth="1.5" fill="none" rx="3" />
      {/* Hat switch */}
      <circle cx="37" cy="50" r="12" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="37" y1="40" x2="37" y2="60" stroke={color} strokeWidth="1" />
      <line x1="27" y1="50" x2="47" y2="50" stroke={color} strokeWidth="1" />
      {/* Rotary controls */}
      <circle cx="37" cy="155" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="37" y1="150" x2="37" y2="145" stroke={color} strokeWidth="1" />
      {/* Slider indicators */}
      <line x1="20" y1="110" x2="55" y2="110" stroke={color} strokeWidth="0.8" />
      <line x1="20" y1="125" x2="55" y2="125" stroke={color} strokeWidth="0.8" />
      <line x1="20" y1="140" x2="55" y2="140" stroke={color} strokeWidth="0.8" />
    </g>

    {/* Joystick - center */}
    <g opacity="0.9">
      {/* Stick base */}
      <rect x="80" y="140" width="40" height="60" stroke={color} strokeWidth="1.5" fill="none" rx="2" />
      {/* Stick shaft */}
      <line x1="100" y1="100" x2="100" y2="140" stroke={color} strokeWidth="1.5" />
      {/* Stick grip */}
      <circle cx="100" cy="85" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="95" y1="80" x2="105" y2="80" stroke={color} strokeWidth="1" />
      {/* Stick throw indicators */}
      <circle cx="100" cy="85" r="18" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
    </g>

    {/* Connection line */}
    <line x1="55" y1="160" x2="80" y2="160" stroke={color} strokeWidth="1" opacity="0.6" />
  </svg>
);

// Hornet Wireframe - Based on schematic (side/top view)
const ShipWireframe = ({ color }) => (
  <svg viewBox="0 0 200 180" style={{ width: '100%', height: '100%', maxWidth: '140px' }}>
    {/* Main fuselage - cockpit to aft */}
    <g opacity="0.9">
      {/* Forward cockpit/canopy */}
      <path
        d="M 100 40 L 95 60 L 85 65 L 85 90 L 100 95 L 115 90 L 115 65 L 105 60 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Main body */}
      <ellipse cx="100" cy="110" rx="25" ry="35" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Aft section */}
      <path
        d="M 90 140 L 85 160 L 100 165 L 115 160 L 110 140 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </g>

    {/* Wing structures */}
    <g opacity="0.9">
      {/* Port (left) wing */}
      <path
        d="M 85 105 L 55 100 L 50 110 L 85 115 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Starboard (right) wing */}
      <path
        d="M 115 105 L 145 100 L 150 110 L 115 115 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </g>

    {/* Engine pods - dual */}
    <g opacity="0.9">
      {/* Port engine */}
      <rect x="70" y="125" width="12" height="28" stroke={color} strokeWidth="1.5" fill="none" rx="2" />
      <line x1="70" y1="135" x2="82" y2="135" stroke={color} strokeWidth="0.8" />
      {/* Starboard engine */}
      <rect x="118" y="125" width="12" height="28" stroke={color} strokeWidth="1.5" fill="none" rx="2" />
      <line x1="118" y1="135" x2="130" y2="135" stroke={color} strokeWidth="0.8" />
    </g>

    {/* Landing gear indicators */}
    <g opacity="0.6">
      <line x1="80" y1="140" x2="75" y2="155" stroke={color} strokeWidth="1" />
      <line x1="120" y1="140" x2="125" y2="155" stroke={color} strokeWidth="1" />
      <line x1="100" y1="145" x2="100" y2="158" stroke={color} strokeWidth="1" />
    </g>
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// 5. HYBRID APPROACH
// ═══════════════════════════════════════════════════════════════
const HybridStyle = ({ tool }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '250px',
        background: `linear-gradient(135deg, rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.08), rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.03))`,
        border: `2px solid rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.4)`,
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 20px rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.2), inset 0 0 20px rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.05)`,
      }}
    >
      {/* Grid background */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.15,
          top: 0,
          left: 0,
        }}
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
      >
        {[...Array(5)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 62.5}
            x2="400"
            y2={i * 62.5}
            stroke={tool.id === 'tech' ? '#ff6b00' : '#00d9ff'}
            strokeWidth="1"
          />
        ))}
        {[...Array(7)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 57.14}
            y1="0"
            x2={i * 57.14}
            y2="250"
            stroke={tool.id === 'tech' ? '#ff6b00' : '#00d9ff'}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div
          style={{
            width: '120px',
            height: '100px',
            marginBottom: '0.75rem',
            filter: `drop-shadow(0 0 15px rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.6))`,
          }}
        >
          {tool.id === 'tech' ? (
            <HOTASWireframe color={tool.id === 'tech' ? '#ff6b00' : '#00d9ff'} />
          ) : (
            <ShipWireframe color={tool.id === 'tech' ? '#ff6b00' : '#00d9ff'} />
          )}
        </div>
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.9rem',
            color: tool.id === 'tech' ? '#ff6b00' : '#00d9ff',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            textShadow: `0 0 8px rgba(${tool.id === 'tech' ? '255, 107, 0' : '0, 217, 255'}, 0.5)`,
          }}
        >
          {tool.id === 'tech' ? 'HOTAS.CONFIG' : 'VERSE.DB'}
        </div>
        <Text size="xs" c="dimmed" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {tool.id === 'tech' ? '4 profiles loaded' : '847 vessels catalogued'}
        </Text>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function PlaceholderSamplesPage() {
  const tools = [
    { id: 'tech', title: 'Technology Config', color: '#ff6b00' },
    { id: 'ship', title: 'Ship Database', color: '#00d9ff' },
  ];

  const samples = [
    {
      name: 'Sci-Fi Terminal Style',
      description: 'Monospace text styled like a data readout with character-by-character typing animation',
      Component: TerminalStyle,
    },
    {
      name: 'Icon + Stats Grid',
      description: 'Large icon with numeric stats and mini grid pattern below',
      Component: IconStatsStyle,
    },
    {
      name: 'Animated Grid Pattern',
      description: 'SVG background with subtle animated grid and nodes',
      Component: AnimatedGridStyle,
    },
    {
      name: 'Data Visualization',
      description: 'Node networks (HOTAS) or ship silhouettes (DB) with animated connections',
      Component: DataVisualizationStyle,
    },
    {
      name: 'Hybrid Approach',
      description: 'Icon + grid background + monospace label + subtle glow (RECOMMENDED)',
      Component: HybridStyle,
    },
  ];

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="scifi-heading" style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>
          Placeholder Design Samples
        </h1>
        <Text c="dimmed" size="sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Five approaches for TECHNOLOGY CONFIG & SHIP DATABASE cards
        </Text>
      </div>

      <Stack gap="3rem">
        {samples.map((sample, idx) => (
          <div key={idx}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {idx + 1}. {sample.name}
              </h2>
              <Text size="sm" c="dimmed">
                {sample.description}
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {tools.map((tool) => (
                <div key={tool.id}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Text size="sm" fw={600} style={{ color: tool.color }}>
                      {tool.title}
                    </Text>
                  </div>
                  <sample.Component tool={tool} />
                </div>
              ))}
            </SimpleGrid>

            {idx < samples.length - 1 && (
              <div
                style={{
                  marginTop: '2rem',
                  height: '1px',
                  background: 'linear-gradient(to right, rgba(0, 217, 255, 0.2), transparent)',
                }}
              />
            )}
          </div>
        ))}
      </Stack>

      {/* Recommendation */}
      <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0} style={{ marginTop: '3rem' }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ color: '#00ff88', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recommendation
          </h2>
          <Text size="sm" mb="md">
            The <strong>Hybrid Approach (Option 5)</strong> is recommended because:
          </Text>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Combines best elements: icon clarity + grid visual interest</li>
            <li>Monospace label adds sci-fi credibility</li>
            <li>Glow effect draws attention without being distracting</li>
            <li>Works well at all sizes (responsive)</li>
            <li>Minimal performance impact (no complex animations)</li>
            <li>Aligns with existing Arwes theme aesthetic</li>
          </ul>
        </div>
      </SciFiFrame>
    </Container>
  );
}
