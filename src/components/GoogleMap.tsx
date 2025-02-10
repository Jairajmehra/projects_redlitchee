import { useEffect, useRef, useCallback } from 'react';

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers?: Array<MapMarker>;
  onMarkerClick?: (id: string) => void;
}

interface MapMarker {
  position: { lat: number; lng: number };
  title: string;
  id: string;
  coverImage: string;
  projectType: string;
}

export default function GoogleMap({ center, zoom, markers = [], onMarkerClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Function to create InfoWindow content
  const createInfoWindowContent = (markerData: MapMarker) => {
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
  };

  // Function to update markers
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current) {
      console.log('Map or InfoWindow not initialized yet');
      return;
    }

    // Remove old markers that aren't in the new set
    markersRef.current.forEach((marker, id) => {
      if (!markers.find(m => m.id === id)) {
        console.log('Removing marker:', id);
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach(markerData => {
      const existingMarker = markersRef.current.get(markerData.id);

      if (existingMarker) {
        console.log('Updating marker position:', markerData.id);
        existingMarker.setPosition(markerData.position);
      } else {
        console.log('Creating new marker:', markerData);
        const marker = new google.maps.Marker({
          position: markerData.position,
          map: mapInstanceRef.current,
          title: markerData.title,
          animation: google.maps.Animation.DROP
        });

        // Add click listener
        marker.addListener('click', () => {
          // Close any open InfoWindow first
          infoWindowRef.current?.close();

          // Show InfoWindow with custom content
          infoWindowRef.current?.setContent(createInfoWindowContent(markerData));
          infoWindowRef.current?.open({
            anchor: marker,
            map: mapInstanceRef.current,
            shouldFocus: false,
          });

          // Call the click handler if provided
          if (onMarkerClick) {
            onMarkerClick(markerData.id);
          }
        });

        // Close InfoWindow when clicking on map
        mapInstanceRef.current?.addListener('click', () => {
          infoWindowRef.current?.close();
        });

        markersRef.current.set(markerData.id, marker);
      }
    });
  }, [createInfoWindowContent, onMarkerClick]);

  // Debug log for props
  useEffect(() => {
    console.log('GoogleMap props:', { center, zoom, markers });
  }, [center, zoom, markers]);

  useEffect(() => {
    // Initialize InfoWindow with custom styles
    if (window.google?.maps && !infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        pixelOffset: new google.maps.Size(0, -20),
        maxWidth: 300
      });
    }
  }, []);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      console.log('Loading Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Google Maps script loaded');
        initializeMap();
        // Initialize InfoWindow after script loads
        infoWindowRef.current = new google.maps.InfoWindow({
          pixelOffset: new google.maps.Size(0, -20),
          maxWidth: 300
        });
      };
    };

    // Initialize map
    const initializeMap = () => {
      if (!mapRef.current) return;
      console.log('Initializing map...');

      const mapOptions: google.maps.MapOptions = {
        center,
        zoom,
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
      console.log('Map initialized');
      
      // Add initial markers
      updateMarkers();
    };

    // Check if Google Maps script is already loaded
    if (!window.google?.maps) {
      loadGoogleMapsScript();
    } else {
      initializeMap();
    }

    // Cleanup
    return () => {
      const currentMarkers = markersRef.current;
      currentMarkers.forEach(marker => marker.setMap(null));
      currentMarkers.clear();
      infoWindowRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    console.log('Updating markers...', markers);
    updateMarkers();
  }, [markers, updateMarkers]);

  return <div ref={mapRef} className="w-full h-full" />;
} 