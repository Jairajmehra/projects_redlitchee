import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResidentialApiResponse } from '@/types/project';

interface MapMarker {
  position: { lat: number; lng: number };
  title: string;
  id: string;
  coverImage: string;
  projectType: string;
}

interface Viewport {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface CacheEntry {
  viewport: Viewport;
  markers: MapMarker[];
  timestamp: number;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const CACHE_SIZE = 10; // Keep last 10 viewport results
const DEBOUNCE_MS = 800; // Increased debounce time
const EXTENSION_FACTOR = 0.2; // 20% extension for viewport bounds

// Utility function to calculate extended bounds
function getExtendedBounds(viewport: Viewport, extensionFactor = EXTENSION_FACTOR): Viewport {
  const latExt = (viewport.maxLat - viewport.minLat) * extensionFactor;
  const lngExt = (viewport.maxLng - viewport.minLng) * extensionFactor;

  return {
    minLat: viewport.minLat - latExt,
    maxLat: viewport.maxLat + latExt,
    minLng: viewport.minLng - lngExt,
    maxLng: viewport.maxLng + lngExt,
  };
}

export function useResidentialMapMarkers(debounceMs: number = DEBOUNCE_MS) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastViewportRef = useRef<Viewport | null>(null);
  const cacheRef = useRef<CacheEntry[]>([]);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google?.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };

