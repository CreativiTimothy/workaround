import React from 'react';
import { useFiltersContext } from '../../context/FiltersContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}

const FiltersPanel: React.FC<Props> = ({ open, onClose, onApply, onReset }) => {
  const { filters, setFilters } = useFiltersContext();

  if (!open) return null;

  return (
    <section className="filters-panel">
      <div className="filters-card">
        <div className="filters-header">
          <h3>Filters</h3>
          <button className="icon-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="filters-body">
          <div className="filters-row">
            <label>
              <span>Minimum rating</span>
              <select
                value={filters.minRating}
                onChange={e =>
                  setFilters(f => ({ ...f, minRating: Number(e.target.value) }))
                }
              >
                <option value={0}>Any</option>
                <option value={3}>3★+</option>
                <option value={3.5}>3.5★+</option>
                <option value={4}>4★+</option>
                <option value={4.5}>4.5★+</option>
              </select>
            </label>

            <label>
              <span>Type</span>
              <select
                value={filters.preferredType}
                onChange={e =>
                  setFilters(f => ({ ...f, preferredType: e.target.value }))
                }
              >
                <option value="any">Any</option>
                <option value="cafe">Cafe</option>
                <option value="library">Library</option>
              </select>
            </label>
          </div>

          <div className="filters-row">
            <label>
              <span>Max group size</span>
              <input
                type="number"
                min={1}
                value={filters.maxGroupSize ?? ''}
                onChange={e =>
                  setFilters(f => ({
                    ...f,
                    maxGroupSize: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
                placeholder="e.g. 4"
              />
            </label>
          </div>

          <div className="filters-row">
            <label>
              <span>Min parking</span>
              <select
                value={filters.minParking ?? ''}
                onChange={e =>
                  setFilters(f => ({
                    ...f,
                    minParking: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              >
                <option value="">Any</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>

            <label>
              <span>Min outlets</span>
              <select
                value={filters.minOutlets ?? ''}
                onChange={e =>
                  setFilters(f => ({
                    ...f,
                    minOutlets: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              >
                <option value="">Any</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>

            <label>
              <span>Min Wi‑Fi</span>
              <select
                value={filters.minWifi ?? ''}
                onChange={e =>
                  setFilters(f => ({
                    ...f,
                    minWifi: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              >
                <option value="">Any</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>
          </div>

          <div className="filters-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.requireFood}
                onChange={e =>
                  setFilters(f => ({ ...f, requireFood: e.target.checked }))
                }
              />
              <span>Food available</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.requireStudyRooms}
                onChange={e =>
                  setFilters(f => ({ ...f, requireStudyRooms: e.target.checked }))
                }
              />
              <span>Study rooms</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.onlyOpenNow}
                onChange={e =>
                  setFilters(f => ({ ...f, onlyOpenNow: e.target.checked }))
                }
              />
              <span>Open now</span>
            </label>
          </div>

          <div className="filters-row">
            <label className="full-width">
              <span>Text search (Boolean match)</span>
              <input
                type="text"
                value={filters.query}
                onChange={e =>
                  setFilters(f => ({ ...f, query: e.target.value }))
                }
                placeholder="e.g. quiet library near UCI"
              />
            </label>
          </div>
        </div>

        <div className="filters-footer">
          <button className="primary-button" onClick={onApply}>
            Apply filters
          </button>
          <button className="secondary-button" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};

export default FiltersPanel;
