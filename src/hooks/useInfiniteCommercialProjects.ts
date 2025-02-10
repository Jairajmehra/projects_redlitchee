import { useState, useEffect, useCallback } from 'react';
import type { CommercialProject, CommercialApiResponse } from '@/types/project';

export function useInfiniteCommercialProjects(limit: number = 6) {
  const [projects, setProjects] = useState<CommercialProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProjectCount, setTotalProjectCount] = useState(0);

  const formatProject = (project: CommercialApiResponse['projects'][0]): CommercialProject => ({
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
    totalUnitsAvailable: project.totalUnitsAvailable,
    numberOfTowers: project.numberOfTowers,
    projectStatus: project.projectStatus,
    coordinates: project.Coordinates,
  });

  const fetchProjects = useCallback(async (pageNum: number) => {
    const offset = (pageNum - 1) * limit;
    const response = await fetch(
      `https://test-vision-api-389008.el.r.appspot.com/commercial_projects?page=${pageNum}&offset=${offset}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch commercial projects');
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