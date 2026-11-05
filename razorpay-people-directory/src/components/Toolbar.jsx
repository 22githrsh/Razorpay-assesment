import { ROLES, SEGMENTS, STATUSES, LOCATIONS } from "../constants/peopleOptions";

export default function Toolbar({
  query,
  onQueryChange,
  filters,
  onFilterChange,
  onResetFilters,
  sortConfig,
  onSortChange,
}) {
  const activeFiltersCount =
    (query.trim() ? 1 : 0) +
    (filters.role ? 1 : 0) +
    (filters.segment ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.city ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="toolbar-container" role="search" aria-label="People Directory Search and Filters">
      <div className="toolbar-search-row">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <label htmlFor="search-input" className="sr-only">
            Search records
          </label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name, email, ID, phone, or city..."
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onQueryChange("")}
              aria-label="Clear search text"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-reset"
            onClick={onResetFilters}
            title="Reset all active search and filter criteria"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.047a1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566z"
                clipRule="evenodd"
              />
            </svg>
            Reset Filters ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="toolbar-filters-row">
        {/* Role Filter */}
        <div className="filter-group">
          <label htmlFor="filter-role" className="filter-label">
            Role
          </label>
          <select
            id="filter-role"
            className="filter-select"
            value={filters.role}
            onChange={(e) => onFilterChange("role", e.target.value)}
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Segment Filter */}
        <div className="filter-group">
          <label htmlFor="filter-segment" className="filter-label">
            Segment
          </label>
          <select
            id="filter-segment"
            className="filter-select"
            value={filters.segment}
            onChange={(e) => onFilterChange("segment", e.target.value)}
          >
            <option value="">All Segments</option>
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="filter-status" className="filter-label">
            Status
          </label>
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
            <option value="__unassigned__">Unassigned / Blank</option>
          </select>
        </div>

        {/* City Filter */}
        <div className="filter-group">
          <label htmlFor="filter-city" className="filter-label">
            City
          </label>
          <select
            id="filter-city"
            className="filter-select"
            value={filters.city}
            onChange={(e) => onFilterChange("city", e.target.value)}
          >
            <option value="">All Cities</option>
            {LOCATIONS.map((loc) => (
              <option key={loc.city} value={loc.city}>
                {loc.city} ({loc.state})
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select (especially useful on mobile where table headers may require horizontal scroll) */}
        <div className="filter-group sort-group">
          <label htmlFor="sort-field" className="filter-label">
            Sort by
          </label>
          <div className="sort-controls-inline">
            <select
              id="sort-field"
              className="filter-select"
              value={sortConfig.field}
              onChange={(e) =>
                onSortChange(e.target.value, sortConfig.direction)
              }
            >
              <option value="fullName">Name</option>
              <option value="id">ID</option>
              <option value="role">Role</option>
              <option value="segment">Segment</option>
              <option value="city">City</option>
              <option value="status">Status</option>
              <option value="joinedOn">Joined Date</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sort-dir"
              onClick={() =>
                onSortChange(
                  sortConfig.field,
                  sortConfig.direction === "asc" ? "desc" : "asc"
                )
              }
              aria-label={`Sort direction: ${sortConfig.direction === "asc" ? "Ascending" : "Descending"}. Click to toggle.`}
              title={`Switch to ${sortConfig.direction === "asc" ? "Descending" : "Ascending"}`}
            >
              {sortConfig.direction === "asc" ? "A → Z ▲" : "Z → A ▼"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
