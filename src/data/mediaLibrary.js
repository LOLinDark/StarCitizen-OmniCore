// OmniCore Media Library
// Centralized collection of videos, images, and assets
// Organized by use case and easily expandable

// IMPORTANT: Video Migration (April 2026)
// Changed from YouTube embeds to local MP4 files
// - No YouTube UI/branding needed
// - Full playback control
// - Better performance and offline capability
// - Videos stored in /public/assets/videos/
// - See /public/assets/videos/README.md for setup instructions

export const mediaLibrary = {
  // Theme Lab: Hero Containers (Landing Page)
  themeHeroContainers: {
    starCitizen: {
      id: 'hero-sc',
      title: 'Star Citizen',
      description: 'The Universe Awaits',
      // Hero Background Image (static, always visible)
      heroImage: {
        url: 'https://via.placeholder.com/1920x1080?text=Star+Citizen+Hero',
        alt: 'Star Citizen universe with planets and ships',
        credit: 'Roberts Space Industries',
      },
      // Hover Video - plays when user hovers (local MP4)
      hoverVideo: {
        videoPath: '/assets/videos/star-citizen-hero.mp4', // Place 15-sec clip here
        title: 'Star Citizen - Welcome to the Verse',
      },
      // Fallback if video unavailable
      fallbackImage: {
        url: 'https://via.placeholder.com/1920x1080?text=Play+Video',
        alt: 'Play video',
      },
    },
    squadron42: {
      id: 'hero-sq42',
      title: 'Squadron 42',
      description: 'Answer The Call',
      heroImage: {
        url: 'https://via.placeholder.com/1920x1080?text=Squadron+42+Hero',
        alt: 'Squadron 42 campaign military aesthetic',
        credit: 'Roberts Space Industries',
      },
      hoverVideo: {
        videoPath: '/assets/videos/squadron42-hero.mp4', // Place 15-sec clip here
        title: 'Squadron 42 - Campaign Trailer',
      },
      fallbackImage: {
        url: 'https://via.placeholder.com/1920x1080?text=Play+Video',
        alt: 'Play video',
      },
    },
  },

  // Dashboard: Tool Container Images
  dashboardTools: {
    newPlayerGuide: {
      id: 'tool-npg',
      image: '/assets/tools/new-player-guide.jpg',
      alt: 'New Player Guide - Learn the basics of Star Citizen',
    },
    loadoutBuilder: {
      id: 'tool-loadout',
      image: '/assets/tools/loadout-builder.jpg',
      alt: 'Loadout Builder - Customize your ship weapons and equipment',
    },
    economyTracker: {
      id: 'tool-economy',
      image: '/assets/tools/economy-tracker.jpg',
      alt: 'Economy Tracker - Monitor trading routes and prices',
    },
    locationGuide: {
      id: 'tool-locations',
      image: '/assets/tools/location-guide.jpg',
      alt: 'Location Guide - Explore every system and POI',
    },
    hotasConfig: {
      id: 'tool-hotas',
      image: '/assets/tools/hotas-config.png',
      alt: 'HOTAS Configuration - Set up your flight controls',
    },
    shipDatabase: {
      id: 'tool-ships',
      image: '/assets/tools/ship-database.jpg',
      alt: 'Ship Database - Browse all ships and specs',
    },
  },

  // Aerobook: Gallery Videos (already defined there, reference here)
  // See: src/data/aeroBookContent.js

  // Future: In-Game Screenshots
  screenshots: {
    // Organized by location/activity
    combat: [],
    trading: [],
    exploration: [],
    mining: [],
    socialSpaces: [],
  },

  // Future: Creator Content
  creators: {
    // Featured creators and their playlists
  },

  // Helper: Asset paths
  assetPaths: {
    toolImages: '/assets/tools/',
    screenshots: '/assets/screenshots/',
    videos: '/assets/videos/',
  },
};

// Helper functions

/**
 * Get hero container media by ID
 * @param {string} containerId - 'starCitizen' or 'squadron42'
 * @returns {object} Hero container data with images and video
 */
export const getHeroContainer = (containerId) => {
  return mediaLibrary.themeHeroContainers[containerId];
};

/**
 * Get tool image URL by tool ID
 * @param {string} toolId - Tool identifier
 * @returns {string} Image URL or placeholder
 */
export const getToolImage = (toolId) => {
  const tool = mediaLibrary.dashboardTools[toolId];
  return tool?.image || 'https://via.placeholder.com/400x200?text=Tool+Image';
};

/**
 * Get all hero containers
 * @returns {array} Array of hero container objects
 */
export const getAllHeroContainers = () => {
  return Object.entries(mediaLibrary.themeHeroContainers).map(([key, value]) => ({
    id: key,
    ...value,
  }));
};

/**
 * Preload image for faster display
 * @param {string} url - Image URL
 */
export const preloadImage = (url) => {
  if (typeof window === 'undefined') return;
  const img = new Image();
  img.src = url;
};

/**
 * Preload multiple images
 * @param {array} urls - Array of image URLs
 */
export const preloadImages = (urls) => {
  urls.forEach(preloadImage);
};
