import { useCallback, useState } from 'react';
import type { Place } from '../types';
import { fetchSpaces } from '../api/spaces';
import type { Filters } from '../types';

export function useSpaces() {
  const [spaces, setSpaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);

  const loadSpaces = useCallback(
    async (filters: Filters, bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
      const data = await fetchSpaces(filters, bounds);
      setSpaces(data);
      setSelected(null);
    },
    []
  );

  return { spaces, selected, setSelected, loadSpaces };
}
