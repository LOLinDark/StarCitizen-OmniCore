import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconCheck, IconSend } from '@tabler/icons-react';
import { apiPost } from '../platform-core';
import DevTag from '../components/DevTag';

const TEST_STEPS = [
  {
    id: 's1',
    title: 'Start Clean and Connect HOTAS',
    objective: 'Begin from a clean state so results are reproducible for any new user.',
    checks: [
      'Open OmniCore and navigate to Peripheral Config.',
      'Confirm your HOTAS is detected in the live input panel.',
      'Load a known profile (or default baseline profile).',
      'Confirm no browser console errors before binding changes.',
    ],
    expected: 'Live input pulses when pressing controls, and profile loads without warnings.',
  },
  {
    id: 's2',
    title: 'Validate Single HOTAS Baseline',
    objective: 'Verify existing single-mode behavior still works before mode testing.',
    checks: [
      'Keep layout on Single HOTAS.',
      'Assign at least 3 bindings, including one strafe binding.',
      'Refresh the page and confirm bindings persist.',
      'Reload the same profile and confirm bindings still match.',
    ],
    expected: 'Single HOTAS bindings remain stable after refresh and profile reload.',
  },
  {
    id: 's3',
    title: 'Switch to Per-Mode and Seed Green',
    objective: 'Confirm Single HOTAS values seed into Green mode without overwriting existing mode work.',
    checks: [
      'Switch layout to Per-Mode HOTAS.',
      'Inspect Green column and confirm empty Green cells inherit existing Single HOTAS values.',
      'Verify existing non-empty Green bindings are not overwritten.',
      'Confirm Orange and Red remain unchanged unless previously configured.',
    ],
    expected: 'Green receives empty-only seeded values; no mode binding is overwritten.',
  },
  {
    id: 's4',
    title: 'Capture Per-Mode Assignments',
    objective: 'Ensure each mode column accepts unique bindings.',
    checks: [
      'Assign one feature in Green, another in Orange, and another in Red.',
      'Use right-click capture directly on the target mode cell.',
      'Confirm saved badge transitions from saving to saved.',
      'Confirm each mode column keeps distinct values.',
    ],
    expected: 'Mode-specific bindings are independent and save successfully.',
  },
  {
    id: 's5',
    title: 'Cross-View Consistency Check',
    objective: 'Validate that main table and live overlay/input views describe the same assignments.',
    checks: [
      'Set one explicit Orange assignment (example: Hair Trigger to Activate Scanning).',
      'Check HOTAS overlay/input view in M2 and confirm matching assignment text.',
      'Switch to M1 and M3 and confirm mode-appropriate values/fallbacks appear.',
      'Verify key known controls (for example strafe group) remain consistent.',
    ],
    expected: 'Mode-filtered views reflect the same data as the main configuration table.',
  },
  {
    id: 's6',
    title: 'Profile and Reload Resilience',
    objective: 'Ensure no data loss during normal usage patterns.',
    checks: [
      'Switch to a different profile, then back to the test profile.',
      'Refresh browser and reopen the app.',
      'Confirm mode bindings are restored correctly.',
      'Repeat one edit and confirm save status still updates correctly.',
    ],
    expected: 'Mode and single bindings persist through profile switches and reloads.',
  },
  {
    id: 's7',
    title: 'Regression Sweep for Legacy Flow',
    objective: 'Confirm nothing regressed in non-mode workflows.',
    checks: [
      'Return to Single HOTAS layout.',
      'Capture one HOTAS and one keyboard/mouse assignment.',
      'Confirm XML save status appears and returns success for single-mode writes.',
      'Confirm no duplicate or unexpected remaps occurred.',
    ],
    expected: 'Legacy single-mode and keyboard/mouse flows behave as before.',
  },
  {
    id: 's8',
    title: 'Final Community Report',
    objective: 'Submit actionable feedback so maintainers can reproduce and fix issues quickly.',
    checks: [
      'Submit pass/fail notes for each completed step.',
      'For bugs, include exact step, expected behavior, actual behavior, and reproduction notes.',
      'For requests/suggestions, explain use-case and desired UX outcome.',
      'Optionally include contact email for follow-up.',
    ],
    expected: 'Maintainers receive structured, reproducible feedback via GitHub issue or email.',
  },
];

