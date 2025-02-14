'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import CommercialPropertyCard from "@/components/CommercialPropertyCard";
import { useInfiniteCommercialProjects } from '@/hooks/useInfiniteCommercialProjects';
import { useCommercialSearch } from '@/hooks/useCommercialSearch';

export default function CommercialPage() {
  const { 
    projects: allProjects, 
    loading: loadingAll, 
    error: errorAll, 
    hasMore: hasMoreAll, 
    loadMore: loadMoreAll 
  } = useInfiniteCommercialProjects(6);

  const {
    query,
    setQuery,
    searchResults,
    loading: loadingSearch,
    error: errorSearch,
    hasMore: hasMoreSearch,
    loadMore: loadMoreSearch
  } = useCommercialSearch(300);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingAll || loadingSearch) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (query.trim()) {
          if (hasMoreSearch) {
            loadMoreSearch();
          }
        } else {
          if (hasMoreAll) {
            loadMoreAll();
          }
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingAll, loadingSearch, query, hasMoreAll, hasMoreSearch, loadMoreAll, loadMoreSearch]);

  const projects = query.trim() ? searchResults : allProjects;
  const loading = loadingAll || loadingSearch;
  const error = errorAll || errorSearch;

  return (
    <div className="min-h-screen p-8">
      <header className="mb-12 flex flex-col md:flex-row items-center gap-4 md:justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-[#E55C5C] transition-colors">
          Redlitchee Realties
        </Link>
        <div className="flex flex-col items-center w-full md:w-auto gap-4">
          <h2 className="text-xl text-gray-600">Commercial Projects</h2>
          <div className="relative w-full max-w-xl">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E55C5C] focus:border-transparent"
            />
            {loadingSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E55C5C] border-r-transparent" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={project.name}
              ref={index === projects.length - 1 ? lastCardRef : undefined}
            >
              <CommercialPropertyCard {...project} />
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
            No projects found matching &quot;{query}&quot;
          </div>
        )}
      </main>
    </div>
  );
} 