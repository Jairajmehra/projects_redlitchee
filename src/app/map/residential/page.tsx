'use client';

import { useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import ResidentialPropertyCard from "@/components/ResidentialPropertyCard";
import Navbar from "@/components/Navbar";
import GoogleMap from "@/components/GoogleMap";
import { useResidentialMapMarkers } from '@/hooks/useResidentialMapMarkers';
import { useInfiniteResidentialProjectsViewport } from '@/hooks/useInfiniteResidentialProjectsViewport';
import { useUserLocation } from '@/hooks/useUserLocation';

// Ahmedabad coordinates
const AHMEDABAD_CENTER = {
  lat: 23.0225,
  lng: 72.5714
};

interface Viewport {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const EXTENSION_FACTOR = 0.2; // 20% extension for viewport bounds

// Utility function to calculate extended bounds
function getExtendedBounds(viewport: Viewport): Viewport {
  const latSpan = viewport.maxLat - viewport.minLat;
  const lngSpan = viewport.maxLng - viewport.minLng;
  return {
    minLat: viewport.minLat - (latSpan * EXTENSION_FACTOR),
    maxLat: viewport.maxLat + (latSpan * EXTENSION_FACTOR),
    minLng: viewport.minLng - (lngSpan * EXTENSION_FACTOR),
    maxLng: viewport.maxLng + (lngSpan * EXTENSION_FACTOR)
  };
}

export default function ResidentialMapPage() {
  const pathname = usePathname();
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [isLoadingNewArea, setIsLoadingNewArea] = useState(false);
  
  // Get user location
  const { location, loading: loadingLocation, error: locationError } = useUserLocation(AHMEDABAD_CENTER);
  
  // Fetch all map markers at once
  const { markers, loading: loadingMarkers, setViewport: setMarkerViewport } = useResidentialMapMarkers();
  
  // Fetch project cards with viewport-based pagination
  const { 
    projects, 
    loading: loadingCards,
    error: errorCards, 
    hasMore, 
    loadMore,
    totalProjectCount
  } = useInfiniteResidentialProjectsViewport(viewport, 6);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingCards) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingCards, hasMore, loadMore]);

  // Handle viewport changes
  const handleViewportChange = useCallback((newViewport: Viewport) => {
    // For markers: Calculate extended bounds (20% extension)
    const extendedViewport = getExtendedBounds(newViewport);
    console.log('🗺️ Marker viewport changed with buffer:', extendedViewport);
    
    // For cards: Use exact viewport without extension
    console.log('📋 Card viewport changed:', newViewport);
    
    // Update markers with extended viewport
    setMarkerViewport(extendedViewport);
    // Update cards with exact viewport
    setViewport(newViewport);
  }, [setMarkerViewport]);

  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('roadmap');

  return (
    <div className="min-h-screen">
      <Navbar currentPath={pathname} />

      {/* Filter Section */}
      <div className="w-full bg-white shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            {totalProjectCount > 0 ? (
              <span className="text-lg font-semibold">
                {totalProjectCount} project{totalProjectCount !== 1 ? 's' : ''} in view
              </span>
            ) : null}
          </div>
          <button
            onClick={() => setMapTypeId(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            {mapTypeId === 'roadmap' ? 'Switch to Hybrid' : 'Switch to Map'}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-9rem)]">
        {/* Map Section */}
        <div className="flex-1 bg-gray-100 relative">
          {/* Loading States */}
          {(loadingLocation || (!markers.length && loadingMarkers)) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-2 text-gray-600">
                  {loadingLocation ? 'Getting your location...' : 'Loading map markers...'}
                </p>
              </div>
            </div>
          )}
          
          {/* Location Error Message */}
          {locationError && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">{locationError}</p>
              </div>
            </div>
          )}
          
          <GoogleMap
            center={location || AHMEDABAD_CENTER}
            zoom={location ? 15 : 12}
            markers={markers}
            onViewportChange={handleViewportChange}
            mapTypeId={mapTypeId}
          />
        </div>

        {/* Projects List Section */}
        <div className="w-[800px] bg-white overflow-y-auto">
          <div className="p-4">
            {/* Loading State */}
            {loadingCards && (
              <div className="flex justify-center py-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              </div>
            )}

            {/* Error State */}
            {errorCards && (
              <div className="text-red-500 text-center py-4">
                Error: {errorCards}
              </div>
            )}

            {/* No Projects State */}
            {!loadingCards && projects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No projects found in this area
              </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-2 gap-4">
              {projects.map((project, index) => (
                <div
                  key={project.rera}
                  ref={index === projects.length - 1 ? lastCardRef : undefined}
                  className="flex justify-center"
                >
                  <div className="w-full max-w-[400px]">
                    <ResidentialPropertyCard {...project} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More */}
            {hasMore && !loadingCards && projects.length > 0 && (
              <div className="mt-4">
                <button 
                  onClick={loadMore}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 