const FEEDBACK_TYPE_OPTIONS = [
  { value: 'pass', label: 'Pass / works as expected' },
  { value: 'bug', label: 'Bug' },
  { value: 'fault', label: 'Fault / broken behavior' },
  { value: 'request', label: 'Feature request' },
  { value: 'suggestion', label: 'Suggestion / UX improvement' },
  { value: 'question', label: 'Question' },
];

const CHANNEL_OPTIONS = [
  { value: 'auto', label: 'Auto (recommended)' },
  { value: 'github', label: 'GitHub issue' },
  { value: 'email', label: 'Email (VerseMail)' },
];

function isIssueType(type) {
  return type === 'bug' || type === 'fault' || type === 'request' || type === 'suggestion';
}

function resolveChannel(channelPreference, type) {
  if (channelPreference === 'github' || channelPreference === 'email') return channelPreference;
  return isIssueType(type) ? 'github' : 'email';
}

function toBugSeverity(type) {
  if (type === 'fault') return 'high';
  if (type === 'bug') return 'medium';
  if (type === 'request' || type === 'suggestion') return 'low';
  return 'low';
}

function makeInitialFormState() {
  return TEST_STEPS.reduce((acc, step) => {
    acc[step.id] = {
      senderHandle: '',
      senderEmail: '',
      type: 'pass',
      channelPreference: 'auto',
      notes: '',
      submitting: false,
      result: null,
    };
    return acc;
  }, {});
}

