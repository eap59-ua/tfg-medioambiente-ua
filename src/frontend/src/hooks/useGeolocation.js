import { useState, useCallback } from 'react';
import { MAP_DEFAULTS } from '../utils/constants';

export function useGeolocation() {
  const [position, setPosition] = useState({
    latitude: MAP_DEFAULTS.lat,
    longitude: MAP_DEFAULTS.lng,
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...position, error, isLoading, requestLocation };
}
