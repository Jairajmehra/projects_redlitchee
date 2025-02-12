import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResidentialProject, ResidentialApiResponse } from '@/types/project';

interface Viewport {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface CacheEntry {
  viewport: Viewport;
  projects: ResidentialProject[];
  total: number;
  hasMore: boolean;
  timestamp: number;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const CACHE_SIZE = 10;
const EXTENSION_FACTOR = 0.2; // 20% extension for viewport bounds

// Function to check if viewport A fully contains viewport B
function viewportContains(a: Viewport, b: Viewport): boolean {
  return (
    a.minLat <= b.minLat &&
    a.maxLat >= b.maxLat &&
    a.minLng <= b.minLng &&
    a.maxLng >= b.maxLng
  );
}

export function useInfiniteResidentialProjectsViewport(viewport: Viewport | null, limit: number = 6) {
  const [projects, setProjects] = useState<ResidentialProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const cacheRef = useRef<CacheEntry[]>([]);
  const lastViewportRef = useRef<Viewport | null>(null);
  const lastZoomLevelRef = useRef<number | null>(null);

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
    coordinates: project.coordinates || (project as any).Coordinates || '',
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

  // Function to calculate zoom level based on viewport size
  const getZoomLevel = useCallback((viewport: Viewport) => {
    const latSpan = viewport.maxLat - viewport.minLat;
    const lngSpan = viewport.maxLng - viewport.minLng;
    return Math.log2(360 / Math.max(latSpan, lngSpan));
  }, []);

  // Function to check if viewport change requires new data fetch
  const shouldFetchNewData = useCallback((oldViewport: Viewport | null, newViewport: Viewport) => {
    if (!oldViewport) return true;

    const oldZoom = lastZoomLevelRef.current;
    const newZoom = getZoomLevel(newViewport);
    
    // Calculate the center points
    const oldCenterLat = (oldViewport.maxLat + oldViewport.minLat) / 2;
    const oldCenterLng = (oldViewport.maxLng + oldViewport.minLng) / 2;
    const newCenterLat = (newViewport.maxLat + newViewport.minLat) / 2;
    const newCenterLng = (newViewport.maxLng + newViewport.minLng) / 2;

    // Calculate viewport dimensions
    const oldHeight = oldViewport.maxLat - oldViewport.minLat;
    const oldWidth = oldViewport.maxLng - oldViewport.minLng;
    const newHeight = newViewport.maxLat - newViewport.minLat;
    const newWidth = newViewport.maxLng - newViewport.minLng;

    // Check for significant zoom change (>10% change in size)
    const sizeChange = Math.abs(1 - (newHeight * newWidth) / (oldHeight * oldWidth));
    if (sizeChange > 0.1) {
      console.log('📋 Significant zoom change detected');
      return true;
    }

    // Check for significant pan (>25% of viewport size)
    const latChange = Math.abs(newCenterLat - oldCenterLat) / oldHeight;
    const lngChange = Math.abs(newCenterLng - oldCenterLng) / oldWidth;
    if (latChange > 0.25 || lngChange > 0.25) {
      console.log('📋 Significant pan detected');
      return true;
    }

    return false;
  }, [getZoomLevel]);

  const fetchProjects = useCallback(async () => {
    if (!viewport) return;

    try {
      setLoading(true);
      setError(null);

      // Use viewport directly without extension for cards
      const queryParams = new URLSearchParams({
        minLat: viewport.minLat.toString(),
        maxLat: viewport.maxLat.toString(),
        minLng: viewport.minLng.toString(),
        maxLng: viewport.maxLng.toString(),
        page: page.toString(),
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString()
      });

      // Check if we need to fetch new data
      if (!shouldFetchNewData(lastViewportRef.current, viewport)) {
        console.log('📋 Viewport change does not require new data fetch');
        setLoading(false);
        return;
      }

      console.log(`📋 Fetching page ${page} of projects in viewport...`);
      const response = await fetch(
        `https://test-vision-api-389008.el.r.appspot.com/residential_projects_viewport?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ResidentialApiResponse = await response.json();
      const formattedProjects = data.projects.map(formatProject);

      if (page === 1) {
        setProjects(formattedProjects);
        lastViewportRef.current = viewport; // Store exact viewport
        lastZoomLevelRef.current = getZoomLevel(viewport);
      } else {
        setProjects(prev => [...prev, ...formattedProjects]);
      }

      setHasMore(data.has_more);
      setTotalProjectCount(data.total);

      console.log(`📋 Received ${formattedProjects.length} projects (total: ${data.total})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('🚨 Error fetching projects:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [viewport, page, limit, getZoomLevel, shouldFetchNewData]);

  // Reset state when viewport changes significantly
  useEffect(() => {
    if (viewport && shouldFetchNewData(lastViewportRef.current, viewport)) {
      console.log('📋 Significant viewport change detected, resetting state');
      setProjects([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
  }, [viewport, shouldFetchNewData]);

  // Fetch projects when viewport or page changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  return { 
    projects, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    totalProjectCount,
    resetPage: () => setPage(1)
  };
} 