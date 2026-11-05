import { useState, useEffect, useRef } from "react";
import {
  ROLES,
  SEGMENTS,
  STATUSES,
  LOCATIONS,
  CITY_TO_STATE,
} from "../constants/peopleOptions";
import { validatePerson } from "../utils/validation";

export default function PersonModal({
  isOpen,
  mode, // "create" | "edit"
  initialData,
  existingPeople,
  onSave,
  onClose,
}) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    role: ROLES[0],
    segment: SEGMENTS[0],
    status: STATUSES[0],
    city: LOCATIONS[0].city,
    state: LOCATIONS[0].state,
    joinedOn: new Date().toISOString().slice(0, 10),
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const nameInputRef = useRef(null);
  const modalRef = useRef(null);

  // Sync form data whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          id: initialData.id || "",
          fullName: initialData.fullName || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          role: initialData.role || ROLES[0],
          segment: initialData.segment || SEGMENTS[0],
          status: initialData.status || STATUSES[0],
          city: initialData.city || LOCATIONS[0].city,
          state:
            initialData.state ||
            CITY_TO_STATE[initialData.city] ||
            LOCATIONS[0].state,
          joinedOn:
            initialData.joinedOn || new Date().toISOString().slice(0, 10),
        });
      } else if (!isEdit && initialData) {
        // Create mode with pre-generated ID
        setFormData({
          id: initialData.id || "",
          fullName: "",
          email: "",
          phone: "",
          role: ROLES[0],
          segment: SEGMENTS[0],
          status: STATUSES[0],
          city: LOCATIONS[0].city,
          state: LOCATIONS[0].state,
          joinedOn: new Date().toISOString().slice(0, 10),
        });
      }
      setErrors({});
      setTouched({});

      // Auto-focus the name input
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, isEdit, initialData]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChange(field, value) {
    const nextFormData = { ...formData, [field]: value };

    // Auto-update state when city changes
    if (field === "city" && CITY_TO_STATE[value]) {
      nextFormData.state = CITY_TO_STATE[value];
    }

    setFormData(nextFormData);

    // If already touched, validate live
    if (touched[field]) {
      const { errors: newErrors } = validatePerson(
        nextFormData,
        existingPeople,
        isEdit
      );
      setErrors((prev) => ({
        ...prev,
        [field]: newErrors[field],
      }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors: newErrors } = validatePerson(
      formData,
      existingPeople,
      isEdit
    );
    setErrors((prev) => ({
      ...prev,
      [field]: newErrors[field],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      role: true,
      segment: true,
      status: true,
      city: true,
      state: true,
      joinedOn: true,
    });

    const { isValid, errors: validationErrors } = validatePerson(
      formData,
      existingPeople,
      isEdit
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Clean data before saving
    const personToSave = {
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    onSave(personToSave, isEdit);
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">
              {isEdit ? "Edit Person" : "Add New Person"}
            </h2>
            <p className="modal-subtitle">
              {isEdit
                ? `Updating record for ${formData.fullName || "person"} (${formData.id})`
                : `Create a new entry with identifier ${formData.id}`}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          <div className="form-grid">
            {/* Record ID (Read-only) */}
            <div className="form-field">
              <label htmlFor="field-id" className="form-label">
                Record ID <span className="field-note">(Auto-assigned)</span>
              </label>
              <input
                id="field-id"
                type="text"
                className="form-input form-input-readonly"
                value={formData.id}
                readOnly
                disabled
              />
            </div>

            {/* Joined Date */}
            <div className="form-field">
              <label htmlFor="field-joined" className="form-label">
                Joined Date <span className="required-star">*</span>
              </label>
              <input
                id="field-joined"
                type="date"
                className={`form-input ${errors.joinedOn ? "form-input-error" : ""}`}
                value={formData.joinedOn}
                onChange={(e) => handleChange("joinedOn", e.target.value)}
                onBlur={() => handleBlur("joinedOn")}
                required
              />
              {errors.joinedOn && (
                <p className="error-message">{errors.joinedOn}</p>
              )}
            </div>

            {/* Full Name */}
            <div className="form-field form-field-full">
              <label htmlFor="field-name" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="field-name"
                type="text"
                className={`form-input ${errors.fullName ? "form-input-error" : ""}`}
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                placeholder="e.g. Arjun Sharma"
                required
              />
              {errors.fullName && (
                <p className="error-message">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="field-email" className="form-label">
                Email Address{" "}
                <span className="field-note">(Unique if provided)</span>
              </label>
              <input
                id="field-email"
                type="email"
                className={`form-input ${errors.email ? "form-input-error" : ""}`}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="e.g. arjun.sharma@example.com"
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="form-field">
              <label htmlFor="field-phone" className="form-label">
                Phone Number <span className="field-note">(Optional)</span>
              </label>
              <input
                id="field-phone"
                type="tel"
                className={`form-input ${errors.phone ? "form-input-error" : ""}`}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder="e.g. +91 98765 43210"
              />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>

            {/* Role */}
            <div className="form-field">
              <label htmlFor="field-role" className="form-label">
                Role <span className="required-star">*</span>
              </label>
              <select
                id="field-role"
                className={`form-select ${errors.role ? "form-input-error" : ""}`}
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                onBlur={() => handleBlur("role")}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && <p className="error-message">{errors.role}</p>}
            </div>

            {/* Segment */}
            <div className="form-field">
              <label htmlFor="field-segment" className="form-label">
                Segment <span className="required-star">*</span>
              </label>
              <select
                id="field-segment"
                className={`form-select ${errors.segment ? "form-input-error" : ""}`}
                value={formData.segment}
                onChange={(e) => handleChange("segment", e.target.value)}
                onBlur={() => handleBlur("segment")}
              >
                {SEGMENTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.segment && (
                <p className="error-message">{errors.segment}</p>
              )}
            </div>

            {/* Status */}
            <div className="form-field">
              <label htmlFor="field-status" className="form-label">
                Status <span className="required-star">*</span>
              </label>
              <select
                id="field-status"
                className={`form-select ${errors.status ? "form-input-error" : ""}`}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                onBlur={() => handleBlur("status")}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="error-message">{errors.status}</p>
              )}
            </div>

            {/* City */}
            <div className="form-field">
              <label htmlFor="field-city" className="form-label">
                City <span className="required-star">*</span>
              </label>
              <select
                id="field-city"
                className={`form-select ${errors.city ? "form-input-error" : ""}`}
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                onBlur={() => handleBlur("city")}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.city} value={loc.city}>
                    {loc.city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-message">{errors.city}</p>}
            </div>

            {/* State (Auto-synced from City, but visible) */}
            <div className="form-field">
              <label htmlFor="field-state" className="form-label">
                State <span className="field-note">(Auto-matched)</span>
              </label>
              <input
                id="field-state"
                type="text"
                className="form-input form-input-readonly"
                value={formData.state}
                readOnly
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save Changes" : "Create Person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
