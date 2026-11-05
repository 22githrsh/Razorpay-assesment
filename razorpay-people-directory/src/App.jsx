import { useState, useMemo, useCallback, useEffect } from "react";
import peopleData from "./data/people.json";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import PeopleTable from "./components/PeopleTable";
import Pagination from "./components/Pagination";
import PersonModal from "./components/PersonModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmptyState from "./components/EmptyState";
import Toast from "./components/Toast";
import { generateNextId } from "./utils/validation";
import { DEFAULT_PAGE_SIZE } from "./constants/peopleOptions";
import "./App.css";

export default function App() {
  // Master state: immutable updates only
  const [people, setPeople] = useState(peopleData);

  // Theme state with local persistence & system preference detection
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("rp_theme");
      if (saved === "dark" || saved === "light") return saved;
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch {
      // Fallback if localStorage or matchMedia is restricted
    }
    return "light";
  });

  // Keep documentElement synchronized with theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("rp_theme", theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Search & Filter state
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    segment: "",
    status: "",
    city: "",
  });

  // Sort state: defaults to sorting by fullName ascending
  const [sortConfig, setSortConfig] = useState({
    field: "fullName",
    direction: "asc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Modal states
  const [personModal, setPersonModal] = useState({
    isOpen: false,
    mode: "create", // "create" | "edit"
    person: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    person: null,
  });

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // Filter change handlers - reset page to 1 on any filter/query change
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setQuery("");
    setFilters({
      role: "",
      segment: "",
      status: "",
      city: "",
    });
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field, direction) => {
    setSortConfig({ field, direction });
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  // 1. Filtered People: case-insensitive multi-field search + categorical filters
  const filteredPeople = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    return people.filter((person) => {
      // Search matching across relevant identity fields
      if (trimmedQuery) {
        const nameMatch = (person.fullName || "").toLowerCase().includes(trimmedQuery);
        const emailMatch = (person.email || "").toLowerCase().includes(trimmedQuery);
        const idMatch = (person.id || "").toLowerCase().includes(trimmedQuery);
        const phoneMatch = (person.phone || "").toLowerCase().includes(trimmedQuery);
        const cityMatch = (person.city || "").toLowerCase().includes(trimmedQuery);

        if (!nameMatch && !emailMatch && !idMatch && !phoneMatch && !cityMatch) {
          return false;
        }
      }

      // Role filter
      if (filters.role && person.role !== filters.role) {
        return false;
      }

      // Segment filter
      if (filters.segment && person.segment !== filters.segment) {
        return false;
      }

      // Status filter
      if (filters.status) {
        if (filters.status === "__unassigned__") {
          if (person.status) return false;
        } else if (person.status !== filters.status) {
          return false;
        }
      }

      // City filter
      if (filters.city && person.city !== filters.city) {
        return false;
      }

      return true;
    });
  }, [people, query, filters]);

  // 2. Sorted People: strictly immutable sort on the filtered dataset
  const sortedPeople = useMemo(() => {
    const { field, direction } = sortConfig;
    const mult = direction === "asc" ? 1 : -1;

    return [...filteredPeople].sort((a, b) => {
      const valA = a[field] ?? "";
      const valB = b[field] ?? "";

      if (typeof valA === "string" && typeof valB === "string") {
        return (
          valA.localeCompare(valB, undefined, {
            numeric: true,
            sensitivity: "base",
          }) * mult
        );
      }

      if (valA < valB) return -1 * mult;
      if (valA > valB) return 1 * mult;
      return 0;
    });
  }, [filteredPeople, sortConfig]);

  // 3. Paginated People: slice window of the sorted list
  const paginatedPeople = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPeople.slice(startIndex, startIndex + pageSize);
  }, [sortedPeople, currentPage, pageSize]);

  // Ensure current page does not exceed available pages
  const totalPages = Math.max(1, Math.ceil(sortedPeople.length / pageSize));
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // CRUD Operations
  const handleOpenAddModal = useCallback(() => {
    const nextId = generateNextId(people);
    setPersonModal({
      isOpen: true,
      mode: "create",
      person: { id: nextId },
    });
  }, [people]);

  const handleOpenEditModal = useCallback((person) => {
    setPersonModal({
      isOpen: true,
      mode: "edit",
      person,
    });
  }, []);

  const handleClosePersonModal = useCallback(() => {
    setPersonModal({
      isOpen: false,
      mode: "create",
      person: null,
    });
  }, []);

  const handleSavePerson = useCallback(
    (personData, isEdit) => {
      if (isEdit) {
        // Update only the selected record immutably
        setPeople((prev) =>
          prev.map((item) => (item.id === personData.id ? personData : item))
        );
        showToast(`Updated record for ${personData.fullName} (${personData.id})`);
      } else {
        // Add new record to the top of the collection so it is visible immediately
        setPeople((prev) => [personData, ...prev]);
        // Reset query and page to 1 so the newly created record is immediately seen
        setQuery("");
        setCurrentPage(1);
        showToast(
          `Added ${personData.fullName} (${personData.id}) to directory.`
        );
      }
      handleClosePersonModal();
    },
    [showToast, handleClosePersonModal]
  );

  const handleOpenDeleteModal = useCallback((person) => {
    setDeleteModal({
      isOpen: true,
      person,
    });
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({
      isOpen: false,
      person: null,
    });
  }, []);

  const handleConfirmDelete = useCallback(
    (personToDelete) => {
      setPeople((prev) => prev.filter((item) => item.id !== personToDelete.id));

      // Handle page step-back if deleting the sole item on the last page
      if (
        filteredPeople.length > 1 &&
        (filteredPeople.length - 1) <= (currentPage - 1) * pageSize &&
        currentPage > 1
      ) {
        setCurrentPage((prev) => prev - 1);
      }

      showToast(
        `Deleted record for ${personToDelete.fullName} (${personToDelete.id}).`,
        "info"
      );
      handleCloseDeleteModal();
    },
    [filteredPeople.length, currentPage, pageSize, showToast, handleCloseDeleteModal]
  );

  return (
    <div className="page-layout">
      <div className="page-container">
        {/* Header with Stats, Theme Toggle & Actions */}
        <Header
          totalCount={people.length}
          filteredCount={filteredPeople.length}
          onAddClick={handleOpenAddModal}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Toolbar: Search, Filters, Reset */}
        <Toolbar
          query={query}
          onQueryChange={handleQueryChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
        />

        {/* Directory Content Area */}
        <main className="directory-main" aria-label="People Directory Content">
          {sortedPeople.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <>
              <PeopleTable
                people={paginatedPeople}
                sortConfig={sortConfig}
                onSort={handleSortChange}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />

              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={sortedPeople.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      <PersonModal
        isOpen={personModal.isOpen}
        mode={personModal.mode}
        initialData={personModal.person}
        existingPeople={people}
        onSave={handleSavePerson}
        onClose={handleClosePersonModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        person={deleteModal.person}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
