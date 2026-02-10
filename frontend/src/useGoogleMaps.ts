import { useEffect, useState } from 'react';

declare global {
  interface Window {
    initMapCallback?: () => void;
  }
}

export function useGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).google?.maps) {
      setLoaded(true);
      return;
    }

    window.initMapCallback = () => {
      setLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapCallback`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      delete window.initMapCallback;
    };
  }, [apiKey]);

  return loaded;
}
