import { HOTAS_MODES } from './constants.js';
import {
  getHotasModeState,
  replaceAllButtonModeBindings,
  resolveOutputTokenForButton,
  setButtonModeBindings,
  setHotasModeState,
} from './stateStore.js';
import { injectVirtualInputToken } from './inputInjector.js';

function normalizeButtonId(value) {
  const id = String(value || '').trim().toLowerCase();
  return /^button\d+$/i.test(id) ? id : '';
}

export function registerHotasModeRoutes(app) {
  app.get('/api/hotas/modes/state', (_req, res) => {
    const data = getHotasModeState();
    res.json(data);
  });

  app.post('/api/hotas/modes/state', (req, res) => {
    const next = {
      enabled: typeof req.body?.enabled === 'boolean' ? req.body.enabled : undefined,
      activeMode: typeof req.body?.activeMode === 'string' ? req.body.activeMode : undefined,
    };

    const updated = setHotasModeState(next);
    res.json(updated);
  });

  app.post('/api/hotas/modes/bindings', (req, res) => {
    try {
      const buttonId = normalizeButtonId(req.body?.buttonId);
      if (!buttonId) {
        return res.status(400).json({ error: 'Invalid buttonId. Expected format: button4' });
      }

      const updated = setButtonModeBindings(buttonId, {
        green: req.body?.green,
        orange: req.body?.orange,
        red: req.body?.red,
      });

      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to save mode bindings' });
    }
  });

  app.get('/api/hotas/modes/bindings', (_req, res) => {
    const state = getHotasModeState();
    res.json({ bindings: state.bindings || {} });
  });

  app.post('/api/hotas/modes/bindings/import', (req, res) => {
    try {
      const payloadBindings = req.body?.bindings;
      const updated = replaceAllButtonModeBindings(payloadBindings);
      return res.json({
        success: true,
        importedCount: Object.keys(updated.bindings || {}).length,
        bindings: updated.bindings,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to import mode bindings' });
    }
  });

  app.post('/api/hotas/modes/test-fire', (req, res) => {
    try {
      const buttonId = normalizeButtonId(req.body?.buttonId || 'button4');
      if (!buttonId) {
        return res.status(400).json({ error: 'Invalid buttonId. Expected format: button4' });
      }

      const modeOverride = HOTAS_MODES.includes(String(req.body?.mode || '').toLowerCase())
        ? String(req.body.mode).toLowerCase()
        : null;

      const state = getHotasModeState();
      const resolved = resolveOutputTokenForButton(buttonId, modeOverride || state.modeState.activeMode);
      if (!resolved.token) {
        return res.status(400).json({
          error: `No token configured for ${buttonId} in mode ${resolved.activeMode}`,
        });
      }

      const dryRun = String(req.body?.dryRun || '').toLowerCase() === 'true' || req.body?.dryRun === true;
      const injectorResult = injectVirtualInputToken(resolved.token, { dryRun });

      return res.json({
        success: true,
        buttonId,
        activeMode: resolved.activeMode,
        outputToken: resolved.token,
        injector: injectorResult,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to fire mode output token' });
    }
  });

  app.post('/api/hotas/modes/button-event', (req, res) => {
    try {
      const state = getHotasModeState();
      if (!state.modeState?.enabled) {
        return res.status(409).json({ error: 'Mode bridge is disabled in backend state' });
      }

      const buttonId = normalizeButtonId(req.body?.buttonId);
      if (!buttonId) {
        return res.status(400).json({ error: 'Invalid buttonId. Expected format: button4' });
      }

      const modeOverride = HOTAS_MODES.includes(String(req.body?.mode || '').toLowerCase())
        ? String(req.body.mode).toLowerCase()
        : null;

      const resolved = resolveOutputTokenForButton(buttonId, modeOverride || state.modeState.activeMode);
      if (!resolved.token) {
        return res.status(404).json({ error: `No token configured for ${buttonId} in mode ${resolved.activeMode}` });
      }

      const dryRun = String(req.body?.dryRun || '').toLowerCase() === 'true' || req.body?.dryRun === true;
      const injectorResult = injectVirtualInputToken(resolved.token, { dryRun });

      return res.json({
        success: true,
        buttonId,
        activeMode: resolved.activeMode,
        outputToken: resolved.token,
        injector: injectorResult,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to handle mode button event' });
    }
  });
}
