import React from 'react';
import type { Place } from '../../types';
import { useBookmarksContext } from '../../context/BookmarksContext';

interface Props {
  spaces: Place[];
  onSelect: (place: Place) => void;
}

function to12Hour(timeStr?: string) {
  if (!timeStr || !timeStr.includes(':')) return timeStr || '';
  let [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

const Sidebar: React.FC<Props> = ({ spaces, onSelect }) => {
  const { isBookmarked, toggle } = useBookmarksContext();

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Study Spaces</h2>
      <ul id="space-list">
        {spaces.length === 0 && (
          <li style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            No spaces match your filters yet.
          </li>
        )}
        {spaces.map((space, index) => {
          const price = space.priceLevel > 0 ? '$'.repeat(space.priceLevel) : 'Free';
          const typeLabel = space.type === 'library' ? 'Library' : 'Cafe';
          let hoursText = 'Hours N/A';
          if (space.hours?.open && space.hours?.close) {
            hoursText = `${to12Hour(space.hours.open)} – ${to12Hour(space.hours.close)}`;
          }

          return (
            <li
              key={space.placeId}
              className="space-item"
              onClick={() => onSelect(space)}
            >
              <div className="space-item-header">
                <div className="space-item-title">
                  {index + 1}. {space.name}
                </div>
                <button
                  className={
                    'space-item-bookmark-btn' +
                    (isBookmarked(space.placeId) ? ' bookmarked' : '')
                  }
                  onClick={e => {
                    e.stopPropagation();
                    toggle(space);
                  }}
                >
                  {isBookmarked(space.placeId) ? '★' : '☆'}
                </button>
              </div>
              <div className="space-item-rating-line">
                {space.rating.toFixed(1)} ★ ({space.reviewCount}) · {price}
              </div>
              <div className="space-item-meta-line">
                {space.address} · {typeLabel} · {hoursText}
              </div>
              <div className="space-item-features">
                {(space.features || []).slice(0, 3).join(' · ')}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
