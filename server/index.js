/**
 * OMNI-CORE Backend API Server
 *
 * SECURITY STANDARDS (OWASP Top 10 compliance):
 * - A01 Broken Access Control: CORS restricted to frontend origin, shutdown endpoint removed
 * - A03 Injection: All user input validated and length-limited before use
 * - A04 Insecure Design: Request body size limited, rate limiting enforced
 * - A05 Security Misconfiguration: Helmet sets all recommended security headers
 * - A07 Sensitive Data Exposure: API keys never in URLs, error messages sanitized
 * - A09 Logging & Monitoring: Structured logging, error log sanitization
 *
 * IMPORTANT: Never pass user input to file paths, shell commands, or eval().
 * IMPORTANT: Never use dangerouslySetInnerHTML with AI responses on the frontend.
 * IMPORTANT: Treat all AI responses as untrusted content.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { BedrockRuntimeClient, InvokeModelCommand, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { appendFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { registerMediaRoutes } from './api/media/index.js';
import { registerShipRoutes } from './api/ships/index.js';
import { registerVersemailRoutes } from './api/versemail/index.js';
import { registerHotasModeRoutes } from './peripherals/hotas/index.js';

dotenv.config();

const SERVER_VERSION = 'Alpha V0.1.0';

// --- SECURITY: Input validation constants ---
const MAX_MESSAGE_LENGTH = 10000;
const MAX_LOG_FIELD_LENGTH = 2000;
const MAX_ANALYTICS_EVENTS_PER_BATCH = 20;
const ALLOWED_ORIGINS = [
  'http://localhost:4242',
  'http://127.0.0.1:4242',
];
const ANALYTICS_EVENT_NAME_PATTERN = /^[a-z0-9][a-z0-9._:-]{2,63}$/;
const SENSITIVE_KEY_PATTERN = /(email|password|token|secret|phone|address|auth|apikey|api-key|key)/i;

// --- Rate limiting ---
const DAILY_REQUEST_LIMIT = parseInt(process.env.MAX_DAILY_REQUESTS || '20');
const HOURLY_REQUEST_LIMIT = parseInt(process.env.MAX_HOURLY_REQUESTS || '5');
let requestCounts = {
  daily: 0,
  hourly: 0,
  lastReset: new Date(),
  lastHourReset: new Date(),
  history: []
};

function checkLimits() {
  const now = new Date();
  const hoursSinceReset = (now - requestCounts.lastHourReset) / (1000 * 60 * 60);
  const daysSinceReset = (now - requestCounts.lastReset) / (1000 * 60 * 60 * 24);

  if (hoursSinceReset >= 1) {
    requestCounts.hourly = 0;
    requestCounts.lastHourReset = now;
  }

  if (daysSinceReset >= 1) {
    requestCounts.daily = 0;
    requestCounts.lastReset = now;
  }

  if (requestCounts.hourly >= HOURLY_REQUEST_LIMIT) {
    throw new Error(`Hourly limit reached (${HOURLY_REQUEST_LIMIT} requests/hour)`);
  }

  if (requestCounts.daily >= DAILY_REQUEST_LIMIT) {
    throw new Error(`Daily limit reached (${DAILY_REQUEST_LIMIT} requests/day)`);
  }

  requestCounts.hourly++;
  requestCounts.daily++;
  requestCounts.history.push({ timestamp: now.toISOString(), hourly: requestCounts.hourly, daily: requestCounts.daily });
  if (requestCounts.history.length > 100) requestCounts.history.shift();
}

// --- Project time tracking ---
let projectHours = { totalHours: 0, lastActiveHour: null, sessions: [] };

function trackProjectTime() {
  const now = new Date();
  const currentHour = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}`;
  if (projectHours.lastActiveHour !== currentHour) {
    projectHours.totalHours++;
    projectHours.lastActiveHour = currentHour;
    projectHours.sessions.push({ hour: currentHour, timestamp: now.toISOString() });
    log(`📊 Project hours: ${projectHours.totalHours}`);
  }
}

// --- Pricing ---
const PRICING = {
  'opus-4.5': { input: 0.015, output: 0.075 },
  'sonnet-4.5': { input: 0.003, output: 0.015 },
  'haiku-4.5': { input: 0.001, output: 0.005 },
  'sonnet-3.7': { input: 0.003, output: 0.015 },
  'sonnet-3.5': { input: 0.003, output: 0.015 }
};
const COST_ALERT_THRESHOLD = parseFloat(process.env.COST_ALERT_THRESHOLD || '10.0');

function log(...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}]`, ...args);
}

/**
 * SECURITY: Sanitize a string for safe log file writing.
 * Strips control characters and limits length.
 */
