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
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLocation(defaultLocation);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User allowed location access');
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.log('User denied location access or error occurred:', error.message);
          setError(error.message);
          setLocation(defaultLocation);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    getUserLocation();
  }, [defaultLocation]);

  return { location, loading, error };
} 