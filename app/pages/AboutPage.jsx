import { Container, Stack, Text, Anchor, Table } from '@mantine/core';
import { SciFiFrame } from '../components/ui';
import DevTag from '../components/DevTag';

const DEPENDENCIES = [
  { name: 'Arwes', author: 'Romel Pérez', url: 'https://github.com/arwes/arwes', license: 'MIT', desc: 'Futuristic Sci-Fi UI Web Framework — frames, text effects, backgrounds' },
  { name: 'Mantine', author: 'Vitaly Rtishchev', url: 'https://github.com/mantinedev/mantine', license: 'MIT', desc: 'React component library — layout, forms, data display' },
  { name: 'React', author: 'Meta', url: 'https://github.com/facebook/react', license: 'MIT', desc: 'UI framework' },
  { name: 'Vite', author: 'Evan You', url: 'https://github.com/vitejs/vite', license: 'MIT', desc: 'Build tool and dev server' },
  { name: 'Express', author: 'TJ Holowaychuk', url: 'https://github.com/expressjs/express', license: 'MIT', desc: 'Backend API server' },
  { name: 'Google Generative AI', author: 'Google', url: 'https://github.com/google/generative-ai-js', license: 'Apache-2.0', desc: 'Gemini AI integration' },
  { name: 'AWS Bedrock SDK', author: 'Amazon Web Services', url: 'https://github.com/aws/aws-sdk-js-v3', license: 'Apache-2.0', desc: 'Claude AI integration via AWS Bedrock' },
];

export default function AboutPage() {
  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="scifi-heading" style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>
          <DevTag tag="ADM05" />About OMNI-CORE
        </h1>
        <Text c="dimmed" size="sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Citizen Operations & Intelligence Network
        </Text>
      </div>

      <Stack gap="lg">
        <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Project
            </h2>
            <Text size="sm" mb="xs">
              OMNI-CORE — Citizen Operations & Intelligence Network
            </Text>
            <Text size="sm" c="dimmed" mb="md" style={{ fontStyle: 'italic' }}>
              "Take the helm. Own your success."
            </Text>
            <Text size="sm" mb="md">
              A comprehensive Star Citizen companion dashboard providing tools, guides, and resources for citizens of the verse.
            </Text>
            <Text size="sm">
              Source: <Anchor href="https://github.com/RyanBayne/OMNI-CORE" target="_blank" rel="noreferrer">github.com/RyanBayne/OMNI-CORE</Anchor>
            </Text>
          </div>
        </SciFiFrame>

        <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vision & Motivation
            </h2>
            <Text size="sm" mb="md">
              As a Star Citizen backer since 2013, I've watched Cloud Imperium Games build an impressive scope of tools and systems. But there's always room for innovation in how we play.
            </Text>
            <Text size="sm" mb="md">
              After taking a break from the game and returning to master flying mechanics, I found HOTAS configuration tedious. Most games struggle here. Rather than accept those limitations, I built a tool to directly edit the game's XML configuration files, backup to GitHub or Google Drive, and manage profiles effortlessly.
            </Text>
            <Text size="sm" mb="md">
              From there, the vision expanded: <strong style={{ color: '#22d17b' }}>What if OmniCore could become an operating system for how I play Star Citizen?</strong>
            </Text>
            <Text size="sm" style={{ color: '#aaa' }} mb="md">
              <strong>Planned Features:</strong>
            </Text>
            <div style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
              <Text size="sm" mb="xs" c="dimmed">• <strong>Fleet Management</strong> — Track your hangar, manage loadouts per ship, visualize your collection</Text>
              <Text size="sm" mb="xs" c="dimmed">• <strong>Career Tracking</strong> — Monitor playtime, contract history, and progression</Text>
              <Text size="sm" mb="xs" c="dimmed">• <strong>Advanced HOTAS</strong> — Full support for multi-mode controllers like the X52's 3-position switch, with pre-built profiles and seamless XML sync</Text>
              <Text size="sm" mb="xs" c="dimmed">• <strong>Mobile App</strong> — PWA today, native Android app tomorrow</Text>
            </div>
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              Preparing for Squadron 42's release and ready to enhance how we fly.
            </Text>
          </div>
        </SciFiFrame>

        <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ color: '#00ff88', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact & Feedback
            </h2>
            <Text size="sm" mb="md">For feedback, suggestions, or bug reports:</Text>
            <Text size="sm">
              GitHub: <Anchor href="https://github.com/RyanBayne/OMNI-CORE/issues" target="_blank" rel="noreferrer">Open an issue</Anchor>
            </Text>
          </div>
        </SciFiFrame>

        <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ color: '#ffd166', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Open Source Credits
            </h2>
            <Text size="sm" c="dimmed" mb="md">
              OMNI-CORE is built on the shoulders of these open-source projects.
            </Text>
            <div style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover style={{ fontSize: '0.85rem' }}>
                <Table.Thead>
                  <Table.Tr style={{ borderBottomColor: 'rgba(0, 217, 255, 0.2)' }}>
                    <Table.Th style={{ color: '#00d9ff' }}>Project</Table.Th>
                    <Table.Th style={{ color: '#00d9ff' }}>Author</Table.Th>
                    <Table.Th style={{ color: '#00d9ff' }}>License</Table.Th>
                    <Table.Th style={{ color: '#00d9ff' }}>Role</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {DEPENDENCIES.map((dep) => (
                    <Table.Tr key={dep.name} style={{ borderBottomColor: 'rgba(0, 217, 255, 0.1)' }}>
                      <Table.Td><Anchor href={dep.url} target="_blank" rel="noreferrer" size="sm">{dep.name}</Anchor></Table.Td>
                      <Table.Td><Text size="sm">{dep.author}</Text></Table.Td>
                      <Table.Td><Text size="sm">{dep.license}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{dep.desc}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </div>
        </SciFiFrame>

        <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ color: '#b300ff', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Map Data Confidence & Fog
            </h2>
            <Text size="sm" c="dimmed" mb="md">
              Some map overlays are based on incomplete or stale data. OmniCore uses confidence scoring to show how trustworthy each point is.
            </Text>
            <Text size="sm">
              <strong style={{ color: '#00d9ff' }}>Confidence Fog</strong> is a visual uncertainty layer: low-confidence points appear hazier, while high-confidence points remain clear.
              This helps you distinguish known topology from inferred operational signals.
            </Text>
          </div>
        </SciFiFrame>

        <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1.5} padding={0}>
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ color: '#ff0055', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Disclaimer
            </h2>
            <Text size="sm" c="dimmed">
              OMNI-CORE is a fan-made project and is not affiliated with or endorsed by Cloud Imperium Games. Star Citizen® is a registered trademark of Cloud Imperium Rights LLC.
            </Text>
          </div>
        </SciFiFrame>
      </Stack>
    </Container>
  );
}