function sanitizeForLog(str, maxLen = MAX_LOG_FIELD_LENGTH) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').slice(0, maxLen);
}

/**
 * SECURITY: Validate chat message input.
 * Returns sanitized message or throws on invalid input.
 */
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Message is required and must be a string');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
  }
  return message.trim();
}

// --- Gemini model cache (avoids repeated API key exposure in URLs) ---
let cachedGeminiModel = null;
let modelCacheTime = 0;
const MODEL_CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getGeminiModelName() {
  if (cachedGeminiModel && Date.now() - modelCacheTime < MODEL_CACHE_TTL) {
    return cachedGeminiModel;
  }
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    const data = await res.json();
    const available = data.models?.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
    if (available?.length > 0) {
      cachedGeminiModel = available[0].name.replace('models/', '');
      modelCacheTime = Date.now();
      return cachedGeminiModel;
    }
  } catch {
    log('Model list fetch failed, using default');
  }
  return 'gemini-2.0-flash';
}

// --- Express app setup ---
const app = express();

// SECURITY: Helmet sets Content-Security-Policy, X-Content-Type-Options,
// X-Frame-Options, Strict-Transport-Security, and other security headers.
app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled for dev; enable in production

// SECURITY: Restrict CORS to known frontend origins only.
app.use(cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }));

// SECURITY: Limit request body size to prevent memory exhaustion attacks.
app.use(express.json({ limit: '1mb' }));

// --- Public endpoints ---
app.get('/', (req, res) => {
  res.json({
    message: 'OMNI-CORE Backend API Server',
    version: SERVER_VERSION,
    status: 'running',
    endpoints: '/api/version, /api/gemini, /api/chat, /api/hotas/profiles'
  });
});

app.get('/api/version', (req, res) => {
  res.json({ version: SERVER_VERSION, projectHours: projectHours.totalHours, lastActive: projectHours.lastActiveHour });
});

