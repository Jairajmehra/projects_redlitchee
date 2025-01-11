import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, ApiResponse } from '@/types/project';

export function useInfiniteProjects(limit: number = 6) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Cache the results
  const cache = useRef<Map<number, Project[]>>(new Map());

  const loadProjects = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      setError(null);

      if (cache.current.has(page)) {
        setProjects(prev => [...prev, ...cache.current.get(page)!]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://test-vision-api-389008.el.r.appspot.com/projects?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ApiResponse = await response.json();
      
      cache.current.set(page, data.projects);
      
      setProjects(prev => {
        const newProjects = [...prev, ...data.projects];
        setHasMore(newProjects.length < data.total);
        return newProjects;
      });
      
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

  useEffect(() => {
    loadProjects();
  }, [page, loadProjects]);

  return { projects, loading, error, hasMore, loadMore };
} 