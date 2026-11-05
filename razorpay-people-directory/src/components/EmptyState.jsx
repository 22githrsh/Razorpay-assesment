export default function EmptyState({ onReset }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-icon-wrap" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="48"
          height="48"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h3 className="empty-title">No people found</h3>
      <p className="empty-description">
        No records match your active search terms or filter criteria.
        Try adjusting your keywords or clearing the filters to view the full directory.
      </p>
      {onReset && (
        <button
          type="button"
          className="btn btn-secondary btn-empty-reset"
          onClick={onReset}
        >
          Clear Search &amp; Filters
        </button>
      )}
    </div>
  );
}
