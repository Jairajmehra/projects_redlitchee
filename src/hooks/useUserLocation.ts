import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface UseUserLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

export function useUserLocation(defaultLocation: Location): UseUserLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🌍 useUserLocation: Hook initialized with default location:', defaultLocation);
    
    const getUserLocation = async () => {
      console.log('🌍 useUserLocation: Starting location request...');
      try {
        if (!navigator.geolocation) {
          console.error('🌍 useUserLocation: Geolocation API not supported');
          throw new Error('Geolocation is not supported by your browser');
        }

        // Check if we already have permission
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('🌍 useUserLocation: Permission status:', permission.state);

        // Always attempt to get position to trigger the browser prompt
        console.log('🌍 useUserLocation: Requesting current position...');
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        });

        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('🌍 useUserLocation: Location access granted, coordinates:', userLocation);

        setLocation(userLocation);
      } catch (err) {
        console.warn('🌍 useUserLocation: Error getting location:', err);
        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              console.log('🌍 useUserLocation: Permission denied, using default location');
              setError('Location access was denied. Please enable location services to see nearby projects.');
              break;
            case err.POSITION_UNAVAILABLE:
              console.log('🌍 useUserLocation: Position unavailable, using default location');
              setError('Location information is unavailable.');
              break;
            case err.TIMEOUT:
              console.log('🌍 useUserLocation: Request timed out, using default location');
              setError('Location request timed out.');
              break;
            default:
              console.log('🌍 useUserLocation: Unknown error, using default location');
              setError('An unknown error occurred while requesting location.');
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to get location');
        }
        console.log('🌍 useUserLocation: Falling back to default location:', defaultLocation);
        setLocation(defaultLocation);
      } finally {
        setLoading(false);
        console.log('🌍 useUserLocation: Location request completed');
      }
    };

    getUserLocation();
  }, [defaultLocation]);

  return { location, loading, error };
} 