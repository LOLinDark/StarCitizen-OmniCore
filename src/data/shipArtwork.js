/**
 * Ship Artwork Configuration
 * Maps ship names to high-quality, background-free artwork
 * These images are displayed with reduced transparency and optional different styling
 */

export const SHIP_ARTWORK = {
  'vulture': {
    url: '/assets/ships-artwork/drake-vulture.png',
    opacity: 0.90, // Higher opacity (less transparent) for clean backgrounds
    blur: 0, // No blur - artwork is already clean
    brightness: 1.0, // Full brightness - artwork is already styled
    description: 'Official Drake Vulture artwork',
  },
  // Add more ships here as artwork becomes available
  // Example:
  // '890 jump': {
  //   url: '/assets/ships-artwork/origin-890-jump.png',
  //   opacity: 0.85,
  //   blur: 0,
  //   brightness: 1.0,
  // },
};

/**
 * Get artwork configuration for a ship
 * @param {string} shipName - Ship name (e.g., "Vulture")
 * @returns {Object|null} Artwork config or null if none available
 */
export function getShipArtwork(shipName) {
  const key = shipName.toLowerCase();
  return SHIP_ARTWORK[key] || null;
}

/**
 * Check if a ship has custom artwork
 * @param {string} shipName - Ship name
 * @returns {boolean}
 */
export function hasShipArtwork(shipName) {
  return !!getShipArtwork(shipName);
}
