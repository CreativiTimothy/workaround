import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
  onOpenFilters: () => void;
  onOpenBookmarks: () => void;
  onOpenLogin: () => void;
}

const TopBar: React.FC<Props> = ({ onOpenFilters, onOpenBookmarks, onOpenLogin }) => {
  const { user, logoutUser } = useAuthContext();

  const handleLoginClick = async () => {
    if (user) {
      await logoutUser();
    } else {
      onOpenLogin();
    }
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="pill-button" onClick={onOpenFilters}>
          FILTER
        </button>
      </div>
      <div className="top-bar-center">
        <span className="brand">WorkAround</span>
      </div>
      <div className="top-bar-right">
        <button
          className="icon-circle-button"
          title="Bookmarks"
          onClick={onOpenBookmarks}
        >
          ★
        </button>
        <button className="pill-button" onClick={handleLoginClick}>
          {user ? 'LOG OUT' : 'LOG IN'}
        </button>
        {user && (
          <span className="user-greeting">
            Hi, {user.firstName || user.email}
          </span>
        )}
      </div>
    </header>
  );
};

export default TopBar;
