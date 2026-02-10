import React from 'react';
import { useBookmarksContext } from '../../context/BookmarksContext';
import type { Place } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  spaces: Place[];
  onSelect: (place: Place) => void;
}

const BookmarksModal: React.FC<Props> = ({ open, onClose, spaces, onSelect }) => {
  const { bookmarks } = useBookmarksContext();

  if (!open) return null;

  return (
    <section className="modal">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Bookmarked Study Spaces</h3>
          <button className="icon-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <ul className="bookmarks-list">
            {bookmarks.length === 0 && (
              <li style={{ color: '#6b7280' }}>No bookmarks yet.</li>
            )}
            {bookmarks.map(b => {
              const space = spaces.find(s => s.placeId === b.placeId);
              return (
                <li
                  key={b.placeId}
                  onClick={() => {
                    onClose();
                    if (space) onSelect(space);
                  }}
                >
                  {b.name || b.placeId}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BookmarksModal;
