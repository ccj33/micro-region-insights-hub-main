import { useState, useEffect, useMemo, useCallback } from 'react';
import { MicroRegionData, FilterOptions } from '@/types/dashboard';

interface CacheEntry {
  data: MicroRegionData[];
  timestamp: number;
  filters: FilterOptions;
}

interface UseDataCacheReturn {
  filteredData: MicroRegionData[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearCache: () => void;
  cacheStats: {
    hits: number;
    misses: number;
    size: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const DEBOUNCE_DELAY = 300; // 300ms

export function useDataCache(
  data: MicroRegionData[],
  filters: FilterOptions
): UseDataCacheReturn {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ hits: 0, misses: 0, size: 0 });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Generate cache key
  const generateCacheKey = useCallback((filters: FilterOptions, search: string) => {
    const filterString = JSON.stringify(filters);
    return `${filterString}-${search}`;
  }, []);

  // Filter data with search
  const filterDataWithSearch = useCallback((data: MicroRegionData[], search: string) => {
    if (!search.trim()) return data;
    
    const searchLower = search.toLowerCase();
    return data.filter(item => 
      item.microrregiao.toLowerCase().includes(searchLower) ||
      item.macrorregiao.toLowerCase().includes(searchLower) ||
      item.regional_saude.toLowerCase().includes(searchLower) ||
      item.classificacao_inmsd.toLowerCase().includes(searchLower)
    );
  }, []);

  // Filter data with all filters
  const filterData = useCallback((data: MicroRegionData[], filters: FilterOptions, search: string) => {
    let filtered = data;

    // Apply filters
    if (filters.macrorregiao) {
      filtered = filtered.filter(item => item.macrorregiao === filters.macrorregiao);
    }
    if (filters.regional_saude) {
      filtered = filtered.filter(item => item.regional_saude === filters.regional_saude);
    }
    if (filters.classificacao_inmsd) {
      filtered = filtered.filter(item => item.classificacao_inmsd === filters.classificacao_inmsd);
    }

    // Apply search
    filtered = filterDataWithSearch(filtered, search);

    return filtered;
  }, [filterDataWithSearch]);

  // Get cached data or compute new data
  const getCachedData = useCallback((filters: FilterOptions, search: string) => {
    const cacheKey = generateCacheKey(filters, search);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return cached.data;
    }

    setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [cache, generateCacheKey]);

  // Set cached data
  const setCachedData = useCallback((filters: FilterOptions, search: string, data: MicroRegionData[]) => {
    const cacheKey = generateCacheKey(filters, search);
    const newCache = new Map(cache);
    
    newCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      filters
    });

    // Clean old entries
    const now = Date.now();
    for (const [key, entry] of newCache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        newCache.delete(key);
      }
    }

    setCache(newCache);
    setStats(prev => ({ ...prev, size: newCache.size }));
  }, [generateCacheKey]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    setIsLoading(true);
    
    // Try to get from cache first
    const cached = getCachedData(filters, debouncedSearchTerm);
    if (cached) {
      setIsLoading(false);
      return cached;
    }

    // Compute new filtered data
    const newFilteredData = filterData(data, filters, debouncedSearchTerm);
    
    // Cache the result
    setCachedData(filters, debouncedSearchTerm, newFilteredData);
    
    setIsLoading(false);
    return newFilteredData;
  }, [data, filters, debouncedSearchTerm, getCachedData, filterData, setCachedData]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    setStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  return {
    filteredData,
    isLoading,
    searchTerm,
    setSearchTerm,
    clearCache,
    cacheStats: stats
  };
} 