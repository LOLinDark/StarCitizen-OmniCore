import { execFileSync } from 'child_process';

function normalizeSendKeysToken(token) {
  const raw = String(token || '').trim();
  if (!raw) return '';

  // Allow single letters/numbers and a controlled function-key subset.
  if (/^[a-z0-9]$/i.test(raw)) {
    return raw.toLowerCase();
  }

  const upper = raw.toUpperCase();
  if (/^F([1-9]|1[0-2])$/.test(upper)) {
    return `{${upper}}`;
  }

  if (upper === 'SPACE') return ' ';
  if (upper === 'ENTER') return '~';

  return '';
}

export function injectVirtualInputToken(token, { dryRun = false } = {}) {
  const sendKeysToken = normalizeSendKeysToken(token);
  if (!sendKeysToken) {
    throw new Error('Unsupported output token for Windows SendKeys');
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      sendKeysToken,
    };
  }

  const command = [
    '$ws = New-Object -ComObject WScript.Shell',
    `Start-Sleep -Milliseconds 50`,
    `$ws.SendKeys('${sendKeysToken.replace(/'/g, "''")}')`,
  ].join('; ');

  execFileSync('powershell.exe', ['-NoProfile', '-Command', command], {
    windowsHide: true,
    stdio: 'ignore',
  });

  return {
    success: true,
    dryRun: false,
    sendKeysToken,
  };
}
