import React from 'react';
import type { Place } from '../../types';

function to12Hour(timeStr?: string) {
  if (!timeStr || !timeStr.includes(':')) return timeStr || '';
  let [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

interface Props {
  place: Place | null;
  onClose: () => void;
}

const DetailsPanel: React.FC<Props> = ({ place, onClose }) => {
  if (!place) return null;

  const price = place.priceLevel > 0 ? '$'.repeat(place.priceLevel) : 'Free';
  const typeLabel = place.type === 'library' ? 'Library' : 'Cafe';
  const hoursText =
    place.hours?.open && place.hours?.close
      ? `${to12Hour(place.hours.open)} – ${to12Hour(place.hours.close)}`
      : 'Not available';

  const openDirections = () => {
    const lat = place.lat;
    const lng = place.lng;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const appUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      window.location.href = appUrl;
      setTimeout(() => {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(webUrl, '_blank');
      }, 500);
    } else {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(webUrl, '_blank');
    }
  };

  return (
    <div className="space-details">
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h3>{place.name}</h3>
      <p>
        {place.rating.toFixed(1)} ★ ({place.reviewCount}) · {price}
      </p>
      <p>{place.address}</p>
      <p>Type: {typeLabel}</p>
      <p>Hours: {hoursText}</p>
      <p>Noise level: {place.noiseLevel} (1=quiet, 5=loud)</p>
      <p>Occupancy: {place.occupancyLevel} (1=empty, 5=packed)</p>
      <p>Wi‑Fi: {place.wifiQuality}</p>
      <p>Outlets: {place.outletAvailability}</p>
      <p>Parking: {place.parkingAvailability}</p>
      <p>
        Amenities:{' '}
        {place.hasFood || place.hasStudyRooms
          ? [
              place.hasFood ? 'Food' : null,
              place.hasStudyRooms ? 'Study rooms' : null
            ]
              .filter(Boolean)
              .join(', ')
          : 'None listed'}
      </p>
      <button className="primary-button" style={{ marginTop: '0.5rem' }} onClick={openDirections}>
        Directions
      </button>
    </div>
  );
};

export default DetailsPanel;
