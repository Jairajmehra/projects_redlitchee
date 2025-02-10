'use client';

import { useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import CommercialPropertyCard from "@/components/CommercialPropertyCard";
import Navbar from "@/components/Navbar";
import GoogleMap from "@/components/GoogleMap";
import { useInfiniteCommercialProjects } from '@/hooks/useInfiniteCommercialProjects';
import { useCommercialMapMarkers } from '@/hooks/useCommercialMapMarkers';
import { useUserLocation } from '@/hooks/useUserLocation';

// Ahmedabad coordinates
const AHMEDABAD_CENTER = {
  lat: 23.0225,
  lng: 72.5714
};

export default function CommercialMapPage() {
  const pathname = usePathname();
  
  // Get user location
  const { location, loading: loadingLocation, error: locationError } = useUserLocation(AHMEDABAD_CENTER);
  
  // Fetch all map markers at once
  const { markers, loading: loadingMarkers } = useCommercialMapMarkers();
  
  // Fetch project cards with pagination
  const { 
    projects: allProjects, 
    loading: loadingProjects, 
    error: errorProjects, 
    hasMore, 
    loadMore
  } = useInfiniteCommercialProjects(6);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingProjects) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingProjects, hasMore, loadMore]);

  return (
    <div className="min-h-screen">
      <Navbar currentPath={pathname} />

      {/* Filter Section */}
      <div className="w-full bg-white shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto">
          Filters will come here
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
          />
        </div>

        {/* Projects List Section */}
        <div className="w-[800px] bg-white overflow-y-auto">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {allProjects.map((project, index) => (
                <div
                  key={project.rera}
                  ref={index === allProjects.length - 1 ? lastCardRef : undefined}
                >
                  <CommercialPropertyCard {...project} />
                </div>
              ))}
            </div>
            
            {/* Loading State */}
            {loadingProjects && (
              <div className="text-center py-4 col-span-2">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
            )}
            
            {/* Error State */}
            {errorProjects && (
              <div className="text-red-500 text-center py-4 col-span-2">
                Error: {errorProjects}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 