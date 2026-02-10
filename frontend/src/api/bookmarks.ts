import type { Bookmark, Place } from '../types';

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const res = await fetch('/api/bookmarks');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function toggleBookmark(place: Place, action: 'add' | 'remove') {
  await fetch(`/api/bookmarks/${encodeURIComponent(place.placeId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, place })
  });
}
