export default function PeopleTable({
  people,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
}) {
  function renderSortIndicator(field) {
    if (sortConfig.field !== field) {
      return <span className="sort-icon neutral">↕</span>;
    }
    return (
      <span className="sort-icon active">
        {sortConfig.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  }

  function handleHeaderClick(field) {
    if (sortConfig.field === field) {
      onSort(field, sortConfig.direction === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "asc");
    }
  }

  function getStatusBadgeClass(status) {
    if (!status) return "badge badge-unassigned";
    switch (status.toLowerCase()) {
      case "active":
        return "badge badge-active";
      case "inactive":
        return "badge badge-inactive";
      case "pending":
        return "badge badge-pending";
      default:
        return "badge badge-neutral";
    }
  }

  function getRoleBadgeClass(role) {
    switch (role) {
      case "Merchant":
        return "role-pill role-merchant";
      case "Partner":
        return "role-pill role-partner";
      case "Customer":
        return "role-pill role-customer";
      case "Finance Contact":
        return "role-pill role-finance";
      case "Support Lead":
        return "role-pill role-support";
      default:
        return "role-pill";
    }
  }

  function getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "P";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <div className="table-wrap" tabIndex={0} aria-label="People Directory Table">
      <table className="people-table">
        <colgroup>
          <col className="col-def-id" style={{ width: "115px" }} />
          <col className="col-def-name" style={{ width: "200px" }} />
          <col className="col-def-email" style={{ width: "240px" }} />
          <col className="col-def-phone" style={{ width: "155px" }} />
          <col className="col-def-role" style={{ width: "140px" }} />
          <col className="col-def-segment" style={{ width: "120px" }} />
          <col className="col-def-location" style={{ width: "175px" }} />
          <col className="col-def-status" style={{ width: "120px" }} />
          <col className="col-def-date" style={{ width: "120px" }} />
          <col className="col-def-actions" style={{ width: "150px" }} />
        </colgroup>
        <thead>
          <tr>
            <th
              scope="col"
              className="col-sortable col-id"
              onClick={() => handleHeaderClick("id")}
              title="Click to sort by ID"
            >
              <div className="th-content">
                <span>ID</span>
                {renderSortIndicator("id")}
              </div>
            </th>
            <th
              scope="col"
              className="col-sortable col-name"
              onClick={() => handleHeaderClick("fullName")}
              title="Click to sort by Name"
            >
              <div className="th-content">
                <span>Name</span>
                {renderSortIndicator("fullName")}
              </div>
            </th>
            <th scope="col" className="col-email">
              Email
            </th>
            <th scope="col" className="col-phone">
              Phone
            </th>
            <th
              scope="col"
              className="col-sortable col-role"
              onClick={() => handleHeaderClick("role")}
              title="Click to sort by Role"
            >
              <div className="th-content">
                <span>Role</span>
                {renderSortIndicator("role")}
              </div>
            </th>
            <th
              scope="col"
              className="col-sortable col-segment"
              onClick={() => handleHeaderClick("segment")}
              title="Click to sort by Segment"
            >
              <div className="th-content">
                <span>Segment</span>
                {renderSortIndicator("segment")}
              </div>
            </th>
            <th
              scope="col"
              className="col-sortable col-city"
              onClick={() => handleHeaderClick("city")}
              title="Click to sort by City"
            >
              <div className="th-content">
                <span>Location</span>
                {renderSortIndicator("city")}
              </div>
            </th>
            <th
              scope="col"
              className="col-sortable col-status"
              onClick={() => handleHeaderClick("status")}
              title="Click to sort by Status"
            >
              <div className="th-content">
                <span>Status</span>
                {renderSortIndicator("status")}
              </div>
            </th>
            <th
              scope="col"
              className="col-sortable col-date"
              onClick={() => handleHeaderClick("joinedOn")}
              title="Click to sort by Joined Date"
            >
              <div className="th-content">
                <span>Joined Date</span>
                {renderSortIndicator("joinedOn")}
              </div>
            </th>
            <th scope="col" className="col-actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id} className="person-row">
              <td className="cell-id">
                <code>{person.id}</code>
              </td>
              <td className="cell-name">
                <div className="name-wrapper">
                  <div className="avatar-chip" aria-hidden="true">
                    {getInitials(person.fullName)}
                  </div>
                  <span className="name-text" title={person.fullName}>
                    {person.fullName}
                  </span>
                </div>
              </td>
              <td className="cell-email">
                {person.email ? (
                  <a
                    href={`mailto:${person.email}`}
                    className="email-link"
                    title={`Send email to ${person.email}`}
                  >
                    {person.email}
                  </a>
                ) : (
                  <span className="blank-cell" title="Email not provided">
                    —
                  </span>
                )}
              </td>
              <td className="cell-phone">
                {person.phone ? (
                  <span className="phone-text">{person.phone}</span>
                ) : (
                  <span className="blank-cell" title="Phone not provided">
                    —
                  </span>
                )}
              </td>
              <td className="cell-role">
                <span className={getRoleBadgeClass(person.role)}>
                  {person.role || "—"}
                </span>
              </td>
              <td className="cell-segment">
                <span className="segment-text">{person.segment || "—"}</span>
              </td>
              <td className="cell-location">
                <div className="location-wrapper" title={`${person.city || ""}${person.state ? `, ${person.state}` : ""}`}>
                  <span className="city-name">{person.city || "—"}</span>
                  {person.state && (
                    <span className="state-name">, {person.state}</span>
                  )}
                </div>
              </td>
              <td className="cell-status">
                <span className={getStatusBadgeClass(person.status)}>
                  {person.status || "Unassigned"}
                </span>
              </td>
              <td className="cell-date">
                <time dateTime={person.joinedOn}>{person.joinedOn || "—"}</time>
              </td>
              <td className="cell-actions">
                <div className="row-actions-group">
                  <button
                    type="button"
                    className="btn-action btn-edit"
                    onClick={() => onEdit(person)}
                    aria-label={`Edit ${person.fullName}`}
                    title="Edit record"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="15"
                      height="15"
                      aria-hidden="true"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-delete"
                    onClick={() => onDelete(person)}
                    aria-label={`Delete ${person.fullName}`}
                    title="Delete record"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="15"
                      height="15"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
