import { useState, useEffect, useCallback, useRef } from 'react';
import type { CommercialProject, CommercialApiResponse } from '@/types/project';

export function useCommercialSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CommercialProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const lastQuery = useRef(query);

  const formatProject = (project: CommercialApiResponse['projects'][0]): CommercialProject => ({
    name: project.name,
    sizes: project.averageCarpetArea,
    possession: new Date(project.endDate).toLocaleDateString('en-US', { 
      month: 'long',
      year: 'numeric'
    }),
    description: project.projectAddress,
    brochureLink: project.brochureLink,
    about: project.aboutProject,
    coverImage: project.coverPhotoLink,
    rera: project.rera,
    planPassingAuthority: project.planPassingAuthority,
    certificateLink: project.certificateLink,
    mobile: project.mobile,
    district: project.district,
    promoterName: project.promoterName,
    projectType: project.projectType,
    approvedDate: project.approvedDate,
    projectLandArea: project.projectLandArea.toString(),
    totalOpenArea: project.totalOpenArea.toString(),
    totalCoveredArea: project.totalCoveredArea.toString(),
    totalUnits: project.totalUnits.toString(),
    totalUnitsAvailable: project.totalUnitsAvailable.toString(),
    numberOfTowers: project.numberOfTowers.toString(),
    projectStatus: project.projectStatus,
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
        `https://test-vision-api-389008.el.r.appspot.com/search_commercial_projects?q=${encodeURIComponent(query)}&page=${page}&offset=${offset}&limit=6`
      );

      if (!response.ok) {
        throw new Error('Failed to search projects');
      }

      const data: CommercialApiResponse = await response.json();
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