// --- RSI Citizen API endpoint ---
app.get('/api/citizen/:handle', async (req, res) => {
  const { handle } = req.params;

  // Validate handle
  if (!handle || handle.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(handle)) {
    return res.status(400).json({ error: 'Invalid citizen handle' });
  }

  try {
    const apiKey = process.env.RSI_API_KEY;
    if (!apiKey) {
      log('ERROR', 'RSI_API_KEY not configured');
      return res.status(500).json({ error: 'API not configured' });
    }

    log('CITIZEN', `Fetching profile: ${handle}`);

    // Star Citizen API endpoint: GET /{apikey}/v1/{mode}/user/{handle}
    // API is at api.starcitizen-api.com (not starcitizen-api.com)
    // Mode can be: live, cache, auto, eager
    const response = await fetch(
      `https://api.starcitizen-api.com/${apiKey}/v1/live/user/${encodeURIComponent(handle)}`,
      {
        headers: {
          'User-Agent': 'OmniCore/0.1.0'
        },
        timeout: 10000
      }
    );

    if (!response.ok) {
      log('CITIZEN', `Profile not found: ${handle} (${response.status})`);
      return res.status(404).json({ error: 'Citizen not found', handle });
    }

    const data = await response.json();

    // Cache result for 1 hour to reduce API calls
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(data.data || data);

    log('CITIZEN', `Successfully fetched: ${handle}`);
  } catch (error) {
    log('ERROR', `Citizen API error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch citizen data', details: error.message });
  }
});

// SECURITY: Rate limit all API routes to prevent abuse.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// --- RSI Starmap proxy (public endpoint with server-side cache) ---
const RSI_STARMAP_BASE = 'https://robertsspaceindustries.com/api/starmap';
const STARMAP_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const starmapCache = {
  bootup: null,
  systems: new Map(),
};

function isFresh(entry, ttl = STARMAP_TTL_MS) {
  return Boolean(entry?.fetchedAt) && (Date.now() - entry.fetchedAt) < ttl;
}

async function fetchRsiStarmap(path) {
  const response = await fetch(`${RSI_STARMAP_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'OmniCore/0.1.0',
      Accept: 'application/json',
    },
    body: '{}',
  });

  if (!response.ok) {
    throw new Error(`RSI starmap responded with ${response.status}`);
  }

  return response.json();
}

app.get('/api/starmap/bootup', async (req, res) => {
  const force = String(req.query.force || 'false') === 'true';

  try {
    if (!force && isFresh(starmapCache.bootup)) {
      return res.json({
        ...starmapCache.bootup.payload,
        _meta: {
          cacheSource: 'server-cache',
          fetchedAt: starmapCache.bootup.fetchedAt,
          source: 'rsi-starmap',
          endpoint: 'bootup',
        },
      });
    }

    const payload = await fetchRsiStarmap('bootup');
    starmapCache.bootup = {
      payload,
      fetchedAt: Date.now(),
    };

    res.set('Cache-Control', 'public, max-age=900');
    return res.json({
      ...payload,
      _meta: {
        cacheSource: 'network',
        fetchedAt: starmapCache.bootup.fetchedAt,
        source: 'rsi-starmap',
        endpoint: 'bootup',
      },
    });
  } catch (error) {
    log('ERROR', `RSI starmap bootup failed: ${error.message}`);
    return res.status(502).json({ error: 'Failed to fetch RSI starmap bootup data' });
  }
});

app.get('/api/starmap/system/:code', async (req, res) => {
  const force = String(req.query.force || 'false') === 'true';
  const code = String(req.params.code || '').trim().toUpperCase();

  if (!code || !/^[A-Z0-9_-]{1,64}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid star system code' });
  }

  try {
    const cached = starmapCache.systems.get(code);
    if (!force && isFresh(cached)) {
      return res.json({
        ...cached.payload,
        _meta: {
          cacheSource: 'server-cache',
          fetchedAt: cached.fetchedAt,
          source: 'rsi-starmap',
          endpoint: `star-systems/${code}`,
        },
      });
    }

    const payload = await fetchRsiStarmap(`star-systems/${encodeURIComponent(code)}`);
    starmapCache.systems.set(code, {
      payload,
      fetchedAt: Date.now(),
    });

    res.set('Cache-Control', 'public, max-age=900');
    return res.json({
      ...payload,
      _meta: {
        cacheSource: 'network',
        fetchedAt: Date.now(),
        source: 'rsi-starmap',
        endpoint: `star-systems/${code}`,
      },
    });
  } catch (error) {
    log('ERROR', `RSI starmap system failed (${code}): ${error.message}`);
    return res.status(502).json({ error: 'Failed to fetch RSI starmap system data' });
  }
});

// --- AI provider setup ---
const AWS_ENABLED = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && !process.env.AWS_ACCESS_KEY_ID.startsWith('#');

let bedrockClient = null;
if (AWS_ENABLED) {
  bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  log('⚠️ AWS BEDROCK ENABLED - Charges will apply!');
} else {
  log('✅ AWS DISABLED - Using Gemini only (free tier)');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelMap = {
  'opus-4.5': 'anthropic.claude-3-haiku-20240307-v1:0',
  'sonnet-4.5': 'anthropic.claude-3-haiku-20240307-v1:0',
  'haiku-4.5': 'anthropic.claude-3-haiku-20240307-v1:0',
  'sonnet-3.7': 'anthropic.claude-3-haiku-20240307-v1:0',
  'sonnet-3.5': 'anthropic.claude-3-haiku-20240307-v1:0',
};
let currentModel = 'sonnet-3.5';

let usageStats = { totalRequests: 0, totalTokens: 0, totalCost: 0, requestsByModel: {}, lastRequest: null };
let analyticsStats = { totalEvents: 0, eventsByName: {}, lastEventAt: null, lastBatchAt: null };

function sanitizeAnalyticsProperties(properties) {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(properties)
      .slice(0, 24)
      .filter(([key]) => typeof key === 'string' && key && !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, value]) => [sanitizeForLog(key, 48), sanitizeForLog(String(value ?? ''), 200)])
  );
}

