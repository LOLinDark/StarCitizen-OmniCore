/**
 * Ship Role Normalization
 *
 * RSI's `focus` field contains 50+ inconsistent strings like
 * "Medium Fighter / Medium Freight" or "Starter / Pathfinder".
 * This module normalises them into a stable set of role buckets.
 *
 * A ship can match MULTIPLE roles (a slash-delimited focus like
 * "Mining / Refining" maps to both Mining and Industrial).
 * The role filter returns any ship that matches at least one selected role.
 */

/** Canonical role buckets shown in the UI. */
export const ROLES = [
  'Fighter',
  'Bomber',
  'Interdiction',
  'Capital / Military',
  'Freight',
  'Mining',
  'Salvage',
  'Exploration',
  'Transport / Passenger',
  'Medical / Support',
  'Science / Recon',
  'Racing',
  'Industrial',
  'Starter',
];

/**
 * Keywords (lowercase substrings) that map a focus segment to a role bucket.
 * Order matters only within a bucket — first match wins per segment.
 */
const ROLE_KEYWORDS = {
  'Fighter':              ['fighter', 'interceptor', 'assault', 'gun ship', 'gunship', 'combat', 'anti-air', 'anti-aircraft', 'patrol', 'stealth'],
  'Bomber':               ['bomber'],
  'Interdiction':         ['interdiction', 'interdictor', 'minelayer'],
  'Capital / Military':   ['frigate', 'corvette', 'destroyer', 'carrier', 'military', 'dropship', 'boarding', 'combined arms'],
  'Freight':              ['freight', 'cargo', 'hauler', 'transporter', 'armored'],
  'Mining':               ['mining', 'prospecting', 'refin'],
  'Salvage':              ['salvage', 'recovery'],
  'Exploration':          ['exploration', 'expedition', 'pathfinder', 'recon', 'reconnaissance'],
  'Transport / Passenger':['transport', 'passenger', 'touring', 'luxury'],
  'Medical / Support':    ['medical', 'ambulance', 'repair', 'refuel'],
  'Science / Recon':      ['science', 'data', 'reporting', 'intelligence'],
  'Racing':               ['racing'],
  'Industrial':           ['industrial', 'construction', 'modular'],
  'Starter':              ['starter'],
};

/**
 * Return the set of role buckets for a ship's focus string.
 * Ships with no matching keywords get an empty array (shown as "Unclassified").
 * @param {string} focus  e.g. "Mining / Refining" or "Medium Fighter"
 * @returns {string[]}    e.g. ['Mining', 'Industrial']
 */
export function getRoles(focus) {
  if (!focus) return [];

  const segments = String(focus)
    .toLowerCase()
    .split('/')
    .map((s) => s.trim());

  const matched = new Set();

  for (const segment of segments) {
    for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
      if (keywords.some((kw) => segment.includes(kw))) {
        matched.add(role);
      }
    }
  }

  return [...matched];
}

/**
 * Return the primary (first) role bucket for a ship, or 'Unclassified'.
 * Useful for display in table cells.
 * @param {string} focus
 * @returns {string}
 */
export function getPrimaryRole(focus) {
  const roles = getRoles(focus);
  return roles[0] || 'Unclassified';
}
