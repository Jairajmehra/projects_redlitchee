import { useState, useEffect } from 'react';

interface UseGoogleMapsScriptReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

let isScriptLoading = false;
let scriptLoadPromise: Promise<void> | null = null;

export function useGoogleMapsScript(): UseGoogleMapsScriptReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const loadScript = async () => {
      if (!scriptLoadPromise) {
        scriptLoadPromise = new Promise((resolve, reject) => {
          try {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            
            script.addEventListener('load', () => {
              setIsLoaded(true);
              resolve();
            });

            script.addEventListener('error', (e) => {
              const error = new Error('Google Maps script failed to load');
              setLoadError(error);
              reject(error);
            });

            document.head.appendChild(script);
          } catch (error) {
            setLoadError(error instanceof Error ? error : new Error('Failed to load Google Maps'));
            reject(error);
          }
        });
      }

      try {
        await scriptLoadPromise;
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Failed to load Google Maps'));
      }
    };

    if (!isScriptLoading) {
      isScriptLoading = true;
      loadScript();
    }

    return () => {
      // Cleanup if component unmounts during loading
      setIsLoaded(false);
      setLoadError(null);
    };
  }, []);

  return { isLoaded, loadError };
} 