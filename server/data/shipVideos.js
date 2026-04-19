/**
 * Curated Ship Video Mapping
 *
 * Maps ship names (lowercase, normalised) to official RSI YouTube video IDs.
 * The dossier viewer will embed the YouTube player when a matching ID is found.
 *
 * HOW TO ADD MORE:
 *   1. Find the official RSI ship commercial / spotlight on youtube.com/@RobertsSpaceIndustries
 *   2. Copy the 11-character video ID from the URL  (e.g. youtube.com/watch?v=XXXXXXXXXXX)
 *   3. Add an entry below:  'ship name (all lowercase)': 'VIDEO_ID'
 *
 * Ship names must match the `name` field returned by /api/ships (case-insensitive lookup
 * is applied at query time, so you do not need to worry about exact casing here).
 */

export const SHIP_VIDEOS = {
  // ── Aegis Dynamics ─────────────────────────────────────────────────────────
  'aegis hammerhead':        'YkE0xA5S5C0',  // "Guarding the Frontier" commercial
  'aegis reclaimer':         '57Bz2r5OHRY',  // Reclaimer concept video
  'aegis redeemer':          'uoSHXfCDl90',  // Redeemer concept video
  'aegis vanguard warden':   'Gk5sWCH9r28',  // Vanguard reveal
  'aegis sabre':             'I5kzb0bWL3k',  // Sabre reveal
  'aegis gladius':           'Xim0kvHHmjA',  // Gladius commercial
  'aegis eclipse':           'ZS9FrvTS7gk',  // Eclipse reveal

  // ── Anvil Aerospace ────────────────────────────────────────────────────────
  'anvil carrack':           'Uqp4wFHlJfA',  // Carrack concept trailer
  'anvil hawk':              'pkjaxBFoI0w',  // Hawk commercial
  'anvil hurricane':         'kMdQRTNlBEA',  // Hurricane reveal
  'anvil valkyrie':          'EFKhk1cXXN0',  // Valkyrie reveal
  'anvil terrapin':          'eZhU8cBhVDQ',  // Terrapin commercial

  // ── Roberts Space Industries ──────────────────────────────────────────────
  'rsi constellation aquila':'y0SCkBTVY5c',  // Aquila reveal
  'rsi polaris':             'LGrFMDHHBiE',  // Polaris reveal
  'rsi mantis':              'z1Jxq7p9vRQ',  // Mantis concept reveal
  'rsi orion':               'OdqvUFqRMi4',  // Orion mining concept

  // ── Origin Jumpworks ──────────────────────────────────────────────────────
  'origin 890 jump':         'qcnVxLOIPYc',  // 890 Jump commercial
  'origin 600i explorer':    'TlO3a8aHnQM',  // 600i reveal
  'origin 100i':             'z2fwMPd_KkE',  // 100 series commercial
  'origin m50 interceptor':  'Kne-nJuJYoI',  // M50 commercial

  // ── Crusader Industries ────────────────────────────────────────────────────
  'crusader mercury star runner': 'v0xqkXZVWpU', // Mercury reveal
  'crusader c2 hercules starlifter': 'Py-kGcw0P4k', // C2 Hercules reveal

  // ── Drake Interplanetary ──────────────────────────────────────────────────
  'drake caterpillar':       'Pp_BLeYpLMo',  // Caterpillar commercial
  'drake cutlass black':     'J0HxXpQ7N1g',  // Cutlass Black reveal
  'drake buccaneer':         'OvOD-PpU9mI',  // Buccaneer commercial
  'drake herald':            '0Z3cAjuN5cI',  // Herald commercial
  'drake vulture':           'f4yv3IujYh4',  // Vulture reveal

  // ── MISC ──────────────────────────────────────────────────────────────────
  'misc freelancer':         'oUlz8ULpFJM',  // Freelancer rework reveal
  'misc starlancer max':     'NzQCi3hHUAY',  // Starlancer reveal
  'misc prospector':         '1XKnlEWHbqQ',  // Prospector commercial
  'misc hull c':             'h6kXMTXqEbk',  // Hull C reveal

  // ── Esperia ────────────────────────────────────────────────────────────────
  'esperia vanquisher':      'z1F2a8ZrYf8',  // Vanquisher reveal

  // ── Consolidated Outland ──────────────────────────────────────────────────
  'consolidated outland mustang alpha': 'qY0hQpNLSBU', // Mustang commercial
  'consolidated outland pioneer': 'hLvxGbJFNbg',  // Pioneer concept

  // ── Argo Astronautics ─────────────────────────────────────────────────────
  'argo mole':               'RRvzqZFjNNk',  // MOLE reveal
};

/**
 * Look up a YouTube video ID for a given ship name.
 * Returns null if no video is curated for this ship.
 * @param {string} shipName
 * @returns {string|null}
 */
export function getShipYouTubeId(shipName) {
  if (!shipName) return null;
  const key = String(shipName).toLowerCase().trim();
  return SHIP_VIDEOS[key] ?? null;
}
