// Utility functions for HOTAS config and input handling

export function normalizeText(value) {
  return String(value || '').toLowerCase();
}

export function getInputKind(input) {
  if (!input) return '';
  if (input.type === 'Button' || input.type === 'Axis') return input.type;
  if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
    return 'Button';
  }
  const metaType = normalizeText(input.meta?.type);
  if (metaType === 'button' || metaType === 'hat') return 'Button';
  if (metaType === 'axis' || metaType === 'slider') return 'Axis';
  return '';
}

export function getInputAction(input) {
  if (!input) return '';
  if (input.action) return input.action;
  const kind = getInputKind(input);
  if (kind === 'Axis') {
    const numeric = Number(input.value);
    return Number.isFinite(numeric) && Math.abs(numeric) >= 0.12 ? 'Engaged' : 'Released';
  }
  return '';
}

// Add more utility functions as needed (formatHotasBindingFromInput, formatHotasInputForXml, etc.)
