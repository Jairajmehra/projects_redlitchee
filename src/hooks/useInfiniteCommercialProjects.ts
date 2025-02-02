import { useState, useEffect, useRef, useCallback } from 'react';
import type { CommercialProject } from '@/types/project';

interface CommercialApiResponse {
  limit: number;
  page: number;
  projects: Array<{
    name: string;
    averageCarpetArea: string;
    endDate: string;
    brochureLink: string;
    coverPhotoLink: string;
    aboutProject: string;
  }>;
  total: number;
  has_more: boolean;
}

export function useInfiniteCommercialProjects(limit: number = 6) {
  const [projects, setProjects] = useState<CommercialProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Cache the results
  const cache = useRef<Map<number, CommercialProject[]>>(new Map());

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
        `http://test-vision-api-389008.el.r.appspot.com/commercial_projects?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch commercial projects');
      }

      const data: CommercialApiResponse = await response.json();
      
      const formattedProjects: CommercialProject[] = data.projects.map(project => ({
        name: project.name,
        sizes: project.averageCarpetArea,
        possession: new Date(project.endDate).toLocaleDateString('en-US', { 
          month: 'long',
          year: 'numeric'
        }),
        brochureLink: project.brochureLink,
        about: project.aboutProject,
        coverImage: project.coverPhotoLink
      }));

      cache.current.set(page, formattedProjects);
      
      setProjects(prev => {
        const newProjects = [...prev, ...formattedProjects];
        setHasMore(data.has_more);
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