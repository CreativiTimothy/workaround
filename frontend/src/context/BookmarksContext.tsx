import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Bookmark, Place } from '../types';
import { fetchBookmarks, toggleBookmark } from '../api/bookmarks';
import { useAuthContext } from './AuthContext';

interface BookmarksContextValue {
  bookmarks: Bookmark[];
  isBookmarked: (placeId: string) => boolean;
  toggle: (place: Place) => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined);

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    fetchBookmarks().then(setBookmarks);
  }, [user]);

  const isBookmarked = (placeId: string) =>
    bookmarks.some(b => b.placeId === placeId);

  const toggle = async (place: Place) => {
    if (!user) return;
    const action = isBookmarked(place.placeId) ? 'remove' : 'add';
    await toggleBookmark(place, action);
    const updated = await fetchBookmarks();
    setBookmarks(updated);
  };

  return (
    <BookmarksContext.Provider value={{ bookmarks, isBookmarked, toggle }}>
      {children}
    </BookmarksContext.Provider>
  );
};

export function useBookmarksContext() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarksContext must be used within BookmarksProvider');
  return ctx;
}