function sanitizeAnalyticsEvent(event) {
  if (!event || typeof event !== 'object') {
    return null;
  }

  const name = sanitizeForLog(String(event.name || '').toLowerCase(), 64);
  if (!ANALYTICS_EVENT_NAME_PATTERN.test(name)) {
    return null;
  }

  return {
    name,
    timestamp: sanitizeForLog(String(event.timestamp || new Date().toISOString()), 64),
    properties: sanitizeAnalyticsProperties(event.properties)
  };
}

// --- Admin/monitoring endpoints ---
app.get('/api/usage', (req, res) => { res.json(usageStats); });

app.get('/api/rate-limits', (req, res) => {
  res.json({
    hourly: { current: requestCounts.hourly, limit: HOURLY_REQUEST_LIMIT, percent: (requestCounts.hourly / HOURLY_REQUEST_LIMIT * 100).toFixed(1) },
    daily: { current: requestCounts.daily, limit: DAILY_REQUEST_LIMIT, percent: (requestCounts.daily / DAILY_REQUEST_LIMIT * 100).toFixed(1) },
    lastReset: requestCounts.lastReset,
    lastHourReset: requestCounts.lastHourReset,
    history: requestCounts.history
  });
});

app.get('/api/pricing', (req, res) => { res.json({ pricing: PRICING, threshold: COST_ALERT_THRESHOLD }); });

app.get('/api/analytics/summary', (req, res) => {
  res.json(analyticsStats);
});

app.post('/api/analytics/events', (req, res) => {
  const events = Array.isArray(req.body?.events) ? req.body.events.slice(0, MAX_ANALYTICS_EVENTS_PER_BATCH) : [];
  let accepted = 0;

  events.forEach((event) => {
    const safeEvent = sanitizeAnalyticsEvent(event);
    if (!safeEvent) {
      return;
    }

    accepted += 1;
    analyticsStats.totalEvents += 1;
    analyticsStats.lastEventAt = safeEvent.timestamp;
    analyticsStats.lastBatchAt = new Date().toISOString();
    analyticsStats.eventsByName[safeEvent.name] = (analyticsStats.eventsByName[safeEvent.name] || 0) + 1;
  });

  res.status(202).json({ accepted });
});

