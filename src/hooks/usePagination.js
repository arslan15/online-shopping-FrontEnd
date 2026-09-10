import { useState, useMemo, useEffect, useCallback } from 'react';

// Helper function for nested property retrieval (e.g., 'category.name')
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

export const usePagination = (
  rawItems = [],
  { searchFields = [], initialLimit = 10, serverPagination = null } = {}
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Normalize array safely
  const safeItems = useMemo(() => {
    if (Array.isArray(rawItems)) return rawItems;
    if (rawItems && Array.isArray(rawItems.data)) return rawItems.data;
    return [];
  }, [rawItems]);

  // 2. Filter logic (Disabled when using serverPagination)
  const filteredItems = useMemo(() => {
    if (serverPagination) return safeItems;

    const query = searchTerm.toLowerCase().trim();
    if (!query) return safeItems;

    return safeItems.filter((item) =>
      searchFields.some((field) => {
        const val = getNestedValue(item, field);
        if (val === null || val === undefined) return false;

        if (Array.isArray(val)) {
          return val.some((element) =>
            typeof element === 'object'
              ? JSON.stringify(element).toLowerCase().includes(query)
              : String(element).toLowerCase().includes(query)
          );
        }
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [safeItems, searchTerm, searchFields.join(','), serverPagination]);

  // 3. Calculate total pages
  const totalPages = useMemo(() => {
    if (serverPagination && typeof serverPagination.totalPages === 'number') {
      return serverPagination.totalPages;
    }
    return Math.max(1, Math.ceil(filteredItems.length / limit));
  }, [filteredItems.length, limit, serverPagination]);

  // 4. Slice display items
  const currentItems = useMemo(() => {
    if (serverPagination) return safeItems;

    const startIndex = (currentPage - 1) * limit;
    return filteredItems.slice(startIndex, startIndex + limit);
  }, [safeItems, filteredItems, currentPage, limit, serverPagination]);

  // Reset page index if bounds are exceeded
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // --- HANDLERS ---
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
      setLimit(newLimit);
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