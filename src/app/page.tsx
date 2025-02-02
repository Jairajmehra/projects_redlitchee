'use client';

import { useRef, useCallback, useState } from 'react';
import PropertyCard from "@/components/PropertyCard";
import CommercialPropertyCard from "@/components/CommercialPropertyCard";
import PropertyTypeSwitch from "@/components/PropertyTypeSwitch";
import { useInfiniteProjects } from '@/hooks/useInfiniteProjects';
import { useInfiniteCommercialProjects } from '@/hooks/useInfiniteCommercialProjects';

export default function Home() {
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  
  // Residential projects hook
  const { 
    projects: residentialProjects, 
    loading: residentialLoading, 
    error: residentialError, 
    hasMore: hasMoreResidential, 
    loadMore: loadMoreResidential 
  } = useInfiniteProjects(6);

  // Commercial projects hook
  const { 
    projects: commercialProjects, 
    loading: commercialLoading, 
    error: commercialError, 
    hasMore: hasMoreCommercial, 
    loadMore: loadMoreCommercial 
  } = useInfiniteCommercialProjects(6);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if ((propertyType === 'residential' && residentialLoading) || 
        (propertyType === 'commercial' && commercialLoading)) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (propertyType === 'residential' && hasMoreResidential) {
          loadMoreResidential();
        } else if (propertyType === 'commercial' && hasMoreCommercial) {
          loadMoreCommercial();
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [
    propertyType, 
    residentialLoading, 
    commercialLoading, 
    hasMoreResidential, 
    hasMoreCommercial, 
    loadMoreResidential, 
    loadMoreCommercial
  ]);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-12 flex flex-col md:flex-row items-center gap-4 md:justify-between">
        <h1 className="text-2xl font-bold">Redlitchee Realties</h1>
        <PropertyTypeSwitch onSwitch={setPropertyType} />
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {propertyType === 'residential' ? (
            // Residential Projects
            residentialProjects.map((project, index) => (
              <div
                key={index}
                ref={index === residentialProjects.length - 1 ? lastCardRef : undefined}
              >
                <PropertyCard {...project} />
              </div>
            ))
          ) : (
            // Commercial Projects
            commercialProjects.map((project, index) => (
              <div
                key={index}
                ref={index === commercialProjects.length - 1 ? lastCardRef : undefined}
              >
                <CommercialPropertyCard {...project} />
              </div>
            ))
          )}
        </div>
        
        {/* Loading State */}
        {((propertyType === 'residential' && residentialLoading) ||
          (propertyType === 'commercial' && commercialLoading)) && (
          <div className="text-center mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        )}
        
        {/* Error State */}
        {((propertyType === 'residential' && residentialError) ||
          (propertyType === 'commercial' && commercialError)) && (
          <div className="text-red-500 text-center mt-8">
            Error: {propertyType === 'residential' ? residentialError : commercialError}
          </div>
        )}
      </main>
    </div>
  );
}