    checkGoogleMapsLoaded();
  }, []);

  // Function to check if a point is within a viewport
  const isPointInViewport = useCallback((lat: number, lng: number, viewport: Viewport) => {
    return (
      lat >= viewport.minLat &&
      lat <= viewport.maxLat &&
      lng >= viewport.minLng &&
      lng <= viewport.maxLng
    );
  }, []);

  // Function to check if viewport A fully contains viewport B
  const viewportContains = useCallback((a: Viewport, b: Viewport) => {
    return (
      a.minLat <= b.minLat &&
      a.maxLat >= b.maxLat &&
      a.minLng <= b.minLng &&
      a.maxLng >= b.maxLng
    );
  }, []);

  // Function to check if viewport has changed significantly
  const hasViewportChangedSignificantly = useCallback((oldViewport: Viewport | null, newViewport: Viewport) => {
    if (!oldViewport) return true;

    const latChange = Math.abs(
      (oldViewport.maxLat - oldViewport.minLat) - (newViewport.maxLat - newViewport.minLat)
    );
    const lngChange = Math.abs(
      (oldViewport.maxLng - oldViewport.minLng) - (newViewport.maxLng - newViewport.minLng)
    );

    const oldCenterLat = (oldViewport.maxLat + oldViewport.minLat) / 2;
    const oldCenterLng = (oldViewport.maxLng + oldViewport.minLng) / 2;
    const newCenterLat = (newViewport.maxLat + newViewport.minLat) / 2;
    const newCenterLng = (newViewport.maxLng + newViewport.minLng) / 2;

    const centerLatChange = Math.abs(newCenterLat - oldCenterLat);
    const centerLngChange = Math.abs(newCenterLng - oldCenterLng);

    const ZOOM_THRESHOLD = 0.1;
    const PAN_THRESHOLD = 0.05;

    const viewportHeight = oldViewport.maxLat - oldViewport.minLat;
    const viewportWidth = oldViewport.maxLng - oldViewport.minLng;

    return (
      latChange / viewportHeight > ZOOM_THRESHOLD ||
      lngChange / viewportWidth > ZOOM_THRESHOLD ||
      centerLatChange / viewportHeight > PAN_THRESHOLD ||
      centerLngChange / viewportWidth > PAN_THRESHOLD
    );
  }, []);

  // Function to get cached markers for a viewport
  const getCachedMarkers = useCallback((viewport: Viewport): MapMarker[] | null => {
    const now = Date.now();
    
    cacheRef.current = cacheRef.current.filter(
      entry => now - entry.timestamp < CACHE_EXPIRY
    );

    const cacheEntry = cacheRef.current.find(entry => 
      viewportContains(entry.viewport, viewport)
    );

    if (!cacheEntry) return null;

    return cacheEntry.markers.filter(marker => 
      isPointInViewport(marker.position.lat, marker.position.lng, viewport)
    );
  }, [isPointInViewport, viewportContains]);

  // Function to add markers to cache
  const addToCache = useCallback((viewport: Viewport, markers: MapMarker[]) => {
    const now = Date.now();
    
    cacheRef.current.push({
      viewport,
      markers,
      timestamp: now
    });

    if (cacheRef.current.length > CACHE_SIZE) {
      cacheRef.current = cacheRef.current.slice(-CACHE_SIZE);
    }
  }, []);

  // Function to fetch markers for current viewport
  const fetchMarkersForViewport = useCallback(async (bounds: Viewport) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate extended bounds
      const extendedBounds = getExtendedBounds(bounds);

      // Check if new viewport is within previous extended bounds
      if (lastViewportRef.current && viewportContains(lastViewportRef.current, bounds)) {
        console.log('🗺️ New viewport within previous extended bounds, skipping fetch');
        setLoading(false);
        return;
      }

      // Check cache with extended bounds
      const cachedMarkers = getCachedMarkers(extendedBounds);
      if (cachedMarkers) {
        console.log('🗺️ Using cached markers for viewport');
        // Merge with existing markers to avoid flickering
        setMarkers(prevMarkers => {
          const markerMap = new Map(prevMarkers.map(m => [m.id, m]));
          cachedMarkers.forEach(m => markerMap.set(m.id, m));
          return Array.from(markerMap.values());
        });
        setLoading(false);
        return;
      }

      console.log('🗺️ Fetching markers for extended viewport:', extendedBounds);
      
      let allMarkers: MapMarker[] = [];
      let page = 1;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const queryParams = new URLSearchParams({
          minLat: extendedBounds.minLat.toString(),
          maxLat: extendedBounds.maxLat.toString(),
          minLng: extendedBounds.minLng.toString(),
          maxLng: extendedBounds.maxLng.toString(),
          page: page.toString(),
          limit: limit.toString(),
          offset: ((page - 1) * limit).toString()
        });

        console.log(`🗺️ Fetching page ${page} of markers...`);
        const response = await fetch(
          `https://test-vision-api-389008.el.r.appspot.com/residential_projects_viewport?${queryParams}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch map markers');
        }

        const data: ResidentialApiResponse = await response.json();
        console.log(`🗺️ Received ${data.projects.length} projects for page ${page}`);
        
        const validMarkers = data.projects.map(project => {
          // Handle both lowercase 'coordinates' and uppercase 'Coordinates'
          const coordinatesStr = project.coordinates || (project as any).Coordinates;
          if (!coordinatesStr) {
            console.log('🚫 Missing coordinates for project:', project.name);
            return null;
          }

          const [lat, lng] = coordinatesStr.split(',').map((str: string) => parseFloat(str.trim()));
          
          if (isNaN(lat) || isNaN(lng)) {
            console.log('🚫 Invalid coordinates for project:', project.name);
            return null;
          }

          return {
            position: { lat, lng },
            title: project.name,
            id: project.rera,
            coverImage: project.coverPhotoLink,
            projectType: project.projectType[0] || 'Residential Project'
          };
        }).filter((marker): marker is MapMarker => marker !== null);

        allMarkers = [...allMarkers, ...validMarkers];
        console.log(`🗺️ Total valid markers so far: ${allMarkers.length}`);

        hasMore = data.has_more;
        if (hasMore) {
          page++;
        }
      }

      console.log('🗺️ Finished fetching all pages. Total markers:', allMarkers.length);

      // Add to cache with extended bounds
      addToCache(extendedBounds, allMarkers);

      // Merge with existing markers, only removing those definitely outside extended bounds
      setMarkers(prevMarkers => {
        const markerMap = new Map(prevMarkers.map(m => [m.id, m]));
        
        // Remove markers that are definitely outside extended bounds
        for (const [id, marker] of markerMap) {
          if (!isPointInViewport(marker.position.lat, marker.position.lng, extendedBounds)) {
            markerMap.delete(id);
          }
        }
        
        // Add new markers
        allMarkers.forEach(m => markerMap.set(m.id, m));
        return Array.from(markerMap.values());
      });

      lastViewportRef.current = extendedBounds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('🚨 Error fetching markers:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getCachedMarkers, addToCache, viewportContains, isPointInViewport]);

  // Debounced viewport update handler
  const debouncedSetViewport = useCallback((newViewport: Viewport) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (hasViewportChangedSignificantly(lastViewportRef.current, newViewport)) {
      timeoutRef.current = setTimeout(() => {
        setViewport(newViewport);
      }, debounceMs);
    }
  }, [debounceMs, hasViewportChangedSignificantly]);

  // Update markers when viewport changes
  useEffect(() => {
    if (!isGoogleMapsLoaded || !viewport) return;
    fetchMarkersForViewport(viewport);
  }, [isGoogleMapsLoaded, viewport, fetchMarkersForViewport]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { 
    markers, 
    loading, 
    error,
    isReady: isGoogleMapsLoaded,
    setViewport: debouncedSetViewport
  };
} 