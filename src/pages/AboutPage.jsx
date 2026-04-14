import { Container, Title, Text, Stack, Card, Anchor, Table } from '@mantine/core';

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
    <Container size="md">
      <Title mb="md">About OMNI-CORE</Title>
      <Stack gap="md">
        <Card withBorder p="lg">
          <Title order={3} mb="sm">Project</Title>
          <Text>OMNI-CORE — Citizen Operations & Intelligence Network</Text>
          <Text size="sm" c="dimmed" mt="xs">"Take the helm. Own your success."</Text>
          <Text size="sm" mt="md">
            A comprehensive Star Citizen companion dashboard providing tools, guides, and resources for citizens of the verse.
          </Text>
          <Text size="sm" mt="sm">
            Source: <Anchor href="https://github.com/RyanBayne/OMNI-CORE" target="_blank">github.com/RyanBayne/OMNI-CORE</Anchor>
          </Text>
        </Card>

        <Card withBorder p="lg">
          <Title order={3} mb="sm">Contact</Title>
          <Text size="sm">For feedback, suggestions, or bug reports:</Text>
          <Text size="sm" mt="xs">
            GitHub: <Anchor href="https://github.com/RyanBayne/OMNI-CORE/issues" target="_blank">Open an issue</Anchor>
          </Text>
        </Card>

        <Card withBorder p="lg">
          <Title order={3} mb="sm">Open Source Credits</Title>
          <Text size="sm" c="dimmed" mb="md">
            OMNI-CORE is built on the shoulders of these open-source projects.
          </Text>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Project</Table.Th>
                <Table.Th>Author</Table.Th>
                <Table.Th>License</Table.Th>
                <Table.Th>Role</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {DEPENDENCIES.map((dep) => (
                <Table.Tr key={dep.name}>
                  <Table.Td><Anchor href={dep.url} target="_blank" size="sm">{dep.name}</Anchor></Table.Td>
                  <Table.Td><Text size="sm">{dep.author}</Text></Table.Td>
                  <Table.Td><Text size="sm">{dep.license}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{dep.desc}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        <Card withBorder p="lg">
          <Title order={3} mb="sm">Disclaimer</Title>
          <Text size="sm" c="dimmed">
            OMNI-CORE is a fan-made project and is not affiliated with or endorsed by Cloud Imperium Games. Star Citizen® is a registered trademark of Cloud Imperium Rights LLC.
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
