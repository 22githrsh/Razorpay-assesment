import { useEffect, useRef } from "react";

export default function DeleteConfirmModal({
  isOpen,
  person,
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the Cancel button by default for safety against accidental clicks
      setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);

      function handleKeyDown(e) {
        if (e.key === "Escape") {
          onCancel();
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen || !person) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="presentation"
    >
      <div
        className="modal-card modal-card-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <div className="delete-modal-icon-wrap" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="28"
            height="28"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="delete-modal-content">
          <h2 id="delete-dialog-title" className="delete-dialog-title">
            Delete Person Record?
          </h2>
          <p id="delete-dialog-desc" className="delete-dialog-desc">
            Are you sure you want to delete <strong>{person.fullName}</strong> (
            <code>{person.id}</code>)?
          </p>

          <div className="delete-person-preview">
            <div className="preview-item">
              <span className="preview-label">Role:</span>{" "}
              <span className="preview-val">{person.role || "—"}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Location:</span>{" "}
              <span className="preview-val">
                {person.city}
                {person.state ? `, ${person.state}` : ""}
              </span>
            </div>
            {person.email && (
              <div className="preview-item">
                <span className="preview-label">Email:</span>{" "}
                <span className="preview-val">{person.email}</span>
              </div>
            )}
          </div>

          <p className="delete-warning-note">
            ⚠️ This action will permanently remove this record from the
            directory.
          </p>
        </div>

        <div className="modal-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(person)}
          >
            Yes, Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}
