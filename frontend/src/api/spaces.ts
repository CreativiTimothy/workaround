import type { Filters, Place } from '../types';

export async function fetchSpaces(
  filters: Filters,
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): Promise<Place[]> {
  const params = new URLSearchParams();

  if (bounds) {
    params.set('minLat', String(bounds.minLat));
    params.set('maxLat', String(bounds.maxLat));
    params.set('minLng', String(bounds.minLng));
    params.set('maxLng', String(bounds.maxLng));
  }

  if (filters.minRating) params.set('minRating', String(filters.minRating));
  if (filters.preferredType) params.set('preferredType', filters.preferredType);
  if (filters.maxGroupSize != null) params.set('maxGroupSize', String(filters.maxGroupSize));
  if (filters.minParking != null) params.set('minParking', String(filters.minParking));
  if (filters.minOutlets != null) params.set('minOutlets', String(filters.minOutlets));
  if (filters.minWifi != null) params.set('minWifi', String(filters.minWifi));
  if (filters.requireFood) params.set('requireFood', 'true');
  if (filters.requireStudyRooms) params.set('requireStudyRooms', 'true');
  params.set('onlyOpenNow', filters.onlyOpenNow ? 'true' : 'false');
  if (filters.query) params.set('q', filters.query);

  const res = await fetch(`/api/spaces?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch spaces');
  return res.json();
}
