import { useState, useMemo, useEffect, useCallback } from 'react';

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

export const usePagination = (
  items = [],
  { searchFields = [], initialLimit = 10, serverPagination = null } = {}
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Extract array
  const safeItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    if (items && Array.isArray(items.categories)) return items.categories;
    if (items && Array.isArray(items.orders)) return items.orders;
    if (items && Array.isArray(items.products)) return items.products;
    if (items && Array.isArray(items.data)) return items.data;
    return [];
  }, [items]);

  // 2. Filter logic (Only applied locally if not server-paginated)
  const filteredItems = useMemo(() => {
    if (serverPagination) return safeItems; // Server already filtered/paginated

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
  }, [safeItems, searchTerm, JSON.stringify(searchFields), serverPagination]);

  // 3. Total Pages: Use server metadata if passed, else derive locally
  const totalPages = useMemo(() => {
    if (serverPagination && serverPagination.totalPages) {
      return serverPagination.totalPages;
    }
    return Math.max(1, Math.ceil(filteredItems.length / limit));
  }, [filteredItems.length, limit, serverPagination]);

  // 4. Current Display Items: Use as-is if server-paginated, else slice locally
  const currentItems = useMemo(() => {
    if (serverPagination) return safeItems; // Already 10 items from backend
    const startIndex = (currentPage - 1) * limit;
    return filteredItems.slice(startIndex, startIndex + limit);
  }, [safeItems, filteredItems, currentPage, limit, serverPagination]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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