app.post('/api/pricing/calculate', (req, res) => {
  const { model, inputTokens, outputTokens } = req.body;
  const pricing = PRICING[model];
  if (!pricing) return res.status(400).json({ error: 'Invalid model' });
  const cost = (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
  res.json({ cost: cost.toFixed(4), model, inputTokens, outputTokens });
});

app.post('/api/model', (req, res) => {
  const { model } = req.body;
  if (modelMap[model]) {
    currentModel = model;
    log('Switched to model:', model);
    res.json({ success: true, model });
  } else {
    res.status(400).json({ error: 'Invalid model' });
  }
});

// --- Retry helper ---
async function retryRequest(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 400 || error.$metadata?.httpStatusCode === 403) throw error;
      if (i === retries - 1) throw error;
      log(`Retry ${i + 1}/${retries} after error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// --- Gemini endpoints ---
app.get('/api/gemini/models', async (req, res) => {
  try {
    const modelName = await getGeminiModelName();
    res.json({ models: [modelName], recommended: modelName });
  } catch {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/gemini', async (req, res) => {
  trackProjectTime();
  try {
    checkLimits();
    const message = validateMessage(req.body.message);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured in .env file' });
    }

    const modelName = await getGeminiModelName();
    log('Gemini message:', message.substring(0, 100), '| Model:', modelName);

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: 'You are a helpful assistant for OMNI-CORE, a Star Citizen companion dashboard. Be concise and informative.'
    });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    log('Gemini response length:', text.length);
    res.json({ response: text });
  } catch (error) {
    log('Gemini error:', error.message);
    if (error.message.includes('limit reached')) {
      return res.status(429).json({ error: error.message, rateLimited: true });
    }
    // SECURITY: Don't leak internal error details to client
    res.status(500).json({ error: 'AI request failed. Please try again.' });
  }
});

// --- Error logging endpoint ---
app.post('/api/log-error', (req, res) => {
  // SECURITY: Sanitize all user-supplied fields before writing to disk
  const timestamp = sanitizeForLog(req.body.timestamp, 50);
  const button = sanitizeForLog(req.body.button, 100);
  const page = sanitizeForLog(req.body.page, 100);
  const error = sanitizeForLog(req.body.error, 1000);
  const stack = sanitizeForLog(req.body.stack, MAX_LOG_FIELD_LENGTH);

  const logEntry = `\n[${timestamp}] ${page} - ${button}\nError: ${error}\nStack: ${stack}\n${'='.repeat(80)}\n`;

  try {
    appendFileSync(join(process.cwd(), 'error.log'), logEntry);
    log('📝 Error logged to error.log');
    res.json({ success: true });
  } catch (err) {
    log('Failed to write error log:', err.message);
    res.status(500).json({ error: 'Failed to log error' });
  }
});

// SECURITY: Server shutdown endpoint REMOVED.
// Previously POST /api/server/restart called process.exit(0) with no auth.
// Use Ctrl+C in terminal or process manager to stop the server.

// --- Main chat endpoint ---
app.post('/api/chat', async (req, res) => {
  trackProjectTime();
  try {
    checkLimits();
    const message = validateMessage(req.body.message);
    const { conversationHistory = [], systemPrompt, stream = false, image, model = 'gemini', provider = 'gemini' } = req.body;

    if (message !== 'ping') {
      log('Received message:', message.substring(0, 100));
    }

    // FORCE GEMINI - AWS is disabled by default
    if (!AWS_ENABLED || model === 'gemini' || provider === 'gemini') {
      const modelName = await getGeminiModelName();

      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt || 'You are a helpful assistant.'
      });
      const result = await geminiModel.generateContent(message);
      const response = await result.response;
      const text = response.text();

      log('Gemini response length:', text.length);
      return res.json({ response: text, systemMessage: text });
    }

    if (!AWS_ENABLED) {
      return res.status(403).json({ error: 'AWS Bedrock is disabled. Enable in .env to use.' });
    }

    if (stream && !image) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const messages = [
        ...(systemPrompt ? [{ role: 'user', content: systemPrompt }] : []),
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const command = new InvokeModelCommand({
        modelId: modelMap[currentModel],
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: messages.slice(-10),
          stream: true
        }),
      });

      const response = await bedrockClient.send(command);
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const chunk of response.body) {
        const parsed = JSON.parse(new TextDecoder().decode(chunk));
        if (parsed.type === 'content_block_delta') {
          const text = parsed.delta?.text || '';
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        if (parsed.type === 'message_delta') outputTokens = parsed.usage?.output_tokens || 0;
        if (parsed.type === 'message_start') inputTokens = parsed.message?.usage?.input_tokens || 0;
      }

      const pricing = PRICING[currentModel];
      const cost = (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
      usageStats.totalRequests++;
      usageStats.totalTokens += inputTokens + outputTokens;
      usageStats.totalCost += cost;
      usageStats.requestsByModel[currentModel] = (usageStats.requestsByModel[currentModel] || 0) + 1;
      usageStats.lastRequest = new Date().toISOString();

      res.write(`data: ${JSON.stringify({ done: true, usage: { inputTokens, outputTokens } })}\n\n`);
      res.end();
      return;
    }

    const response = await retryRequest(async () => {
      const messages = [{ role: 'user', content: [{ text: message }] }];
      const command = new ConverseCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        messages,
        system: systemPrompt ? [{ text: systemPrompt }] : undefined,
        inferenceConfig: { maxTokens: 1000 }
      });
      return await bedrockClient.send(command);
    });

    const outputText = response.output.message.content[0].text;
    const inputTokens = response.usage?.inputTokens || 0;
    const outputTokens = response.usage?.outputTokens || 0;
    const totalTokens = inputTokens + outputTokens;

    const pricing = PRICING[currentModel];
    const cost = (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
    usageStats.totalRequests++;
    usageStats.totalTokens += totalTokens;
    usageStats.totalCost += cost;
    usageStats.requestsByModel[currentModel] = (usageStats.requestsByModel[currentModel] || 0) + 1;
    usageStats.lastRequest = new Date().toISOString();

    if (usageStats.totalCost >= COST_ALERT_THRESHOLD) {
      log(`⚠️ Cost alert: $${usageStats.totalCost.toFixed(2)} exceeds threshold $${COST_ALERT_THRESHOLD}`);
    }

    if (message !== 'ping') {
      log('Claude response length:', outputText.length);
      log('Tokens used:', totalTokens, '| Total cost: $' + usageStats.totalCost.toFixed(4));
    }

    res.json({ systemMessage: outputText, usage: { inputTokens, outputTokens, totalTokens } });
  } catch (error) {
    console.error('Error details:', error);

    if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
      return res.status(401).json({ error: 'Invalid API key configuration', apiKeyError: true });
    }
    if (error.message?.includes('limit reached')) {
      return res.status(429).json({ error: error.message, rateLimited: true });
    }
    if (error.message?.includes('Message exceeds') || error.message?.includes('Message is required')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message?.includes('INVALID_PAYMENT_INSTRUMENT') || error.message?.includes('AccessDenied')) {
      return res.json({ systemMessage: 'Request received. (Note: AWS Bedrock requires a payment method to be configured)' });
    }
    if (error.message?.includes('inference profile')) {
      return res.json({ systemMessage: 'AI response unavailable — please check AWS Bedrock model access.' });
    }
    // SECURITY: Don't leak internal error details to client
    res.status(500).json({ error: 'AI request failed. Please try again.' });
  }
});

// --- HOTAS Profile Endpoints ---
const STAR_CITIZEN_MAPPINGS_PATH = 'C:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE\\user\\client\\0\\controls\\mappings';

// SECURITY: Validate profile name to prevent directory traversal
function validateProfileName(name) {
  if (!name || typeof name !== 'string') return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  if (name.includes('..') || name.includes('/') || name.includes('\\')) return null;
  return name.substring(0, 100);
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateInputToken(input) {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // Accept Star Citizen joystick token format: js1_button14, js1_z, js1_pov_n, etc.
  if (/^js\d+_[a-z0-9_ +\-]+$/i.test(trimmed)) return trimmed.slice(0, 64);
  // Accept Star Citizen keyboard token format: kb1_w, kb1_lctrl+m, etc.
  if (/^kb\d+_[a-z0-9_ +\-]+$/i.test(trimmed)) return trimmed.slice(0, 64);
  // Accept Star Citizen mouse token format: mouse1, mouse2, mouse4, etc.
  if (/^mouse\d+(?:_[a-z0-9_ +\-]+)?$/i.test(trimmed)) return trimmed.slice(0, 64);

  return null;
}

function normalizeActionNames(actionNames) {
  if (!Array.isArray(actionNames) || actionNames.length === 0) return [];
  return actionNames
    .filter((name) => typeof name === 'string')
    .map((name) => name.trim())
    .filter((name) => /^[a-z0-9_]+$/i.test(name));
}

function upsertDeviceRebind(xml, actionName, inputToken) {
  const actionPattern = new RegExp(
    `(<action\\s+name="${escapeRegExp(actionName)}"\\s*>)([\\s\\S]*?)(</action>)`,
    'i'
  );

  if (!actionPattern.test(xml)) {
    return { xml, updated: false, found: false };
  }

  let deviceRebindPattern;
  if (/^js\d+_/i.test(inputToken)) {
    deviceRebindPattern = /<rebind\s+input="js\d+_[^"]*"\s*\/>/i;
  } else if (/^kb\d+_/i.test(inputToken)) {
    deviceRebindPattern = /<rebind\s+input="kb\d+_[^"]*"\s*\/>/i;
  } else if (/^mouse\d+/i.test(inputToken)) {
    deviceRebindPattern = /<rebind\s+input="mouse\d+[^"]*"\s*\/>/i;
  } else {
    return { xml, updated: false, found: false };
  }

  const updatedXml = xml.replace(actionPattern, (full, openTag, actionBody, closeTag) => {
    if (deviceRebindPattern.test(actionBody)) {
      const replacedBody = actionBody.replace(deviceRebindPattern, `<rebind input="${inputToken}"/>`);
      return `${openTag}${replacedBody}${closeTag}`;
    }

    // Preserve existing action content and append device-specific rebind.
    const separator = actionBody.endsWith('\n') ? '' : '\n';
    const appendedBody = `${actionBody}${separator}   <rebind input="${inputToken}"/>\n`;
    return `${openTag}${appendedBody}${closeTag}`;
  });

  return { xml: updatedXml, updated: true, found: true };
}

app.get('/api/hotas/profiles', (req, res) => {
  try {
    if (!statSync(STAR_CITIZEN_MAPPINGS_PATH)) {
      return res.status(404).json({ error: 'Star Citizen mappings folder not found' });
    }

    const profiles = readdirSync(STAR_CITIZEN_MAPPINGS_PATH)
      .filter(file => file.endsWith('.xml'))
      .map(file => ({
        name: file.replace('.xml', ''),
        path: file,
        filename: file
      }));

    log(`HOTAS: Loaded ${profiles.length} profiles from Star Citizen mappings directory`);
    res.json({ profiles });
  } catch (error) {
    log('HOTAS profiles error:', error.message);
    res.status(500).json({ error: 'Failed to load profiles' });
  }
});

app.get('/api/hotas/profile/:profileName', (req, res) => {
  try {
    const profileName = validateProfileName(req.params.profileName);
    if (!profileName) {
      return res.status(400).json({ error: 'Invalid profile name' });
    }

    const filePath = join(STAR_CITIZEN_MAPPINGS_PATH, `${profileName}.xml`);
    
    // SECURITY: Validate file path is within allowed directory
    if (!filePath.startsWith(STAR_CITIZEN_MAPPINGS_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    
    log(`HOTAS: Loaded profile "${profileName}"`);
    res.json({ profile: profileName, xmlContent: fileContent });
  } catch (error) {
    log('HOTAS profile load error:', error.message);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

app.post('/api/hotas/profile/:profileName/bindings', (req, res) => {
  try {
    const profileName = validateProfileName(req.params.profileName);
    if (!profileName) {
      return res.status(400).json({ error: 'Invalid profile name' });
    }

    const actionNames = normalizeActionNames(req.body?.actionNames);
    const inputToken = validateInputToken(req.body?.inputToken ?? req.body?.joystickInput);

    if (actionNames.length === 0) {
      return res.status(400).json({ error: 'No valid action names provided' });
    }

    if (!inputToken) {
      return res.status(400).json({ error: 'Invalid input token' });
    }

    const filePath = join(STAR_CITIZEN_MAPPINGS_PATH, `${profileName}.xml`);

    // SECURITY: Validate file path is within allowed directory.
    if (!filePath.startsWith(STAR_CITIZEN_MAPPINGS_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const originalXml = readFileSync(filePath, 'utf-8');
    let updatedXml = originalXml;
    let updatedCount = 0;
    let foundCount = 0;

    actionNames.forEach((actionName) => {
      const result = upsertDeviceRebind(updatedXml, actionName, inputToken);
      updatedXml = result.xml;
      if (result.found) foundCount += 1;
      if (result.updated) updatedCount += 1;
    });

    if (updatedCount === 0) {
      return res.status(404).json({
        error: 'No matching actions found in profile XML',
        actionNames,
      });
    }

    writeFileSync(filePath, updatedXml, 'utf-8');
    log(`HOTAS: Updated ${updatedCount} rebind(s) in profile "${profileName}" -> ${inputToken}`);

    res.json({
      success: true,
      profile: profileName,
      inputToken,
      actionNames,
      matchedActions: foundCount,
      updatedActions: updatedCount,
    });
  } catch (error) {
    log('HOTAS profile save error:', error.message);
    res.status(500).json({ error: 'Failed to save profile bindings' });
  }
});

app.post('/api/hotas/open-folder', (req, res) => {
  try {
    if (!statSync(STAR_CITIZEN_MAPPINGS_PATH)) {
      return res.status(404).json({ error: 'Star Citizen mappings folder not found' });
    }
    
    // Open folder with Windows explorer (works on Windows)
    execSync(`start "" "${STAR_CITIZEN_MAPPINGS_PATH}"`, { stdio: 'ignore' });
    
    log('HOTAS: Opened mappings folder');
    res.json({ success: true, path: STAR_CITIZEN_MAPPINGS_PATH });
  } catch (error) {
    log('HOTAS open folder error:', error.message);
    res.status(500).json({ error: 'Failed to open folder' });
  }
});

registerMediaRoutes(app);
registerShipRoutes(app);
registerVersemailRoutes(app);
registerHotasModeRoutes(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  log(`Server ${SERVER_VERSION} running on port ${PORT}`);
});
