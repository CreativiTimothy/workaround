import React, { useCallback, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FiltersProvider, useFiltersContext } from './context/FiltersContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { useSpaces } from './hooks/useSpaces';
import type { Filters, Place } from './types';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import MapView from './components/MapView/MapView';
import DetailsPanel from './components/DetailsPanel/DetailsPanel';
import FiltersPanel from './components/FiltersPanel/FiltersPanel';
import LoginModal from './components/Modals/LoginModal';
import SignupModal from './components/Modals/SignupModal';
import BookmarksModal from './components/Modals/BookmarksModal';
import { fetchSpaces } from './api/spaces';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const AppInner: React.FC = () => {
  const mapsLoaded = useGoogleMaps(GOOGLE_MAPS_API_KEY);
  const { filters, saveFilters, resetFilters, setFilters } = useFiltersContext();
  const { spaces, selected, setSelected, loadSpaces } = useSpaces();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  const [lastBounds, setLastBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  const handleBoundsChanged = useCallback(
    async (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
      setLastBounds(bounds);
      await loadSpaces(filters, bounds);
    },
    [filters, loadSpaces]
  );

  const handleApplyFilters = async () => {
    await saveFilters();
    if (lastBounds) {
      await loadSpaces(filters, lastBounds);
    }
    setFiltersOpen(false);
  };

  const handleResetFilters = async () => {
    resetFilters();
    if (lastBounds) {
      await loadSpaces(
        {
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
        },
        lastBounds
      );
    }
  };

  const handleSelectSpace = (place: Place) => {
    setSelected(place);
  };

  return (
    <div className="app-root">
      <TopBar
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <main className="layout">
        <Sidebar spaces={spaces} onSelect={handleSelectSpace} />
        <section className="map-and-details">
          <MapView
            mapsLoaded={mapsLoaded}
            spaces={spaces}
            selected={selected}
            onSelect={handleSelectSpace}
            onBoundsChanged={handleBoundsChanged}
          />
          {selected && (
            <DetailsPanel place={selected} onClose={() => setSelected(null)} />
          )}
        </section>
      </main>

      <FiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />

      <BookmarksModal
        open={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        spaces={spaces}
        onSelect={handleSelectSpace}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FiltersProvider>
        <BookmarksProvider>
          <AppInner />
        </BookmarksProvider>
      </FiltersProvider>
    </AuthProvider>
  );
};

export default App;
