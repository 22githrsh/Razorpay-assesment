import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import PeopleTable from "./components/PeopleTable";
import Pagination from "./components/Pagination";
import PersonModal from "./components/PersonModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmptyState from "./components/EmptyState";
import Toast from "./components/Toast";
import { DEFAULT_PAGE_SIZE } from "./constants/peopleOptions";
import {
  ApiError,
  createPerson,
  deletePerson,
  fetchNextId,
  fetchPeople,
  updatePerson,
} from "./api/peopleApi";
import "./App.css";

export default function App() {
  // Current page from the API. Search, filters, and sort run on the server.
  const [people, setPeople] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize) || 1);
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredCount, pageSize, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    async function loadPeople() {
      setLoading(true);
      setListError("");
      try {
        const result = await fetchPeople(
          {
            page: currentPage,
            limit: pageSize,
            q: debouncedQuery.trim(),
            role: filters.role,
            segment: filters.segment,
            status: filters.status,
            city: filters.city,
            sort: sortConfig.field,
            direction: sortConfig.direction,
          },
          controller.signal
        );
        if (ignore) return;
        setPeople(result.data || []);
        setTotalCount(result.total || 0);
        setFilteredCount(result.filteredTotal || 0);
      } catch (error) {
        if (ignore || error.name === "AbortError") return;
        setListError(error.message || "Could not load people.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadPeople();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [debouncedQuery, filters, sortConfig, currentPage, pageSize, refreshKey]);

  const reloadPeople = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  // CRUD Operations
  const handleOpenAddModal = useCallback(async () => {
    try {
      const next = await fetchNextId();
      setPersonModal({
        isOpen: true,
        mode: "create",
        person: { id: next.id },
      });
    } catch (error) {
      showToast(error.message || "Could not reserve a new record id.", "error");
    }
  }, [showToast]);

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
    async (personData, isEdit) => {
      try {
        if (isEdit) {
          await updatePerson(personData.id, personData);
          showToast(`Updated record for ${personData.fullName} (${personData.id})`);
        } else {
          await createPerson(personData);
          setQuery("");
          setDebouncedQuery("");
          setCurrentPage(1);
          showToast(`Added ${personData.fullName} (${personData.id}) to directory.`);
        }
        handleClosePersonModal();
        reloadPeople();
        return { ok: true };
      } catch (error) {
        const fieldErrors = error instanceof ApiError ? error.errors : undefined;
        showToast(error.message || "Could not save this person.", "error");
        return { ok: false, fieldErrors };
      }
    },
    [showToast, handleClosePersonModal, reloadPeople]
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
    async (personToDelete) => {
      try {
        await deletePerson(personToDelete.id);
        const remaining = Math.max(0, filteredCount - 1);
        const lastPage = Math.max(1, Math.ceil(remaining / pageSize));
        if (currentPage > lastPage) setCurrentPage(lastPage);
        showToast(
          `Deleted record for ${personToDelete.fullName} (${personToDelete.id}).`,
          "info"
        );
        handleCloseDeleteModal();
        reloadPeople();
      } catch (error) {
        showToast(error.message || "Could not delete this person.", "error");
      }
    },
    [
      filteredCount,
      currentPage,
      pageSize,
      showToast,
      handleCloseDeleteModal,
      reloadPeople,
    ]
  );

  return (
    <div className="page-layout">
      <div className="page-container">
        {/* Header with Stats, Theme Toggle & Actions */}
        <Header
          totalCount={totalCount}
          filteredCount={filteredCount}
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
        <main className="directory-main" aria-label="People Directory Content" aria-busy={loading}>
          {listError && (
            <div className="list-banner list-banner-error" role="alert">
              <span>{listError}</span>
              <button type="button" className="btn btn-secondary" onClick={reloadPeople}>
                Retry
              </button>
            </div>
          )}
          {loading && people.length === 0 && !listError ? (
            <div className="list-status" role="status">
              Loading people…
            </div>
          ) : listError && people.length === 0 ? (
            <div className="list-status">The directory could not be loaded.</div>
          ) : !loading && filteredCount === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <>
              {loading && (
                <div className="list-banner" role="status">
                  Updating results…
                </div>
              )}
              <PeopleTable
                people={people}
                sortConfig={sortConfig}
                onSort={handleSortChange}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />

              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredCount}
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
