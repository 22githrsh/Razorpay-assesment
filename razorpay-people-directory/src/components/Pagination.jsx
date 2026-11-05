import { PAGE_SIZE_OPTIONS } from "../constants/peopleOptions";

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination items with ellipses
  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav className="pagination-bar" aria-label="People Directory Pagination">
      <div className="pagination-info">
        <span>
          Showing <strong>{startRecord.toLocaleString()}</strong>–
          <strong>{endRecord.toLocaleString()}</strong> of{" "}
          <strong>{totalItems.toLocaleString()}</strong> records
        </span>

        <div className="page-size-selector">
          <label htmlFor="page-size-select" className="page-size-label">
            Rows per page:
          </label>
          <select
            id="page-size-select"
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        {/* First Page */}
        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
          title="First page"
        >
          «
        </button>

        {/* Previous Page */}
        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          title="Previous page"
        >
          ‹
        </button>

        {/* Page numbers */}
        <div className="page-numbers-group">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  …
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                className={`btn-page ${isCurrent ? "btn-page-active" : ""}`}
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          title="Next page"
        >
          ›
        </button>

        {/* Last Page */}
        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
          title="Last page"
        >
          »
        </button>
      </div>
    </nav>
  );
}
