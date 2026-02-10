import React, { useEffect, useRef } from 'react';
import type { Place } from '../../types';

interface Props {
  mapsLoaded: boolean;
  spaces: Place[];
  selected: Place | null;
  onSelect: (place: Place) => void;
  onBoundsChanged: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}

const MapView: React.FC<Props> = ({
  mapsLoaded,
  spaces,
  selected,
  onSelect,
  onBoundsChanged
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapsLoaded) return;
    if (!mapRef.current) return;
    if (mapInstance.current) return; // prevents double init

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 33.7, lng: -117.8 },
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapInstance.current = map;

    // Emit initial bounds once
    google.maps.event.addListenerOnce(map, "idle", () => {
      emitBounds(map);
    });

    // Emit bounds on every idle event
    map.addListener("idle", () => {
      emitBounds(map);
    });
  }, [mapsLoaded]);

  const emitBounds = (map: google.maps.Map) => {
    const bounds = map.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    onBoundsChanged({
      minLat: sw.lat(),
      maxLat: ne.lat(),
      minLng: sw.lng(),
      maxLng: ne.lng()
    });
  };

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    for (let i = 0; i < spaces.length; i++) {
      const space = spaces[i];
      const marker = new google.maps.Marker({
        position: { lat: space.lat, lng: space.lng },
        map,
        label: `${i + 1}`,
      });

      marker.addListener("click", () => {
        onSelect(space);
        map.panTo({ lat: space.lat, lng: space.lng });
        map.setZoom(14);
      });

      markersRef.current.push(marker);
    }
  }, [spaces]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selected) return;
    map.panTo({ lat: selected.lat, lng: selected.lng });
    map.setZoom(14);
  }, [selected]);

  return <div id="map" ref={mapRef}></div>;
};

export default MapView;
