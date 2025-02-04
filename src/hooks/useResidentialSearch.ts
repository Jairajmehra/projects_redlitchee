import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project, ApiResponse } from '@/types/project';

export function useResidentialSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const lastQuery = useRef(query);

  const formatProject = (project: ApiResponse['projects'][0]): Project => ({
    name: project.name,
    locality: project.locality,
    propertyType: project.propertyType,
    unitSizes: project.unitSizes,
    bhk: project.bhk,
    brochureLink: project.brochureLink,
    rera: project.rera
  });

  const searchProjects = useCallback(async () => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasMore(false);
      setTotalSearchResults(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * 6; // Using fixed limit of 6 to match the UI
      const response = await fetch(
        `https://test-vision-api-389008.el.r.appspot.com/search_residential_projects?q=${encodeURIComponent(query)}&page=${page}&offset=${offset}&limit=6`
      );

      if (!response.ok) {
        throw new Error('Failed to search projects');
      }

      const data: ApiResponse = await response.json();
      const formattedProjects = data.projects.map(formatProject);
      
      // If query changed or it's first page, replace results
      // Otherwise, append new results for pagination
      if (lastQuery.current !== query) {
        lastQuery.current = query;
        setSearchResults(formattedProjects);
      } else {
        setSearchResults(prev => page === 1 ? formattedProjects : [...prev, ...formattedProjects]);
      }
      
      setHasMore(data.has_more);
      setTotalSearchResults(data.total);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  // Handle new search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasMore(false);
      setTotalSearchResults(0);
      return;
    }

    if (lastQuery.current !== query) {
      const handler = setTimeout(() => {
        setPage(1); // Reset to first page for new search
        searchProjects();
      }, debounceMs);

      return () => clearTimeout(handler);
    }
  }, [query, debounceMs, searchProjects]);

  // Handle pagination
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
    loadMore,
    totalSearchResults
  };
} 