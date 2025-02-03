'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import PropertyCard from "@/components/PropertyCard";
import { useInfiniteProjects } from '@/hooks/useInfiniteProjects';

export default function ResidentialPage() {
  const { 
    projects, 
    loading, 
    error, 
    hasMore, 
    loadMore 
  } = useInfiniteProjects(6);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-12 flex flex-col md:flex-row items-center gap-4 md:justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-[#E55C5C] transition-colors">
          Redlitchee Realties
        </Link>
        <h2 className="text-xl text-gray-600">Residential Projects</h2>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={project.name}
              ref={index === projects.length - 1 ? lastCardRef : undefined}
            >
              <PropertyCard {...project} />
            </div>
          ))}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-red-500 text-center mt-8">
            Error: {error}
          </div>
        )}
      </main>
    </div>
  );
} 