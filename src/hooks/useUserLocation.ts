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
    const getUserLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser');
        }

        // Check if we already have permission
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Geolocation permission status:', permission.state);

        // Always attempt to get position to trigger the browser prompt
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

        console.log('Location access granted, coordinates:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });

        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      } catch (err) {
        console.log('Location access error:', err);
        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Location access was denied. Please enable location services to see nearby projects.');
              break;
            case err.POSITION_UNAVAILABLE:
              setError('Location information is unavailable.');
              break;
            case err.TIMEOUT:
              setError('Location request timed out.');
              break;
            default:
              setError('An unknown error occurred while requesting location.');
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to get location');
        }
        setLocation(defaultLocation);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, [defaultLocation]);

  return { location, loading, error };
} 