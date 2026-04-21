import { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Tabs,
  Badge,
  Divider,
  Alert,
} from '@mantine/core';
import {
  IconMail,
  IconBug,
  IconSend,
  IconAlertTriangle,
  IconCheck,
  IconLock,
  IconWifi,
} from '@tabler/icons-react';
import { apiPost } from '../platform-core';

// ── Shared styles ─────────────────────────────────────────────────────────────

const INPUT_STYLES = {
  input: {
    background: 'rgba(0,10,30,0.8)',
    border: '1px solid rgba(0,217,255,0.25)',
    color: '#c8dae8',
    fontFamily: 'monospace',
    '&:focus': { borderColor: 'rgba(0,217,255,0.6)' },
  },
  label: { color: '#7a9ab0', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' },
};

// ── Contact form ──────────────────────────────────────────────────────────────

function ContactForm({ onClose }) {
  const [fields, setFields] = useState({
    senderName: '',
    senderEmail: '',
    category: 'general',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, error }

  function set(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSend() {
    if (!fields.senderName.trim() || !fields.subject.trim() || !fields.message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await apiPost('/api/versemail/contact', fields);
      setResult({ ok: true, delivered: data.delivered });
    } catch (err) {
      setResult({ ok: false, error: err.message || 'Transmission failed' });
    } finally {
      setLoading(false);
    }
  }

  if (result?.ok) {
    return (
      <Stack gap="md" align="center" py="xl">
        <IconCheck size={48} color="#22d17b" />
        <Text size="lg" fw={700} style={{ color: '#22d17b', letterSpacing: '0.1em' }}>
          TRANSMISSION SENT
        </Text>
        <Text c="dimmed" size="sm" ta="center">
          Your message has been routed through the quantum relay network.
          {!result.delivered && (
            <><br /><span style={{ color: '#ffb648' }}>Note: SMTP relay offline — message queued locally.</span></>
          )}
        </Text>
        <Button variant="outline" color="cyan" onClick={onClose}>
          Close Channel
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Group gap="sm">
        <TextInput
          label="Sender Handle"
          placeholder="Your name or Citizen handle"
          value={fields.senderName}
          onChange={(e) => set('senderName', e.currentTarget.value)}
          maxLength={80}
          required
          styles={INPUT_STYLES}
          style={{ flex: 1 }}
        />
        <TextInput
          label="Reply Address (optional)"
          placeholder="your@email.com"
          value={fields.senderEmail}
          onChange={(e) => set('senderEmail', e.currentTarget.value)}
          maxLength={254}
          styles={INPUT_STYLES}
          style={{ flex: 1 }}
        />
      </Group>

      <Group gap="sm">
        <Select
          label="Category"
          data={[
            { value: 'general', label: 'General Enquiry' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'feature-request', label: 'Feature Request' },
            { value: 'partnership', label: 'Partnership' },
            { value: 'other', label: 'Other' },
          ]}
          value={fields.category}
          onChange={(v) => set('category', v || 'general')}
          styles={INPUT_STYLES}
          style={{ minWidth: 180 }}
        />
        <TextInput
          label="Subject"
          placeholder="Transmission subject"
          value={fields.subject}
          onChange={(e) => set('subject', e.currentTarget.value)}
          maxLength={120}
          required
          styles={INPUT_STYLES}
          style={{ flex: 1 }}
        />
      </Group>

      <Textarea
        label="Message"
        placeholder="Compose your transmission…"
        value={fields.message}
        onChange={(e) => set('message', e.currentTarget.value)}
        minRows={5}
        maxRows={10}
        maxLength={4000}
        required
        styles={INPUT_STYLES}
      />

      <Group justify="space-between" align="center" mt="xs">
        <Text size="xs" c="dimmed">
          {fields.message.length} / 4000
        </Text>
        {result?.error && (
          <Text size="xs" c="red">{result.error}</Text>
        )}
        <Button
          leftSection={<IconSend size={14} />}
          color="cyan"
          variant="filled"
          onClick={handleSend}
          loading={loading}
          disabled={!fields.senderName.trim() || !fields.subject.trim() || !fields.message.trim()}
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}
        >
          Send Transmission
        </Button>
      </Group>
    </Stack>
  );
}

// ── Bug report form ────────────────────────────────────────────────────────────

function BugReportForm({ onClose }) {
  const [fields, setFields] = useState({
    senderHandle: '',
    title: '',
    description: '',
    severity: 'medium',
    page: '',
    steps: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function set(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!fields.title.trim() || !fields.description.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await apiPost('/api/versemail/bug', fields);
      setResult({ ok: true, issueNumber: data.issueNumber, issueUrl: data.issueUrl });
    } catch (err) {
      setResult({ ok: false, error: err.message || 'Anomaly report failed' });
    } finally {
      setLoading(false);
    }
  }

  if (result?.ok) {
    return (
      <Stack gap="md" align="center" py="xl">
        <IconBug size={48} color="#22d17b" />
        <Text size="lg" fw={700} style={{ color: '#22d17b', letterSpacing: '0.1em' }}>
          ANOMALY LOGGED
        </Text>
        <Text c="dimmed" size="sm" ta="center">
          Issue #{result.issueNumber} has been filed to mission control.
        </Text>
        {result.issueUrl && (
          <Button
            component="a"
            href={result.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            color="cyan"
            size="xs"
          >
            View Issue on GitHub
          </Button>
        )}
        <Button variant="subtle" color="gray" onClick={onClose}>
          Close Channel
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Alert
        icon={<IconAlertTriangle size={14} />}
        color="orange"
        variant="light"
        styles={{ message: { fontSize: '0.8rem', fontFamily: 'monospace' } }}
      >
        Anomaly reports are filed directly to mission control as GitHub issues. Include as much detail as possible.
      </Alert>

      <Group gap="sm">
        <TextInput
          label="Your Handle (optional)"
          placeholder="Citizen handle"
          value={fields.senderHandle}
          onChange={(e) => set('senderHandle', e.currentTarget.value)}
          maxLength={80}
          styles={INPUT_STYLES}
          style={{ flex: 1 }}
        />
        <Select
          label="Severity"
          data={[
            { value: 'low', label: '🟢 Low' },
            { value: 'medium', label: '🟡 Medium' },
            { value: 'high', label: '🟠 High' },
            { value: 'critical', label: '🔴 Critical' },
          ]}
          value={fields.severity}
          onChange={(v) => set('severity', v || 'medium')}
          styles={INPUT_STYLES}
          style={{ minWidth: 160 }}
        />
      </Group>

      <TextInput
        label="Anomaly Title"
        placeholder="Brief summary of the issue"
        value={fields.title}
        onChange={(e) => set('title', e.currentTarget.value)}
        maxLength={120}
        required
        styles={INPUT_STYLES}
      />

      <TextInput
        label="Page / Section (optional)"
        placeholder="e.g. Ship Database, Nav Charts"
        value={fields.page}
        onChange={(e) => set('page', e.currentTarget.value)}
        maxLength={200}
        styles={INPUT_STYLES}
      />

      <Textarea
        label="Description"
        placeholder="What went wrong? What did you expect to happen?"
        value={fields.description}
        onChange={(e) => set('description', e.currentTarget.value)}
        minRows={4}
        maxRows={8}
        maxLength={4000}
        required
        styles={INPUT_STYLES}
      />

      <Textarea
        label="Steps to Reproduce (optional)"
        placeholder="1. Open Ship Database&#10;2. Click on a ship&#10;3. …"
        value={fields.steps}
        onChange={(e) => set('steps', e.currentTarget.value)}
        minRows={3}
        maxRows={6}
        maxLength={4000}
        styles={INPUT_STYLES}
      />

      <Group justify="space-between" align="center" mt="xs">
        <Text size="xs" c="dimmed">
          {fields.description.length} / 4000
        </Text>
        {result?.error && (
          <Text size="xs" c="red">{result.error}</Text>
        )}
        <Button
          leftSection={<IconBug size={14} />}
          color="orange"
          variant="filled"
          onClick={handleSubmit}
          loading={loading}
          disabled={!fields.title.trim() || !fields.description.trim()}
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}
        >
          File Anomaly Report
        </Button>
      </Group>
    </Stack>
  );
}

// ── VerseMail modal ────────────────────────────────────────────────────────────

export default function VerseMail({ opened, onClose, defaultTab = 'contact' }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding={0}
      withCloseButton={false}
      styles={{
        content: {
          background: 'rgba(2, 8, 25, 0.97)',
          border: '1px solid rgba(0,217,255,0.3)',
          borderRadius: 8,
          overflow: 'hidden',
        },
        overlay: {
          backdropFilter: 'blur(4px)',
          background: 'rgba(0,0,0,0.6)',
        },
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(0,217,255,0.08) 0%, rgba(0,217,255,0.02) 100%)',
          borderBottom: '1px solid rgba(0,217,255,0.2)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Group gap="sm">
          <IconMail size={16} color="#00d9ff" />
          <Text
            fw={700}
            size="sm"
            style={{
              color: '#00d9ff',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            VerseMail
          </Text>
          <Badge
            size="xs"
            color="green"
            variant="dot"
            style={{ fontFamily: 'monospace' }}
          >
            Quantum Relay Online
          </Badge>
        </Group>
        <Group gap="xs">
          <Group gap={4}>
            <IconLock size={10} color="#22d17b" />
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              END-TO-END ENCRYPTED
            </Text>
          </Group>
          <Group gap={4}>
            <IconWifi size={10} color="#22d17b" />
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              STANTON RELAY
            </Text>
          </Group>
          <button
            onClick={onClose}
            aria-label="Close VerseMail"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(200,218,232,0.5)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
              padding: '0 0 0 8px',
            }}
          >
            ✕
          </button>
        </Group>
      </div>

      {/* Tab bar + body */}
      <Tabs defaultValue={defaultTab} style={{ padding: 0 }}>
        <Tabs.List
          style={{
            background: 'rgba(0,0,0,0.4)',
            borderBottom: '1px solid rgba(0,217,255,0.15)',
            padding: '0 20px',
            gap: 0,
          }}
        >
          <Tabs.Tab
            value="contact"
            leftSection={<IconMail size={13} />}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#7a9ab0',
            }}
          >
            New Transmission
          </Tabs.Tab>
          <Tabs.Tab
            value="bug"
            leftSection={<IconBug size={13} />}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#7a9ab0',
            }}
          >
            Report Anomaly
          </Tabs.Tab>
        </Tabs.List>

        <div style={{ padding: '20px' }}>
          <Tabs.Panel value="contact">
            <ContactForm onClose={onClose} />
          </Tabs.Panel>
          <Tabs.Panel value="bug">
            <BugReportForm onClose={onClose} />
          </Tabs.Panel>
        </div>
      </Tabs>

      {/* Footer bar */}
      <Divider style={{ borderColor: 'rgba(0,217,255,0.1)' }} />
      <div
        style={{
          padding: '8px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
          OmniCore VerseMail v1.0 — Secure Citizen Relay Network
        </Text>
        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
          UEE-2954
        </Text>
      </div>
    </Modal>
  );
}
