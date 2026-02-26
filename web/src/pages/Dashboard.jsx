import { useEffect, useState } from "react";

import { api } from "../lib/api";

const FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

export default function Dashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTask, setNewTask] = useState({ content: "", description: "" });
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ content: "", description: "" });

  async function loadTasks(nextFilter = filter) {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/tasks?show=${encodeURIComponent(nextFilter)}`);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleAddTask(event) {
    event.preventDefault();
    if (!newTask.content.trim()) {
      setError("Task content is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("/api/tasks", {
        content: newTask.content,
        description: newTask.description,
      });
      setNewTask({ content: "", description: "" });
      await loadTasks(filter);
    } catch (err) {
      setError(err.message || "Failed to add task");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    setError("");
    try {
      await api.patch(`/api/tasks/${item.id}/toggle`, { completed: !item.completed });
      await loadTasks(filter);
    } catch (err) {
      setError(err.message || "Failed to update task");
    }
  }

  async function handleDelete(itemId) {
    setError("");
    try {
      await api.delete(`/api/tasks/${itemId}`);
      if (editingId === itemId) {
        setEditingId(null);
      }
      await loadTasks(filter);
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({
      content: item.content || "",
      description: item.description || "",
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ content: "", description: "" });
  }

  async function saveEdit(itemId) {
    if (!editForm.content.trim()) {
      setError("Task content is required");
      return;
    }

    setError("");
    try {
      await api.patch(`/api/tasks/${itemId}`, {
        content: editForm.content,
        description: editForm.description,
      });
      cancelEdit();
      await loadTasks(filter);
    } catch (err) {
      setError(err.message || "Failed to save task");
    }
  }

  async function handleLogout() {
    setError("");
    try {
      await onLogout();
    } catch (err) {
      setError(err.message || "Logout failed");
    }
  }

  return (
    <div className="page-shell">
      <div className="panel wide">
        <div className="row between">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Signed in as {user.username}</p>
          </div>
          <button type="button" className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <form onSubmit={handleAddTask} className="stack card">
          <h2>Add task</h2>
          <input
            placeholder="Task title"
            value={newTask.content}
            onChange={(event) =>
              setNewTask((prev) => ({ ...prev, content: event.target.value }))
            }
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(event) =>
              setNewTask((prev) => ({ ...prev, description: event.target.value }))
            }
            rows={3}
          />
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Task"}
          </button>
        </form>

        <div className="row gap">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={filter === option.value ? "chip active" : "chip"}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : items.length === 0 ? (
          <p className="muted">No tasks for this filter.</p>
        ) : (
          <ul className="task-list">
            {items.map((item) => (
              <li key={item.id} className="task-item">
                <div className="row between start">
                  <label className="row gap start">
                    <input
                      type="checkbox"
                      checked={Boolean(item.completed)}
                      onChange={() => handleToggle(item)}
                    />
                    <div>
                      <div className={item.completed ? "task-title done" : "task-title"}>
                        {item.content}
                      </div>
                      {item.description ? (
                        <div className="muted task-desc">{item.description}</div>
                      ) : null}
                    </div>
                  </label>

                  <div className="row gap">
                    <button type="button" className="secondary" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {editingId === item.id ? (
                  <div className="card stack compact">
                    <input
                      value={editForm.content}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, content: event.target.value }))
                      }
                    />
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                    />
                    <div className="row gap">
                      <button type="button" onClick={() => saveEdit(item.id)}>
                        Save
                      </button>
                      <button type="button" className="secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
