import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project, ApiResponse } from '@/types/project';

export function useResidentialSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Keep track of the last query to prevent unnecessary resets
  const lastQuery = useRef(query);

  const searchProjects = useCallback(async () => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://test-vision-api-389008.el.r.appspot.com/search_residential_projects?q=${encodeURIComponent(query)}&page=${page}&limit=6`
      );

      if (!response.ok) {
        throw new Error('Failed to search projects');
      }

      const data: ApiResponse = await response.json();
      
      setSearchResults(prev => {
        // If query changed, replace results
        if (lastQuery.current !== query) {
          lastQuery.current = query;
          return data.projects;
        }
        // Otherwise, append new results
        const currentProjectNames = new Set(prev.map(p => p.name));
        const newProjects = data.projects.filter(p => !currentProjectNames.has(p.name));
        return [...prev, ...newProjects];
      });
      
      setHasMore(data.has_more);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasMore(false);
      return;
    }

    // Only reset page if query actually changed
    if (lastQuery.current !== query) {
      const handler = setTimeout(() => {
        setPage(1);
        searchProjects();
      }, debounceMs);

      return () => clearTimeout(handler);
    }
  }, [query, debounceMs, searchProjects]);

  // Load more effect
  useEffect(() => {
    if (page > 1 && query.trim() && lastQuery.current === query) {
      searchProjects();
    }
  }, [page, query, searchProjects]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && query.trim()) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore, query]);

  return {
    query,
    setQuery,
    searchResults,
    loading,
    error,
    hasMore,
    loadMore
  };
} 