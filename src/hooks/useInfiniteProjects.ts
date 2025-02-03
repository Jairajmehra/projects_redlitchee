import { useState, useEffect, useCallback } from 'react';
import type { Project, ApiResponse } from '@/types/project';

export function useInfiniteProjects(limit: number = 6) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadProjects = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * limit;
      const response = await fetch(
        `https://test-vision-api-389008.el.r.appspot.com/projects?page=${page}&limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ApiResponse = await response.json();
      
      setProjects(prev => {
        // Only add new projects
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
  }, [page, limit, loading, hasMore]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // Only run effect when page changes
  useEffect(() => {
    loadProjects();
  }, [page]); // Remove loadProjects from dependency array

  return { projects, loading, error, hasMore, loadMore };
} 