import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="shadow-soft">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Signed in as {user.username}</p>
            </div>
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Add task</CardTitle>
                <CardDescription>Create a new task item for your list.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-task-title">Task title</Label>
                    <Input
                      id="new-task-title"
                      placeholder="Task title"
                      value={newTask.content}
                      onChange={(event) =>
                        setNewTask((prev) => ({ ...prev, content: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-task-description">Description</Label>
                    <Textarea
                      id="new-task-description"
                      placeholder="Description (optional)"
                      value={newTask.description}
                      onChange={(event) =>
                        setNewTask((prev) => ({ ...prev, description: event.target.value }))
                      }
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? "Saving..." : "Add Task"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Filter</CardTitle>
                <CardDescription>Choose which tasks to show.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={filter === option.value ? "default" : "outline"}
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Tasks</CardTitle>
                  <CardDescription>
                    {loading ? "Loading tasks..." : `${items.length} task${items.length === 1 ? "" : "s"}`}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="w-fit capitalize">
                  {filter}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : items.length === 0 ? (
                <div className="rounded-md border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
                  No tasks for this filter.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-background p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(item.completed)}
                          onChange={() => handleToggle(item)}
                          className="mt-1 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
                        />
                        <div className="space-y-1">
                          <div
                            className={
                              item.completed
                                ? "font-medium text-muted-foreground line-through"
                                : "font-medium text-foreground"
                            }
                          >
                            {item.content}
                          </div>
                          {item.description ? (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          ) : null}
                        </div>
                      </label>

                      <div className="flex gap-2 sm:shrink-0">
                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {editingId === item.id ? (
                      <div className="mt-4 space-y-3 rounded-md border bg-muted/30 p-3">
                        <Input
                          value={editForm.content}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, content: event.target.value }))
                          }
                        />
                        <Textarea
                          rows={2}
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, description: event.target.value }))
                          }
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" onClick={() => saveEdit(item.id)}>
                            Save
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}