export default function HOTASCommunityTestingPage() {
  const [forms, setForms] = useState(makeInitialFormState);
  const [activeStepId, setActiveStepId] = useState(TEST_STEPS[0].id);
  const [testerHandle, setTesterHandle] = useState('');
  const [testerEmail, setTesterEmail] = useState('');
  const [submitAllState, setSubmitAllState] = useState({
    submitting: false,
    result: null,
  });

  const completedCount = useMemo(
    () => Object.values(forms).filter((f) => f.result?.ok).length,
    [forms]
  );

  const setField = (stepId, key, value) => {
    setForms((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [key]: value,
      },
    }));
  };

  const submitFeedback = async (step, senderHandleValue, senderEmailValue) => {
    const form = forms[step.id];
    const notes = String(form.notes || '').trim();
    if (!notes) {
      const emptyResult = {
        ok: false,
        message: 'Please add notes before sending feedback.',
      };
      setField(step.id, 'result', emptyResult);
      return emptyResult;
    }

    setField(step.id, 'submitting', true);
    setField(step.id, 'result', null);

    const senderHandle = String(senderHandleValue || '').trim() || 'Community Tester';
    const senderEmail = String(senderEmailValue || '').trim();
    const route = resolveChannel(form.channelPreference, form.type);

    const commonSummary = [
      `Step: ${step.title}`,
      `Step ID: ${step.id}`,
      `Type: ${form.type}`,
      `Objective: ${step.objective}`,
      '',
      'Tester Notes:',
      notes,
    ].join('\n');

    try {
      if (route === 'github') {
        const payload = await apiPost('/api/versemail/bug', {
          senderHandle,
          title: `Community Test ${step.id.toUpperCase()}: ${form.type} - ${step.title}`,
          description: commonSummary,
          severity: toBugSeverity(form.type),
          page: '/hotas-testing-routine',
          steps: step.checks.join('\n'),
        });

        setField(step.id, 'result', {
          ok: true,
          message: payload?.issueUrl
            ? `Submitted to GitHub: ${payload.issueUrl}`
            : 'Submitted to GitHub issue tracker.',
        });
        return {
          ok: true,
          message: payload?.issueUrl
            ? `Submitted to GitHub: ${payload.issueUrl}`
            : 'Submitted to GitHub issue tracker.',
        };
      } else {
        const category = form.type === 'request' || form.type === 'suggestion'
          ? 'feature-request'
          : 'feedback';

        const payload = await apiPost('/api/versemail/contact', {
          senderName: senderHandle,
          senderEmail,
          category,
          subject: `Community Test ${step.id.toUpperCase()}: ${form.type} - ${step.title}`,
          message: commonSummary,
        });

        const delivered = payload?.delivered;
        setField(step.id, 'result', {
          ok: true,
          message: delivered
            ? 'Feedback delivered by email.'
            : 'Feedback queued (SMTP offline).',
        });
        return {
          ok: true,
          message: delivered
            ? 'Feedback delivered by email.'
            : 'Feedback queued (SMTP offline).',
        };
      }
    } catch (error) {
      if (route === 'github') {
        try {
          const fallbackPayload = await apiPost('/api/versemail/contact', {
            senderName: senderHandle,
            senderEmail,
            category: 'feedback',
            subject: `Fallback from GitHub - Community Test ${step.id.toUpperCase()}: ${form.type}`,
            message: `${commonSummary}\n\nGitHub submission failed: ${error?.message || 'Unknown error'}`,
          });

          setField(step.id, 'result', {
            ok: true,
            message: fallbackPayload?.delivered
              ? 'GitHub failed, but fallback email was delivered.'
              : 'GitHub failed, fallback email queued (SMTP offline).',
          });
          return {
            ok: true,
            message: fallbackPayload?.delivered
              ? 'GitHub failed, but fallback email was delivered.'
              : 'GitHub failed, fallback email queued (SMTP offline).',
          };
        } catch (fallbackError) {
          const failedResult = {
            ok: false,
            message: fallbackError?.message || error?.message || 'Failed to submit feedback.',
          };
          setField(step.id, 'result', failedResult);
          return failedResult;
        }
      } else {
        const failedResult = {
          ok: false,
          message: error?.message || 'Failed to submit feedback.',
        };
        setField(step.id, 'result', failedResult);
        return failedResult;
      }
    } finally {
      setField(step.id, 'submitting', false);
    }

    return {
      ok: false,
      message: 'Unexpected submission state.',
    };
  };

  const submitAllFeedback = async () => {
    const stepsToSubmit = TEST_STEPS.filter((step) => String(forms[step.id]?.notes || '').trim());

    if (stepsToSubmit.length === 0) {
      setSubmitAllState({
        submitting: false,
        result: { ok: false, message: 'Add feedback notes to at least one step before submitting.' },
      });
      return;
    }

    setSubmitAllState({ submitting: true, result: null });

    const senderHandleValue = String(testerHandle || '').trim();
    const senderEmailValue = String(testerEmail || '').trim();

    let okCount = 0;
    let failCount = 0;

    for (const step of stepsToSubmit) {
      // eslint-disable-next-line no-await-in-loop
      const result = await submitFeedback(step, senderHandleValue, senderEmailValue);
      if (result?.ok) okCount += 1;
      else failCount += 1;
    }

    setSubmitAllState({
      submitting: false,
      result: failCount === 0
        ? { ok: true, message: `Submitted ${okCount} step report(s) successfully.` }
        : { ok: false, message: `Submitted ${okCount} step report(s), ${failCount} failed. Review per-step messages below.` },
    });
  };

  return (
    <Stack gap="xl">
      <div>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          <DevTag tag="HC10" />HOTAS Community Testing Routine
        </h1>
        <Text c="dimmed">
          A complete step-by-step validation flow for new users. Each card includes what to test, expected outcomes, and direct feedback submission.
        </Text>
      </div>

      <Alert color="cyan" variant="light" title="How this guide works">
        Use the step cards in order. Submit feedback on each step as Pass, Bug, Fault, Request, or Suggestion.
        Auto channel routes issue-like reports to GitHub and other feedback to email.
      </Alert>

      <Group justify="space-between" align="center">
        <Badge color="cyan" variant="light" size="lg">
          {completedCount}/{TEST_STEPS.length} step reports submitted
        </Badge>
        <SegmentedControl
          value={activeStepId}
          onChange={setActiveStepId}
          data={TEST_STEPS.map((step, index) => ({
            value: step.id,
            label: `Step ${index + 1}`,
          }))}
          size="xs"
        />
      </Group>

      <Stack gap="md">
        {TEST_STEPS.map((step, index) => {
          const form = forms[step.id];
          const isActive = step.id === activeStepId;

          return (
            <Card
              key={step.id}
              withBorder
              radius="md"
              padding="lg"
              style={{
                background: isActive ? 'rgba(0, 217, 255, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                borderColor: isActive ? 'rgba(0, 217, 255, 0.35)' : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <Group justify="space-between" align="flex-start" mb="xs">
                <Stack gap={2}>
                  <Group gap="xs" align="center">
                    <Badge color="blue" variant="filled">Step {index + 1}</Badge>
                    {form.result?.ok && (
                      <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
                        Report sent
                      </Badge>
                    )}
                  </Group>
                  <Title order={4}>{step.title}</Title>
                </Stack>
              </Group>

              <Text size="sm" mb="sm" c="dimmed">
                <strong>Objective:</strong> {step.objective}
              </Text>

              <Box mb="sm">
                {step.checks.map((item) => (
                  <Text key={item} size="sm" c="#d7e3ef" mb={4}>
                    • {item}
                  </Text>
                ))}
              </Box>

              <Text size="sm" mb="md" c="#8de3ff">
                <strong>Expected:</strong> {step.expected}
              </Text>

              <Stack gap="sm">
                {index === 0 && (
                  <Group grow align="flex-start">
                    <TextInput
                      label="Your handle"
                      placeholder="Community Tester"
                      value={testerHandle}
                      onChange={(e) => setTesterHandle(e.currentTarget.value)}
                      maxLength={80}
                    />
                    <TextInput
                      label="Reply email (optional)"
                      placeholder="you@example.com"
                      value={testerEmail}
                      onChange={(e) => setTesterEmail(e.currentTarget.value)}
                      maxLength={254}
                    />
                  </Group>
                )}

                <Group grow align="flex-start">
                  <Select
                    label="Feedback type"
                    data={FEEDBACK_TYPE_OPTIONS}
                    value={form.type}
                    onChange={(value) => setField(step.id, 'type', value || 'pass')}
                    allowDeselect={false}
                  />
                  <Select
                    label="Send channel"
                    data={CHANNEL_OPTIONS}
                    value={form.channelPreference}
                    onChange={(value) => setField(step.id, 'channelPreference', value || 'auto')}
                    allowDeselect={false}
                  />
                </Group>

                <Textarea
                  label="Step feedback"
                  placeholder="What happened, what you expected, and how to reproduce if needed..."
                  minRows={3}
                  maxRows={8}
                  value={form.notes}
                  onChange={(e) => setField(step.id, 'notes', e.currentTarget.value)}
                  maxLength={4000}
                />

                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed">
                    {form.notes.length}/4000
                  </Text>
                </Group>

                {form.result && (
                  <Alert color={form.result.ok ? 'green' : 'red'} variant="light">
                    {form.result.message}
                  </Alert>
                )}
              </Stack>
            </Card>
          );
        })}
      </Stack>

      <Card withBorder radius="md" padding="lg" style={{ background: 'rgba(0, 217, 255, 0.04)', borderColor: 'rgba(0, 217, 255, 0.25)' }}>
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Submit all steps with notes in one action. Sender identity from Step 1 is reused for every report.
          </Text>
          <Button
            leftSection={<IconSend size={14} />}
            onClick={submitAllFeedback}
            loading={submitAllState.submitting}
          >
            Submit All Feedback
          </Button>
        </Group>
        {submitAllState.result && (
          <Alert mt="md" color={submitAllState.result.ok ? 'green' : 'red'} variant="light">
            {submitAllState.result.message}
          </Alert>
        )}
      </Card>
    </Stack>
  );
}
