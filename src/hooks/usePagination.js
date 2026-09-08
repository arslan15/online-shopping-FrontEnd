import { useState, useMemo, useEffect,useCallback } from 'react';

// Helper function to safely extract values from nested paths (e.g., "category.name")
const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

/**
 * Generic hook for client-side filtering and pagination.
 *
 * @param {Array|Object} items - Raw data array or API response wrapper
 * @param {Object} options - Configuration options
 * @param {Array} options.searchFields - Object keys to search against
 * @param {number} options.initialLimit - Default items per page (default: 10)
 */
export const usePagination = (items = [], { searchFields = [], initialLimit = 10 } = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState('');
   const [totalPages, setTotalPages] = useState(1);

  // 1. Normalize input: Always extract a valid JS array
  const safeItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    if (items && Array.isArray(items.categories)) return items.categories;
    if (items && Array.isArray(items.orders)) return items.orders;
    if (items && Array.isArray(items.products)) return items.products;
    if (items && Array.isArray(items.data)) return items.data;
    return [];
  }, [items]);

  // Reset to page 1 whenever search query or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, limit]);

  // 2. Filter logic: Handles strings, numbers, arrays, and nested paths safely
  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return safeItems;

    return safeItems.filter((item) =>
      searchFields.some((field) => {
        const val = getNestedValue(item, field);

        if (val === null || val === undefined) return false;

        // Handle array properties (e.g., categories: ['Tech', 'Books'])
        if (Array.isArray(val)) {
          return val.some((element) =>
            typeof element === 'object'
              ? JSON.stringify(element).toLowerCase().includes(query)
              : String(element).toLowerCase().includes(query)
          );
        }

        // Handle primitive values (strings, numbers, booleans)
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [safeItems, searchTerm, searchFields]);

  // 3. Slice items for current page safely
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredItems.slice(startIndex, startIndex + limit);
  }, [filteredItems, currentPage, limit]);

  // Handler functions
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm('');
 const handleLimitChange = useCallback((e) => {
    const rawVal = e?.target ? e.target.value : e;
    const newLimit = Number(rawVal);

    if (!isNaN(newLimit) && newLimit > 0) {
      setLimit((prevLimit) => {
        if (prevLimit === newLimit) return prevLimit; // Prevent unnecessary state updates/re-renders
        return newLimit;
      });
      setCurrentPage(1); // Reset to page 1 on limit change
    }
  }, []);

  return {
    currentItems,
    filteredItems,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    limit,
    setLimit: handleLimitChange,
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    clearSearch,
  };
};