// Keyboard and mouse input formatting utilities for HOTAS config

export function formatKeyboardInputForXml(event) {
  if (!event) return '';
  const modifierOnlyCodes = new Set([
    'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight',
  ]);
  if (modifierOnlyCodes.has(event.code)) return '';
  const simpleCodeMap = {
    Space: 'space', Tab: 'tab', Enter: 'enter', Backspace: 'backspace', Escape: 'escape',
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    Comma: 'comma', Period: 'period', Slash: 'slash', Semicolon: 'semicolon', Quote: 'apostrophe',
    BracketLeft: 'lbracket', BracketRight: 'rbracket', Backslash: 'backslash', Minus: 'minus', Equal: 'equals',
    Backquote: 'tilde', Home: 'home', End: 'end', Insert: 'insert', Delete: 'delete', PageUp: 'pgup', PageDown: 'pgdn',
    CapsLock: 'capslock', NumpadAdd: 'np_plus', NumpadSubtract: 'np_minus', NumpadMultiply: 'np_mul', NumpadDivide: 'np_div',
    NumpadDecimal: 'np_decimal', NumpadEnter: 'np_enter',
  };
  let baseToken = '';
  if (event.code?.startsWith('Key')) {
    baseToken = event.code.slice(3).toLowerCase();
  } else if (event.code?.startsWith('Digit')) {
    baseToken = event.code.slice(5);
  } else if (event.code?.startsWith('Numpad') && /^Numpad\d$/.test(event.code)) {
    baseToken = `np_${event.code.slice(6)}`;
  } else if (/^F\d{1,2}$/.test(event.code || '')) {
    baseToken = event.code.toLowerCase();
  } else {
    baseToken = simpleCodeMap[event.code] || '';
  }
  if (!baseToken) return '';
  const modifiers = [];
  if (event.ctrlKey) modifiers.push('lctrl');
  if (event.altKey) modifiers.push('lalt');
  if (event.shiftKey) modifiers.push('lshift');
  return `kb1_${[...modifiers, baseToken].join('+')}`;
}

export function formatMouseInputForXml(button) {
  const map = {
    0: 'mouse1', 1: 'mouse3', 2: 'mouse2', 3: 'mouse4', 4: 'mouse5',
  };
  return map[button] || '';
}
