/**
 * Ship Artwork Configuration
 * Maps ship names to high-quality, background-free artwork
 * These images are displayed with reduced transparency and optional different styling
 */

// Helper to construct image paths compatible with GitHub Pages deployment
const getImagePath = (relativePath) => {
  let baseUrl = import.meta.env.BASE_URL;
  if (!baseUrl || baseUrl === '' || baseUrl === 'undefined') {
    baseUrl = '/';
  }
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  try {
    return new URL(cleanPath, baseUrl).pathname;
  } catch (e) {
    // Fallback: just prepend baseUrl if URL constructor fails
    console.warn('[shipArtwork] URL construction failed:', e.message);
    return baseUrl + cleanPath;
  }
};

export const SHIP_ARTWORK = {
  'vulture': {
    url: getImagePath('/assets/ships-artwork/drake-vulture.png'),
    opacity: 0.90,
    blur: 0,
    brightness: 1.0,
    description: 'Official Drake Vulture artwork',
  },
  // Aurora Mk I variants — COMMENTED OUT pending transparent background PNG
  // File aurora-es.png (had baked-in background) was removed
  // See GitHub issues for community contributions with proper transparent PNGs
  // TODO: Re-enable once transparent background image is available
  /*
  'aurora mk i': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Roberts Space Industries Aurora Mk I',
  },
  'aurora mk i es': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk I Essential Starter',
  },
  'aurora mk i ln': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk I Legionnaire Combat',
  },
  'aurora mk i lx': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk I Deluxe Luxury',
  },
  'aurora mk i mr': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk I Marque Light Fighter',
  },
  'aurora mk i cl': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk I Clipper Cargo',
  },
  'aurora mk i se': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk I Special Edition',
  },
  'aurora mk ii': {
    url: '/assets/ships-artwork/aurora-es.png',
    opacity: 0.88,
    blur: 0,
    brightness: 1.0,
    description: 'Aurora Mk II',
  },
  */
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
