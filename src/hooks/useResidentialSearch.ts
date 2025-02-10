import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResidentialProject, ResidentialApiResponse } from '@/types/project';

export function useResidentialSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ResidentialProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const lastQuery = useRef(query);

  const formatProject = (project: ResidentialApiResponse['projects'][0]): ResidentialProject => ({
    name: project.name,
    locality: Array.isArray(project.localityNames) ? project.localityNames.join(', ') : '',
    propertyType: project.projectType[0] || '',
    unitSizes: project.configuration.value,
    bhk: Array.isArray(project.bhk) ? project.bhk : [],
    brochureLink: project.brochureLink,
    rera: project.rera,
    certificateLink: project.certificateLink,
    configuration: project.configuration,
    coordinates: project.coordinates,
    coverPhotoLink: project.coverPhotoLink,
    endDate: project.endDate,
    localityNames: project.localityNames,
    mobile: project.mobile,
    numberOfTowers: project.numberOfTowers,
    photos: project.photos,
    planPassingAuthority: project.planPassingAuthority,
    price: project.price,
    projectAddress: project.projectAddress,
    projectLandArea: project.projectLandArea,
    projectStatus: project.projectStatus,
    projectType: Array.isArray(project.projectType) ? project.projectType : [],
    promoterName: project.promoterName,
    startDate: project.startDate,
    totalUnits: project.totalUnits,
    totalUnitsAvailable: project.totalUnitsAvailable
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

      const data: ResidentialApiResponse = await response.json();
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