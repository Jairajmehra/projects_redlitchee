import { useState, useEffect, useCallback } from 'react';
import type { Project, ApiResponse } from '@/types/project';

export function useInfiniteProjects(limit: number = 6) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProjectCount, setTotalProjectCount] = useState(0);

  const formatProject = (project: ApiResponse['projects'][0]): Project => ({
    name: project.name,
    locality: project.locality,
    propertyType: project.propertyType,
    unitSizes: project.unitSizes,
    bhk: project.bhk,
    brochureLink: project.brochureLink,
    rera: project.rera
  });

  const fetchProjects = useCallback(async (pageNum: number) => {
    const offset = (pageNum - 1) * limit;
    const response = await fetch(
      `https://test-vision-api-389008.el.r.appspot.com/projects?page=${pageNum}&offset=${offset}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch residential projects');
    }

    return response.json();
  }, [limit]);

  // Initial load to get total count
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await fetchProjects(1);
        setTotalProjectCount(data.total);
        setProjects(data.projects.map(formatProject));
        setHasMore(data.has_more);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchInitialData();
  }, [fetchProjects]);

  const loadProjects = useCallback(async () => {
    if (loading || page === 1) return; // Skip if it's the first page (already loaded)
    
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProjects(page);
      const formattedProjects = data.projects.map(formatProject);

      setProjects(prev => [...prev, ...formattedProjects]);
      setHasMore(data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, loading, fetchProjects]);

  useEffect(() => {
    loadProjects();
  }, [page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  return { projects, loading, error, hasMore, loadMore, totalProjectCount };
} 