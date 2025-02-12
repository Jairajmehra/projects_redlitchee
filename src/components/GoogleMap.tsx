import { useEffect, useRef, useCallback } from 'react';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers?: Array<MapMarker>;
  onMarkerClick?: (id: string) => void;
  onViewportChange?: (viewport: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
  mapTypeId?: 'roadmap' | 'hybrid';
}

interface MapMarker {
  position: { lat: number; lng: number };
  title: string;
  id: string;
  coverImage: string;
  projectType: string;
}

export default function GoogleMap({ 
  center, 
  zoom, 
  markers = [], 
  onMarkerClick,
  onViewportChange,
  mapTypeId = 'roadmap'
}: GoogleMapProps) {
  const { isLoaded, loadError } = useGoogleMapsScript();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const boundsChangedListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    console.log('🗺️ Initializing map with center:', center, 'zoom:', zoom);
    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      mapTypeId: mapTypeId as google.maps.MapTypeId,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    };

    mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
    infoWindowRef.current = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -20),
      maxWidth: 300,
      disableAutoPan: true
    });

    // Add bounds changed listener with a small delay
    if (onViewportChange) {
      boundsChangedListenerRef.current = mapInstanceRef.current.addListener('idle', () => {
        const bounds = mapInstanceRef.current?.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set new timeout to update viewport after map stops moving
          timeoutRef.current = setTimeout(() => {
            onViewportChange({
              minLat: sw.lat(),
              maxLat: ne.lat(),
              minLng: sw.lng(),
              maxLng: ne.lng()
            });
          }, 300); // 300ms debounce
        }
      });
    }
    
    console.log('🗺️ Map initialized');
  }, [isLoaded, center, zoom, onViewportChange, mapTypeId]);

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (boundsChangedListenerRef.current) {
        google.maps.event.removeListener(boundsChangedListenerRef.current);
      }
      // Clear all markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current.clear();
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to create InfoWindow content
  const createInfoWindowContent = useCallback((markerData: MapMarker) => {
    return `
      <div class="bg-white rounded-lg shadow-lg overflow-hidden" style="width: 280px;">
        <div class="relative h-40 w-full">
          <img 
            src="${markerData.coverImage || '/commercial_building.png'}" 
            alt="${markerData.title}"
            class="w-full h-full object-cover"
            onerror="this.src='/commercial_building.png'"
          />
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1">${markerData.title}</h3>
          <p class="text-gray-600 text-sm">${markerData.projectType || 'Commercial Project'}</p>
        </div>
      </div>
    `;
  }, []);

  // Function to update markers
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current) {
      console.log('🚫 Map or InfoWindow not initialized yet');
      return;
    }

    console.log('🔄 Updating markers, count:', markers.length);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    // Create new markers
    markers.forEach(markerData => {
      console.log('📍 Creating marker for:', markerData.title, 'at:', markerData.position);
      
      const marker = new google.maps.Marker({
        position: markerData.position,
        title: markerData.title,
        map: mapInstanceRef.current
      });

      // Add click listener
      marker.addListener('click', () => {
        infoWindowRef.current?.close();
        infoWindowRef.current?.setContent(createInfoWindowContent(markerData));
        infoWindowRef.current?.open({
          anchor: marker,
          map: mapInstanceRef.current,
          shouldFocus: false
        });

        if (onMarkerClick) {
          onMarkerClick(markerData.id);
        }
      });

      markersRef.current.set(markerData.id, marker);
    });

    console.log('✅ Markers updated successfully');
  }, [markers, createInfoWindowContent, onMarkerClick]);

  // Update markers when markers prop changes or map is initialized
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    updateMarkers();
  }, [isLoaded, markers, updateMarkers]);

  // Update map center and zoom when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(center);
    mapInstanceRef.current.setZoom(zoom);
  }, [center, zoom]);

  // Update map type when prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapTypeId as google.maps.MapTypeId);
    }
  }, [mapTypeId]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Failed to load Google Maps</p>
          <p className="text-sm text-gray-600">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E55C5C] border-r-transparent" />
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
} 