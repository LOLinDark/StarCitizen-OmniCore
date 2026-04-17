/**
 * Route Configuration for OmniCore
 * Single source of truth for all app routes
 * Used by App.jsx and DevPanel to avoid duplication
 * 
 * Add new routes here and they'll automatically appear in the dev panel
 */

export const routeConfig = {
  main: [
    {
      label: '/ Dashboard',
      path: '/',
      category: 'Main App',
      color: 'cyan',
    },
    {
      label: '/login',
      path: '/login',
      category: 'Main App',
      color: 'cyan',
    },
    {
      label: '/aerobook',
      path: '/aerobook',
      category: 'Main App',
      color: 'cyan',
    },
    {
      label: '/onboarding',
      path: '/onboarding',
      category: 'Main App',
      color: 'cyan',
    },
  ],

  themeLab: [
    {
      label: '/theme (Landing)',
      path: '/theme',
      category: 'Theme Lab',
      color: 'orange',
    },
    {
      label: '/theme/star-citizen',
      path: '/theme/star-citizen',
      category: 'Theme Lab',
      color: 'orange',
    },
    {
      label: '/theme/squadron-42',
      path: '/theme/squadron-42',
      category: 'Theme Lab',
      color: 'orange',
    },
    {
      label: '[HC01] /theme/hotas-config',
      path: '/theme/hotas-config',
      category: 'Theme Lab',
      color: 'orange',
    },
    {
      label: '[HC03] /theme/hotas-config-dark',
      path: '/theme/hotas-config-dark',
      category: 'Theme Lab',
      color: 'orange',
    },
    {
      label: '[HC04] /theme/hotas-config-toggle',
      path: '/theme/hotas-config-toggle',
      category: 'Theme Lab',
      color: 'orange',
    },
    {
      label: '[LEGACY] /theme/hotas-test -> /settings/hotas',
      path: '/theme/hotas-test',
      category: 'Theme Lab',
      color: 'yellow',
    },
  ],

  admin: [
    {
      label: '/settings',
      path: '/settings',
      category: 'Admin & Tools',
      color: 'grape',
    },
    {
      label: '/settings/hotas',
      path: '/settings/hotas',
      category: 'Admin & Tools',
      color: 'grape',
    },
    {
      label: '/admin/chat/gemini',
      path: '/admin/chat/gemini',
      category: 'Admin & Tools',
      color: 'grape',
    },
    {
      label: '/admin/ai-rules',
      path: '/admin/ai-rules',
      category: 'Admin & Tools',
      color: 'grape',
    },
    {
      label: '/admin/analytics',
      path: '/admin/analytics',
      category: 'Admin & Tools',
      color: 'grape',
    },
    {
      label: '/developer',
      path: '/developer',
      category: 'Admin & Tools',
      color: 'grape',
    },
    {
      label: '/about',
      path: '/about',
      category: 'Admin & Tools',
      color: 'grape',
    },
  ],
};

/**
 * Get all routes organized by category
 * @returns {Object} Routes grouped by category
 */
export const getAllRoutesByCategory = () => {
  return routeConfig;
};

/**
 * Get all routes flattened
 * @returns {Array} All routes in a single array
 */
export const getAllRoutes = () => {
  return [...routeConfig.main, ...routeConfig.themeLab, ...routeConfig.admin];
};

/**
 * Get routes by category
 * @param {string} category - Category name (e.g., 'Main App', 'Theme Lab')
 * @returns {Array} Routes in that category
 */
export const getRoutesByCategory = (category) => {
  return getAllRoutes().filter((route) => route.category === category);
};

/**
 * Get unique categories
 * @returns {Array} List of all categories
 */
export const getCategories = () => {
  const categories = new Set();
  getAllRoutes().forEach((route) => {
    categories.add(route.category);
  });
  return Array.from(categories);
};
