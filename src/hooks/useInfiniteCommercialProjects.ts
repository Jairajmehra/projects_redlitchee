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
    description: string;
    aboutProject: string;
    rera: string;
    planPassingAuthority: string;
    certificateLink: string;
    mobile: string;
    district: string;
    promoterName: string;
    projectType: string;
    approvedDate: string;
    projectLandArea: string;
    totalOpenArea: string;
    totalCoveredArea: string;
    totalUnits: string;
    totalAvailableUnits: string;
    numberOfTowers: string;
    projectStatus: string;
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
        `https://test-vision-api-389008.el.r.appspot.com/commercial_projects?page=${page}&limit=${limit}`
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
        description: project.description,
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
        projectLandArea: project.projectLandArea,
        totalOpenArea: project.totalOpenArea,
        totalCoveredArea: project.totalCoveredArea,
        totalUnits: project.totalUnits,
        totalAvailableUnits: project.totalAvailableUnits,
        numberOfTowers: project.numberOfTowers,
        projectStatus: project.projectStatus,
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