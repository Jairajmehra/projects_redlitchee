import { useState, useEffect } from 'react';
import type { CommercialApiResponse } from '@/types/project';

interface MapMarker {
  position: { lat: number; lng: number };
  title: string;
  id: string;
  coverImage: string;
  projectType: string;
}

export function useCommercialMapMarkers() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google?.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        // If not loaded, check again in 100ms
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };

    checkGoogleMapsLoaded();
  }, []);

  // Fetch markers only after Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded) return;

    const fetchAllMarkers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching markers...');
        const response = await fetch(
          'https://test-vision-api-389008.el.r.appspot.com/commercial_projects?page=1&limit=1000'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch map markers');
        }

        const data: CommercialApiResponse = await response.json();
        
        console.log('Total projects fetched:', data.projects.length);
        
        // Log projects with coordinates
        const projectsWithCoordinates = data.projects.filter(project => project.Coordinates && project.Coordinates.includes(','));
        console.log('Projects with valid coordinates:', projectsWithCoordinates.length);
        
        // Transform projects into markers
        const validMarkers = projectsWithCoordinates.map(project => {
          const [lat, lng] = project.Coordinates.split(',').map(parseFloat);
          return {
            position: { lat, lng },
            title: project.name,
            id: project.rera,
            coverImage: project.coverPhotoLink,
            projectType: project.aboutProject || 'Commercial Project'
          };
        });

        console.log('Markers being placed on map:', validMarkers.length);
        console.log('Sample marker data:', validMarkers[0]);

        setMarkers(validMarkers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching markers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMarkers();
  }, [isGoogleMapsLoaded]); // Only run when Google Maps is loaded

  return { 
    markers, 
    loading, 
    error,
    isReady: isGoogleMapsLoaded // Add this to inform components about map readiness
  };
} 