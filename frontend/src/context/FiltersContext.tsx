import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Filters } from '../types';
import { loadPreferences, savePreferences } from '../api/preferences';
import { useAuthContext } from './AuthContext';

interface FiltersContextValue {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  saveFilters: () => Promise<void>;
  resetFilters: () => void;
}

const defaultFilters: Filters = {
  minRating: 0,
  preferredType: 'any',
  maxGroupSize: undefined,
  minParking: undefined,
  minOutlets: undefined,
  minWifi: undefined,
  requireFood: false,
  requireStudyRooms: false,
  onlyOpenNow: true,
  query: ''
};

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const { user } = useAuthContext();

  useEffect(() => {
    (async () => {
      let loaded: Partial<Filters> | null = null;
      if (user) {
        loaded = await loadPreferences();
      } else {
        const raw = localStorage.getItem('workaroundFilters');
        if (raw) {
          try {
            loaded = JSON.parse(raw);
          } catch {
            loaded = null;
          }
        }
      }
      if (loaded) {
        setFilters(prev => ({ ...prev, ...loaded }));
      }
    })();
  }, [user]);

  const saveFilters = async () => {
    if (user) {
      await savePreferences(filters);
    } else {
      localStorage.setItem('workaroundFilters', JSON.stringify(filters));
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, saveFilters, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export function useFiltersContext() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFiltersContext must be used within FiltersProvider');
  return ctx;
}
