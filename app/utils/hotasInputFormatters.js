// HOTAS input formatting utilities
import { getInputKind, normalizeText } from './hotasUtils';

export function formatHotasBindingFromInput(input) {
  if (!input) return '';
  const kind = getInputKind(input);
  if (kind === 'Button') {
    if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
      const dir = input.index.replace('9-hat-', '').toUpperCase();
      return `POV HAT ${dir}`;
    }
    const displayNumber = Number.isInteger(input.displayIndex)
      ? input.displayIndex
      : (Number.isInteger(input.index) ? input.index + 1 : '?');
    return `Button ${displayNumber}`;
  }
  if (kind === 'Axis') {
    const axisIndex = Number.isInteger(input.index) ? input.index : '?';
    const axisName = input.name || `Axis ${axisIndex}`;
    return `Axis ${axisIndex} (${axisName})`;
  }
  return input.name || '';
}

export function formatHotasInputForXml(input) {
  if (!input) return '';
  const kind = getInputKind(input);
  if (kind === 'Button') {
    if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
      const dir = input.index.replace('9-hat-', '').toLowerCase();
      return `js1_pov_${dir}`;
    }
    const buttonNumber = Number.isInteger(input.displayIndex)
      ? input.displayIndex
      : (Number.isInteger(input.index) ? input.index + 1 : null);
    return Number.isInteger(buttonNumber) ? `js1_button${buttonNumber}` : '';
  }
  if (kind === 'Axis') {
    const axisTokenByIndex = {
      0: 'js1_x',
      1: 'js1_y',
      2: 'js1_z',
      5: 'js1_rz',
    };
    if (Number.isInteger(input.index) && axisTokenByIndex[input.index]) {
      return axisTokenByIndex[input.index];
    }
    const axisName = normalizeText(input.name);
    if (axisName.includes('x axis')) return 'js1_x';
    if (axisName.includes('y axis')) return 'js1_y';
    if (axisName.includes('z axis')) return 'js1_z';
    if (axisName.includes('z rotation')) return 'js1_rz';
    if (axisName.includes('slider')) return 'js1_slider1';
  }
  return '';
}
