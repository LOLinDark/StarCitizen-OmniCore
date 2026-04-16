import { useMemo } from 'react';
import {
  shipControlsCategories,
  shipKeybindings,
  getKeybindingsByCategory,
  searchKeybindings,
} from '../data/starcitizen-keybindings';

/**
 * Custom hook for HOTAS filtering and sorting logic
 * Handles category selection, search filtering, and column sorting
 * @returns {Object} { filteredBindings, sortedBindings, currentCategory, categoryList, filterState, setFilterState }
 */
export const useHOTASFiltering = (selectedCategory, searchQuery, sortBy, sortOrder) => {
  // Filter keybindings by selected category
  const filteredBindings = useMemo(() => {
    let results = selectedCategory ? getKeybindingsByCategory(selectedCategory) : shipKeybindings;
    if (searchQuery) {
      results = searchKeybindings(results, searchQuery);
    }
    return results;
  }, [selectedCategory, searchQuery]);

  // Sort keybindings
  const sortedBindings = useMemo(() => {
    const sorted = [...filteredBindings].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    return sorted;
  }, [filteredBindings, sortBy, sortOrder]);

  const currentCategory = shipControlsCategories[selectedCategory];
  const categoryList = Object.entries(shipControlsCategories);

  return {
    filteredBindings,
    sortedBindings,
    currentCategory,
    categoryList,
  };
};
