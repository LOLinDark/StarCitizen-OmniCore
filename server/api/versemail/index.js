/**
 * VerseMail API
 *
 * Two endpoints:
 *   POST /api/versemail/contact   — sends an email to the owner via SMTP
 *   POST /api/versemail/bug       — creates a GitHub issue on the project repo
 *
 * Required env vars:
 *   SMTP_HOST        e.g. smtp.gmail.com
 *   SMTP_PORT        e.g. 587
 *   SMTP_USER        SMTP login username
 *   SMTP_PASS        SMTP login password / app-password
 *   CONTACT_EMAIL    Destination address (defaults to omnicore@ryanbayne.uk)
 *   GITHUB_TOKEN     Personal access token with repo:issues scope
 *
 * SECURITY: All user inputs are validated and length-capped before use.
 *           GitHub token and SMTP credentials are never exposed to the client.
 */
import nodemailer from 'nodemailer';
import { createLogger } from '../../lib/logger.js';

const logger = createLogger('api.versemail');

const GITHUB_REPO   = 'LOLinDark/StarCitizen-OmniCore';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'omnicore@ryanbayne.uk';

// Input length caps
const MAX_NAME    = 80;
const MAX_SUBJECT = 120;
const MAX_BODY    = 4000;
const MAX_EMAIL   = 254;

// Allowed category values for contact form
const CONTACT_CATEGORIES = new Set([
  'general', 'feedback', 'feature-request', 'partnership', 'other',
]);

// Allowed severity values for bug reports
const BUG_SEVERITIES = new Set(['low', 'medium', 'high', 'critical']);

// ── Validation helpers ────────────────────────────────────────────────────────

function sanitize(str, max) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, max);
}

function isValidEmail(str) {
  // Basic structural check — not a full RFC validator
  return typeof str === 'string' && /^[^\s@]{1,64}@[^\s@]{1,255}$/.test(str);
}

// ── SMTP transporter (lazy-initialised) ──────────────────────────────────────

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

// ── GitHub issue creation ─────────────────────────────────────────────────────

async function createGitHubIssue({ title, body, labels }) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'OmniCore-VerseMail/1.0',
    },
    body: JSON.stringify({ title, body, labels }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    logger.error(`GitHub issue creation failed: ${response.status} ${text.slice(0, 200)}`);
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleContact(req, res) {
  const senderName  = sanitize(req.body?.senderName  || '', MAX_NAME);
  const senderEmail = sanitize(req.body?.senderEmail || '', MAX_EMAIL);
  const category    = sanitize(req.body?.category    || 'general', 40);
  const subject     = sanitize(req.body?.subject     || '', MAX_SUBJECT);
  const message     = sanitize(req.body?.message     || '', MAX_BODY);

  if (!senderName)  return res.status(400).json({ error: 'Sender name is required' });
  if (!message)     return res.status(400).json({ error: 'Message body is required' });
  if (!subject)     return res.status(400).json({ error: 'Subject is required' });
  if (senderEmail && !isValidEmail(senderEmail)) {
    return res.status(400).json({ error: 'Invalid sender email address' });
  }
  if (!CONTACT_CATEGORIES.has(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const transporter = getTransporter();

  if (!transporter) {
    // SMTP not configured — log and return partial success so UX isn't broken in dev
    logger.warn('SMTP not configured — contact form submission logged only');
    logger.info(`[VerseMail] Contact | From: ${senderName} <${senderEmail}> | Subject: ${subject}`);
    return res.json({ ok: true, delivered: false, reason: 'smtp_not_configured' });
  }

  const emailHtml = `
    <div style="font-family:monospace;background:#050a18;color:#c8dae8;padding:24px;border-radius:6px;border:1px solid #1a3a5c;">
      <h2 style="color:#22d17b;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 16px">
        VerseMail Transmission Received
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#7a9ab0;padding:4px 12px 4px 0;white-space:nowrap;">From</td><td>${senderName}${senderEmail ? ` &lt;${senderEmail}&gt;` : ''}</td></tr>
        <tr><td style="color:#7a9ab0;padding:4px 12px 4px 0;">Category</td><td>${category}</td></tr>
        <tr><td style="color:#7a9ab0;padding:4px 12px 4px 0;">Subject</td><td>${subject}</td></tr>
      </table>
      <hr style="border-color:#1a3a5c;margin:16px 0;">
      <pre style="white-space:pre-wrap;line-height:1.6;">${message}</pre>
    </div>
  `;

  await transporter.sendMail({
    from: `"OmniCore VerseMail" <${process.env.SMTP_USER}>`,
    to: CONTACT_EMAIL,
    replyTo: senderEmail || undefined,
    subject: `[VerseMail] ${subject}`,
    html: emailHtml,
    text: `From: ${senderName}\nCategory: ${category}\nSubject: ${subject}\n\n${message}`,
  });

  logger.info(`[VerseMail] Contact delivered | Subject: ${subject}`);
  return res.json({ ok: true, delivered: true });
}

async function handleBugReport(req, res) {
  const senderHandle = sanitize(req.body?.senderHandle || 'Anonymous', MAX_NAME);
  const title        = sanitize(req.body?.title        || '', MAX_SUBJECT);
  const description  = sanitize(req.body?.description  || '', MAX_BODY);
  const severity     = sanitize(req.body?.severity     || 'medium', 20);
  const page         = sanitize(req.body?.page         || '', 200);
  const steps        = sanitize(req.body?.steps        || '', MAX_BODY);

  if (!title)       return res.status(400).json({ error: 'Bug title is required' });
  if (!description) return res.status(400).json({ error: 'Bug description is required' });
  if (!BUG_SEVERITIES.has(severity)) {
    return res.status(400).json({ error: 'Invalid severity level' });
  }

  const severityEmoji = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }[severity] || '⚪';
  const issueBody = [
    `## Bug Report — submitted via VerseMail`,
    '',
    `**Reported by:** ${senderHandle}`,
    `**Severity:** ${severityEmoji} ${severity.toUpperCase()}`,
    page ? `**Page / Section:** ${page}` : '',
    '',
    `## Description`,
    description,
    steps ? `\n## Steps to Reproduce\n${steps}` : '',
    '',
    `---`,
    `*Auto-filed by OmniCore VerseMail*`,
  ].filter((l) => l !== null).join('\n');

  const labels = ['bug', `severity:${severity}`];

  const issue = await createGitHubIssue({
    title: `[Bug] ${title}`,
    body: issueBody,
    labels,
  });

  logger.info(`[VerseMail] Bug filed | Issue #${issue.number} | ${title}`);
  return res.json({ ok: true, issueNumber: issue.number, issueUrl: issue.html_url });
}

// ── Route registration ────────────────────────────────────────────────────────

export function registerVersemailRoutes(app) {
  app.post('/api/versemail/contact', async (req, res) => {
    try {
      await handleContact(req, res);
    } catch (err) {
      logger.error(`VerseMail contact error: ${err.message}`);
      res.status(500).json({ error: 'Failed to send transmission. Please try again.' });
    }
  });

  app.post('/api/versemail/bug', async (req, res) => {
    try {
      await handleBugReport(req, res);
    } catch (err) {
      logger.error(`VerseMail bug report error: ${err.message}`);
      res.status(500).json({ error: 'Failed to file anomaly report. Please try again.' });
    }
  });

  logger.info('VerseMail routes registered');
}
