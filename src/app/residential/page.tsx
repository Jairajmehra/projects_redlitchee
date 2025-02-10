'use client';

import { useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ResidentialPropertyCard from "@/components/ResidentialPropertyCard";
import Navbar from "@/components/Navbar";
import { useInfiniteResidentialProjects } from '@/hooks/useInfiniteResidentialProjects';
import { useResidentialSearch } from '@/hooks/useResidentialSearch';

export default function ResidentialPage() {
  const pathname = usePathname();
  const { 
    projects: allProjects, 
    loading: loadingAll, 
    error: errorAll, 
    hasMore: hasMoreAll, 
    loadMore: loadMoreAll,
    totalProjectCount 
  } = useInfiniteResidentialProjects(6);

  const {
    query,
    setQuery,
    searchResults,
    loading: loadingSearch,
    error: errorSearch,
    hasMore: hasMoreSearch,
    loadMore: loadMoreSearch,
    totalSearchResults
  } = useResidentialSearch(300);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingAll || loadingSearch) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const isSearching = query.trim().length > 0;
        if (isSearching && hasMoreSearch) {
          loadMoreSearch();
        } else if (!isSearching && hasMoreAll) {
          loadMoreAll();
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingAll, loadingSearch, query, hasMoreAll, hasMoreSearch, loadMoreAll, loadMoreSearch]);

  const isSearching = query.trim().length > 0;
  const projects = isSearching ? searchResults : allProjects;
  const loading = isSearching ? loadingSearch : loadingAll;
  const error = isSearching ? errorSearch : errorAll;

  return (
    <div className="min-h-screen">
      <Navbar currentPath={pathname} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Count and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">
              {totalProjectCount} Residential Projects
            </h1>
            {isSearching && !loadingSearch && (
              <p className="text-gray-600">
                Found {totalSearchResults} matching results
              </p>
            )}
          </div>
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
              key={project.rera}
              ref={index === projects.length - 1 ? lastCardRef : undefined}
            >
              <ResidentialPropertyCard {...project} />
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
        {isSearching && !loading && searchResults.length === 0 && (
          <div className="text-center mt-8 text-gray-600">
            No projects found matching "{query}"
          </div>
        )}
      </main>
    </div>
  );
} 