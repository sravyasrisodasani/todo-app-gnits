import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api";
import { FILTERS } from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

const TASKS_PER_PAGE = 10;

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function showError(err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  }

  // Load all todos
  useEffect(() => {
    async function loadTodos() {
      try {
        setError("");
        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  // Add a new todo
  async function handleAdd(title) {
    try {
      setError("");

      const newTodo = await createTodo(title);

      setTodos((prev) => [newTodo, ...prev]);

      // New task appears on first page
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Update todo
  async function handleUpdate(id, data) {
    try {
      setError("");

      const updated = await updateTodo(id, data);

      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === updated._id ? updated : todo
        )
      );
    } catch (err) {
      showError(err);
    }
  }

  // Delete one todo
  async function handleDelete(id) {
    try {
      setError("");

      await deleteTodo(id);

      setTodos((prev) =>
        prev.filter((todo) => todo._id !== id)
      );
    } catch (err) {
      showError(err);
    }
  }

  // Delete all completed todos
  async function handleClearDone() {
    try {
      setError("");

      const doneTodos = todos.filter(
        (todo) => todo.completed
      );

      for (const todo of doneTodos) {
        await deleteTodo(todo._id);
      }

      setTodos((prev) =>
        prev.filter((todo) => !todo.completed)
      );

      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Filter according to All / Active / Completed
  const filteredTodos = todos.filter(
    FILTERS[filter].test
  );

  // Total number of pages
  const totalPages = Math.ceil(
    filteredTodos.length / TASKS_PER_PAGE
  );

  // Prevent invalid page after deleting tasks
  const safeCurrentPage =
    totalPages === 0
      ? 1
      : Math.min(currentPage, totalPages);

  // Calculate which 10 tasks should be displayed
  const startIndex =
    (safeCurrentPage - 1) * TASKS_PER_PAGE;

  const endIndex =
    startIndex + TASKS_PER_PAGE;

  const paginatedTodos = filteredTodos.slice(
    startIndex,
    endIndex
  );

  const taskWord =
    filteredTodos.length === 1
      ? "task"
      : "tasks";

  // Change filter and go back to page 1
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
  }

  // Go to a particular page
  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  // Previous page
  function goToPreviousPage() {
    if (safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }
  }

  // Next page
  function goToNextPage() {
    if (safeCurrentPage < totalPages) {
      setCurrentPage(safeCurrentPage + 1);
    }
  }

  // Decide what to display
  function renderTodos() {
    if (loading) {
      return <p className="empty">Loading...</p>;
    }

    if (filteredTodos.length === 0) {
      let message =
        "You're all caught up. Add a task above.";

      if (filter === "active") {
        message = "No active tasks";
      }

      if (filter === "done") {
        message = "Nothing completed yet";
      }

      return (
        <div className="empty">
          <img src="/logo.png" alt="" />
          <p>{message}</p>
        </div>
      );
    }

    return (
      <>
        <ul className="todo-list">
          {paginatedTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">

            {/* Previous */}
            <button
              className="page-arrow"
              onClick={goToPreviousPage}
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {/* Page numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                className={
                  safeCurrentPage === page
                    ? "page-number active"
                    : "page-number"
                }
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              className="page-arrow"
              onClick={goToNextPage}
              disabled={
                safeCurrentPage === totalPages
              }
              aria-label="Next page"
            >
              ›
            </button>

          </div>
        )}
      </>
    );
  }

  return (
    <div className="layout">

      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={handleFilterChange}
        onClearDone={handleClearDone}
      />

      <main className="panel content">

        <header className="content-header">

          <h2>
            {FILTERS[filter].label}
          </h2>

          <span className="content-count">
            {filteredTodos.length} {taskWord}
          </span>

        </header>

        <TodoForm onAdd={handleAdd} />

        {error && (
          <div
            className="error"
            role="alert"
          >
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {renderTodos()}

      </main>

    </div>
  );
}

export default App;