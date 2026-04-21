export const THEME_LAB_STANDARD_VERSION = '1.0.0';

export const THEME_PRESETS = [
  {
    id: 'sunrise-classroom',
    name: 'Sunrise Classroom',
    description: 'Warm, vibrant UI for daily nursery use with high readability.',
    tokens: {
      primaryColor: '#e85d04',
      accentColor: '#ffba08',
      surfaceColor: '#fff7ed',
      radius: 'md',
      fontFamily: '"Nunito", "Trebuchet MS", sans-serif'
    }
  },
  {
    id: 'sea-glass',
    name: 'Sea Glass',
    description: 'Calm coastal palette aligned with Fife branding direction.',
    tokens: {
      primaryColor: '#0f766e',
      accentColor: '#38bdf8',
      surfaceColor: '#ecfeff',
      radius: 'md',
      fontFamily: '"Poppins", "Segoe UI", sans-serif'
    }
  },
  {
    id: 'forest-story',
    name: 'Forest Story',
    description: 'Soft green style for planning and evidence workflows.',
    tokens: {
      primaryColor: '#2b9348',
      accentColor: '#55a630',
      surfaceColor: '#f1f8e9',
      radius: 'lg',
      fontFamily: '"Baloo 2", "Verdana", sans-serif'
    }
  }
];

export function getThemePresetById(presetId) {
  return THEME_PRESETS.find((preset) => preset.id === presetId) || THEME_PRESETS[0];
}

export function buildThemeExport(config) {
  return {
    schemaVersion: 'theme-lab.v1',
    standardVersion: THEME_LAB_STANDARD_VERSION,
    exportedAt: new Date().toISOString(),
    config
  };
}

export function mapThemeToWordPressVars(config) {
  return {
    '--wp--preset--color--primary': config.primaryColor,
    '--wp--preset--color--secondary': config.accentColor,
    '--wp--preset--color--surface': config.surfaceColor,
    '--wp--preset--radius--base': config.radius,
    '--wp--preset--font-family--base': config.fontFamily
  };
}
