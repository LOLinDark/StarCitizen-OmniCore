/**
 * Curated Ship Pricing Data
 *
 * RSI's Ship Matrix API returns empty pledge costs and no aUEC prices.
 * This file provides a curated, hand-maintained dataset.
 *
 * SOURCES:
 *   - Pledge USD:  https://robertsspaceindustries.com/pledge/ships (as of 2954 / Apr 2026)
 *   - aUEC:        https://starcitizen.tools/Category:Ships (Star Citizen Wiki) — prices
 *                  vary by patch; values here reflect ~3.23 in-game prices.
 *
 * HOW TO UPDATE:
 *   Keys are ship names in lowercase (matched case-insensitively at lookup time).
 *   pledgeUSD: current RSI pledge store price in USD, null if not for sale standalone.
 *   aUEC:      in-game purchase price at ship vendors, null if not purchasable in-verse.
 *
 * NOTE ON FLEET CENSUS:
 *   RSI does not publish fleet ownership statistics. No reliable data exists for
 *   "number of ships owned across all players." This column has been omitted.
 */

export const SHIP_PRICING = {
  // ── RSI Aurora series ───────────────────────────────────────────────────────
  'aurora mk i es':              { pledgeUSD: 35,   aUEC: 184_500 },
  'aurora mk i lx':              { pledgeUSD: 35,   aUEC: 283_430 },
  'aurora mk i cl':              { pledgeUSD: 40,   aUEC: 250_010 },
  'aurora mk i mr':              { pledgeUSD: 40,   aUEC: 198_850 },
  'aurora mk i ln':              { pledgeUSD: 45,   aUEC: 288_700 },

  // ── Consolidated Outland Mustang series ────────────────────────────────────
  'consolidated outland mustang alpha': { pledgeUSD: 30, aUEC: 151_500 },
  'consolidated outland mustang beta':  { pledgeUSD: 55, aUEC: 334_500 },
  'consolidated outland mustang gamma': { pledgeUSD: 55, aUEC: 304_000 },
  'consolidated outland mustang delta': { pledgeUSD: 55, aUEC: 355_000 },
  'consolidated outland mustang omega': { pledgeUSD: 60, aUEC: null   },

  // ── Aegis Dynamics ─────────────────────────────────────────────────────────
  'aegis avenger titan':         { pledgeUSD: 70,   aUEC: 694_500 },
  'aegis avenger stalker':       { pledgeUSD: 75,   aUEC: 705_000 },
  'aegis avenger warlock':       { pledgeUSD: 75,   aUEC: 731_500 },
  'aegis gladius':               { pledgeUSD: 110,  aUEC: 1_254_800 },
  'aegis sabre':                 { pledgeUSD: 170,  aUEC: 1_898_000 },
  'aegis sabre comet':           { pledgeUSD: 175,  aUEC: null },
  'aegis vanguard warden':       { pledgeUSD: 220,  aUEC: 2_842_000 },
  'aegis vanguard hoplite':      { pledgeUSD: 225,  aUEC: null },
  'aegis vanguard harbinger':    { pledgeUSD: 245,  aUEC: null },
  'aegis vanguard sentinel':     { pledgeUSD: 255,  aUEC: null },
  'aegis hammerhead':            { pledgeUSD: 725,  aUEC: null },
  'aegis reclaimer':             { pledgeUSD: 400,  aUEC: null },
  'aegis redeemer':              { pledgeUSD: 250,  aUEC: null },
  'aegis eclipse':               { pledgeUSD: 275,  aUEC: null },
  'aegis idris-p':               { pledgeUSD: 1_000, aUEC: null },
  'aegis idris-m':               { pledgeUSD: null, aUEC: null },
  'aegis retaliator base':       { pledgeUSD: 175,  aUEC: null },
  'aegis vulcan':                { pledgeUSD: 200,  aUEC: null },
  'aegis nautilus':              { pledgeUSD: 675,  aUEC: null },
  'aegis javelin':               { pledgeUSD: 3_000, aUEC: null },

  // ── Anvil Aerospace ────────────────────────────────────────────────────────
  'anvil arrow':                 { pledgeUSD: 75,   aUEC: 804_250 },
  'anvil f7c hornet':            { pledgeUSD: 110,  aUEC: 1_142_750 },
  'anvil f7c hornet wildfire':   { pledgeUSD: 175,  aUEC: null },
  'anvil f7c-r hornet tracker':  { pledgeUSD: 140,  aUEC: null },
  'anvil f7c-s hornet ghost':    { pledgeUSD: 145,  aUEC: null },
  'anvil f7c-m super hornet':    { pledgeUSD: 195,  aUEC: null },
  'anvil hurricane':             { pledgeUSD: 200,  aUEC: null },
  'anvil hawk':                  { pledgeUSD: 90,   aUEC: 980_500 },
  'anvil carrack':               { pledgeUSD: 600,  aUEC: null },
  'anvil terrapin':              { pledgeUSD: 195,  aUEC: null },
  'anvil valkyrie':              { pledgeUSD: 375,  aUEC: null },
  'anvil c8 pisces':             { pledgeUSD: 55,   aUEC: null },
  'anvil gladiator':             { pledgeUSD: 170,  aUEC: null },

  // ── Roberts Space Industries ───────────────────────────────────────────────
  'rsi aurora mk i es':          { pledgeUSD: 35,   aUEC: 184_500 },
  'rsi constellation andromeda': { pledgeUSD: 250,  aUEC: null },
  'rsi constellation aquila':    { pledgeUSD: 325,  aUEC: null },
  'rsi constellation phoenix':   { pledgeUSD: 350,  aUEC: null },
  'rsi constellation taurus':    { pledgeUSD: 240,  aUEC: null },
  'rsi mantis':                  { pledgeUSD: 150,  aUEC: null },
  'rsi orion':                   { pledgeUSD: 325,  aUEC: null },
  'rsi perseus':                 { pledgeUSD: 600,  aUEC: null },
  'rsi polaris':                 { pledgeUSD: 750,  aUEC: null },

  // ── Drake Interplanetary ──────────────────────────────────────────────────
  'drake caterpillar':           { pledgeUSD: 330,  aUEC: null },
  'drake buccaneer':             { pledgeUSD: 110,  aUEC: 1_228_000 },
  'drake cutlass black':         { pledgeUSD: 110,  aUEC: 1_228_000 },
  'drake cutlass blue':          { pledgeUSD: 135,  aUEC: null },
  'drake cutlass red':           { pledgeUSD: 135,  aUEC: null },
  'drake herald':                { pledgeUSD: 90,   aUEC: null },
  'drake vulture':               { pledgeUSD: 140,  aUEC: null },
  'drake corsair':               { pledgeUSD: 195,  aUEC: null },
  'drake cutter':                { pledgeUSD: 55,   aUEC: 555_000 },
  'drake mule':                  { pledgeUSD: 35,   aUEC: null },

  // ── MISC ──────────────────────────────────────────────────────────────────
  'misc freelancer':             { pledgeUSD: 110,  aUEC: 1_195_000 },
  'misc freelancer max':         { pledgeUSD: 125,  aUEC: null },
  'misc freelancer dur':         { pledgeUSD: 130,  aUEC: null },
  'misc freelancer mis':         { pledgeUSD: 145,  aUEC: null },
  'misc prospector':             { pledgeUSD: 155,  aUEC: 2_061_800 },
  'misc hull a':                 { pledgeUSD: 75,   aUEC: null },
  'misc hull b':                 { pledgeUSD: 90,   aUEC: null },
  'misc hull c':                 { pledgeUSD: 270,  aUEC: null },
  'misc starfarer':              { pledgeUSD: 300,  aUEC: null },
  'misc starfarer gemini':       { pledgeUSD: 340,  aUEC: null },
  'misc razor':                  { pledgeUSD: 135,  aUEC: null },
  'misc endeavor':               { pledgeUSD: 350,  aUEC: null },
  'misc starlancer max':         { pledgeUSD: 250,  aUEC: null },
  'misc starlancer tac':         { pledgeUSD: 300,  aUEC: null },

  // ── Origin Jumpworks ──────────────────────────────────────────────────────
  'origin 100i':                 { pledgeUSD: 55,   aUEC: 532_400 },
  'origin 125a':                 { pledgeUSD: 60,   aUEC: null },
  'origin 135c':                 { pledgeUSD: 70,   aUEC: null },
  'origin 300i':                 { pledgeUSD: 65,   aUEC: 673_400 },
  'origin 315p':                 { pledgeUSD: 70,   aUEC: null },
  'origin 325a':                 { pledgeUSD: 75,   aUEC: null },
  'origin 350r':                 { pledgeUSD: 160,  aUEC: null },
  'origin 400i':                 { pledgeUSD: 285,  aUEC: null },
  'origin 600i explorer':        { pledgeUSD: 500,  aUEC: null },
  'origin 600i touring':         { pledgeUSD: 435,  aUEC: null },
  'origin 890 jump':             { pledgeUSD: 950,  aUEC: null },
  'origin m50 interceptor':      { pledgeUSD: 115,  aUEC: null },
  'origin x1':                   { pledgeUSD: 45,   aUEC: null },

  // ── Crusader Industries ────────────────────────────────────────────────────
  'crusader mercury star runner': { pledgeUSD: 225, aUEC: null },
  'crusader a2 hercules starlifter': { pledgeUSD: 675, aUEC: null },
  'crusader c2 hercules starlifter': { pledgeUSD: 395, aUEC: null },
  'crusader m2 hercules starlifter': { pledgeUSD: 530, aUEC: null },
  'crusader ares ion':           { pledgeUSD: 250,  aUEC: null },
  'crusader ares inferno':       { pledgeUSD: 250,  aUEC: null },

  // ── Esperia ────────────────────────────────────────────────────────────────
  'esperia prowler':             { pledgeUSD: 400,  aUEC: null },
  'esperia talon':               { pledgeUSD: 90,   aUEC: null },
  'esperia talon shrike':        { pledgeUSD: 100,  aUEC: null },

  // ── Argo Astronautics ──────────────────────────────────────────────────────
  'argo mole':                   { pledgeUSD: 325,  aUEC: null },
  'argo raft':                   { pledgeUSD: 160,  aUEC: null },
  'argo mpuv cargo':             { pledgeUSD: 35,   aUEC: null },
  'argo mpuv personnel':         { pledgeUSD: 35,   aUEC: null },
  'argo csv-sm':                 { pledgeUSD: 50,   aUEC: null },

  // ── Mirai ─────────────────────────────────────────────────────────────────
  'mirai guardian':              { pledgeUSD: 95,   aUEC: null },
  'mirai guardian qe':           { pledgeUSD: 100,  aUEC: null },
  'mirai fury':                  { pledgeUSD: 55,   aUEC: null },
  'mirai fury lx':               { pledgeUSD: 55,   aUEC: null },
  'mirai fury mx':               { pledgeUSD: 60,   aUEC: null },

  // ── Gatac Manufacture ─────────────────────────────────────────────────────
  'gatac railen':                { pledgeUSD: 195,  aUEC: null },
  'gatac syulen':                { pledgeUSD: 75,   aUEC: null },

  // ── Banu ──────────────────────────────────────────────────────────────────
  'banu defender':               { pledgeUSD: 185,  aUEC: null },
  'banu merchantman':            { pledgeUSD: 600,  aUEC: null },

  // ── Vanduul (concept) ─────────────────────────────────────────────────────
  'vanduul scythe':              { pledgeUSD: null, aUEC: null },
  'vanduul blade':               { pledgeUSD: null, aUEC: null },
};

/**
 * Look up pricing for a ship by name (case-insensitive).
 * Returns { pledgeUSD: number|null, aUEC: number|null } or null if not found.
 * @param {string} shipName
 * @returns {{ pledgeUSD: number|null, aUEC: number|null } | null}
 */
export function getShipPricing(shipName) {
  if (!shipName) return null;
  const key = String(shipName).toLowerCase().trim();
  return SHIP_PRICING[key] ?? null;
}

/** Format a USD pledge price for display. */
export function fmtPledgeUSD(pricing) {
  if (!pricing || pricing.pledgeUSD === null || pricing.pledgeUSD === undefined) return '—';
  return `$${pricing.pledgeUSD.toLocaleString()}`;
}

/** Format an aUEC price for display. */
export function fmtAUEC(pricing) {
  if (!pricing || pricing.aUEC === null || pricing.aUEC === undefined) return '—';
  return `${(pricing.aUEC / 1000).toFixed(0)}k aUEC`;
}
