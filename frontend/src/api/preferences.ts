import type { Filters } from '../types';

export async function savePreferences(filters: Filters) {
  await fetch('/api/user/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minRating: filters.minRating,
      type: filters.preferredType,
      maxGroup: filters.maxGroupSize,
      minParking: filters.minParking,
      minOutlets: filters.minOutlets,
      minWifi: filters.minWifi,
      requireFood: filters.requireFood,
      requireStudyRooms: filters.requireStudyRooms,
      openNow: filters.onlyOpenNow,
      query: filters.query
    })
  });
}

export async function loadPreferences(): Promise<Partial<Filters> | null> {
  const res = await fetch('/api/user/preferences');
  const prefs = await res.json();
  if (!prefs || Object.keys(prefs).length === 0) return null;
  return {
    minRating: Number(prefs.minRating ?? 0),
    preferredType: prefs.type ?? 'any',
    maxGroupSize: prefs.maxGroup ? Number(prefs.maxGroup) : undefined,
    minParking: prefs.minParking ? Number(prefs.minParking) : undefined,
    minOutlets: prefs.minOutlets ? Number(prefs.minOutlets) : undefined,
    minWifi: prefs.minWifi ? Number(prefs.minWifi) : undefined,
    requireFood: !!prefs.requireFood,
    requireStudyRooms: !!prefs.requireStudyRooms,
    onlyOpenNow: prefs.openNow ?? true,
    query: prefs.query ?? ''
  };
}
