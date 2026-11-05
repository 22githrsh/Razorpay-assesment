export default function Header({
  totalCount,
  filteredCount,
  onAddClick,
  theme = "light",
  onToggleTheme,
}) {
  const isFiltered = filteredCount !== totalCount;
  const isDark = theme === "dark";

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-badge">Razorpay</div>
        <div className="brand-text">
          <h1>People Directory</h1>
          <p className="header-subtitle">
            Enterprise Directory &amp; Access Management
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div className="stats-pill" aria-live="polite">
          <span className="stat-label">Records:</span>
          {isFiltered ? (
            <span className="stat-value">
              <strong>{filteredCount.toLocaleString()}</strong>
              <span className="stat-total"> of {totalCount.toLocaleString()}</span>
            </span>
          ) : (
            <span className="stat-value">
              <strong>{totalCount.toLocaleString()}</strong> total
            </span>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="btn btn-secondary btn-theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <>
              <svg
                className="theme-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg
                className="theme-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span>Dark</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-primary btn-add"
          onClick={onAddClick}
          aria-label="Add new person"
        >
          <svg
            className="icon"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Add Person</span>
        </button>
      </div>
    </header>
  );
}
