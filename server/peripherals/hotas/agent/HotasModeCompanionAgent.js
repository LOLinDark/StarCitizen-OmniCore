import { getHotasModeState, resolveOutputTokenForButton } from '../modes/stateStore.js';
import { injectVirtualInputToken } from '../modes/inputInjector.js';

function parseArg(name, fallback = '') {
  const idx = process.argv.findIndex((arg) => arg === name);
  if (idx < 0) return fallback;
  return process.argv[idx + 1] || fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function log(...parts) {
  console.log('[hotas-agent]', ...parts);
}

async function run() {
  const buttonId = String(parseArg('--button', 'button4')).toLowerCase();
  const modeOverride = String(parseArg('--mode', '')).toLowerCase();
  const dryRun = hasFlag('--dry-run');

  const store = getHotasModeState();
  const activeMode = modeOverride || store.modeState.activeMode;

  const resolved = resolveOutputTokenForButton(buttonId, activeMode);
  if (!resolved.token) {
    throw new Error(`No output token configured for ${buttonId} in mode ${resolved.activeMode}`);
  }

  const result = injectVirtualInputToken(resolved.token, { dryRun });

  log('button', buttonId);
  log('mode', resolved.activeMode);
  log('token', resolved.token);
  log('injector', JSON.stringify(result));
}

run().catch((error) => {
  console.error('[hotas-agent] error:', error.message || error);
  process.exitCode = 1;
});
