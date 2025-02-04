'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import PropertyCard from "@/components/PropertyCard";
import { useInfiniteProjects } from '@/hooks/useInfiniteProjects';
import { useResidentialSearch } from '@/hooks/useResidentialSearch';

export default function ResidentialPage() {
  const { 
    projects: allProjects, 
    loading: loadingAll, 
    error: errorAll, 
    hasMore: hasMoreAll, 
    loadMore: loadMoreAll 
  } = useInfiniteProjects(6);

  const {
    query,
    setQuery,
    searchResults,
    loading: loadingSearch,
    error: errorSearch,
    hasMore: hasMoreSearch,
    loadMore: loadMoreSearch
  } = useResidentialSearch(300);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingAll || loadingSearch) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (query.trim()) {
          hasMoreSearch && loadMoreSearch();
        } else {
          hasMoreAll && loadMoreAll();
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingAll, loadingSearch, query, hasMoreAll, hasMoreSearch, loadMoreAll, loadMoreSearch]);

  const projects = query.trim() ? searchResults : allProjects;
  const loading = loadingAll || loadingSearch;
  const error = errorAll || errorSearch;

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold">
              Redlitchee Realties
            </Link>
            <div className="flex gap-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-[#E55C5C] transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/commercial" 
                className="text-gray-600 hover:text-[#E55C5C] transition-colors"
              >
                Commercial
              </Link>
              <Link 
                href="/residential" 
                className="text-[#E55C5C]"
              >
                Residential
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Count and Search */}
        <div className="mb-8 space-y-4">
          <h1 className="text-2xl font-semibold">
            {projects.length} Residential Projects
          </h1>
          <div className="max-w-xl relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search residential projects by name"
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E55C5C] focus:border-transparent"
            />
            {loadingSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E55C5C] border-r-transparent" />
              </div>
            )}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* No Results State */}
        {query.trim() && !loading && searchResults.length === 0 && (
          <div className="text-center mt-8 text-gray-600">
            No projects found matching "{query}"
          </div>
        )}
      </main>
    </div>
  );
} 