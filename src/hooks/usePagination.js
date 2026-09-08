import { useState, useMemo, useEffect, useCallback } from 'react';

// Helper function to safely extract values from nested paths (e.g., "category.name")
const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

/**
 * Generic hook for client-side filtering and pagination.
 */
export const usePagination = (items = [], { searchFields = [], initialLimit = 10 } = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Normalize input: Always extract a valid JS array (Fixed const reassignment bug)
  const safeItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    if (items && Array.isArray(items.categories)) return items.categories;
    if (items && Array.isArray(items.orders)) return items.orders;
    if (items && Array.isArray(items.products)) return items.products;
    if (items && Array.isArray(items.data)) return items.data;
    return [];
  }, [items]);

  // 2. Filter logic: Handles primitive values, nested paths, and arrays safely
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
    // Stringify searchFields in dependencies to keep reference stable
  }, [safeItems, searchTerm, JSON.stringify(searchFields)]);

  // 3. Dynamically compute total pages from filtered results
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / limit));
  }, [filteredItems.length, limit]);

  // 4. Reset to page 1 if current page goes out of bounds (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // 5. Slice current items for active page
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredItems.slice(startIndex, startIndex + limit);
  }, [filteredItems, currentPage, limit]);

  // Handler functions
  const handleSearchChange = useCallback((e) => {
    const val = e?.target ? e.target.value : e;
    setSearchTerm(String(val || ''));
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((e) => {
    const rawVal = e?.target ? e.target.value : e;
    const newLimit = Number(rawVal);

    if (!isNaN(newLimit) && newLimit > 0) {
      setLimit((prevLimit) => {
        if (prevLimit === newLimit) return prevLimit;
        return newLimit;
      });
      setCurrentPage(1);
    }
  }, []);

  return {
    currentItems,
    filteredItems,
    currentPage,
    setCurrentPage,
    totalPages,
    limit,
    setLimit: handleLimitChange,
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    clearSearch,
  };
};