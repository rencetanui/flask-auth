import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import TaskItem from "./TaskItem";
import TaskComposer from "./TaskComposer";
import { Separator } from "../ui/separator";

function buildQuery({ show, view }) {
  const params = new URLSearchParams();
  if (show) params.set("show", show);
  if (view) params.set("view", view);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function TasksPage({ title, show = "active", view = "", defaultListId = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = buildQuery({ show, view });
      const res = await api.get(`/api/tasks${qs}`);
      setItems(res.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [show, view]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (payload) => {
    await api.post("/api/tasks", payload);
    await load();
  };

  const onToggle = async (task, completed) => {
    await api.patch(`/api/tasks/${task.id}/toggle`, { completed });
    await load();
  };

  const onDelete = async (task) => {
    await api.delete(`/api/tasks/${task.id}`);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">Manage your tasks</div>
        </div>

        <div className="w-64">
          <TaskComposer defaultListId={defaultListId} onCreate={onCreate} />
        </div>
      </div>

      <Separator />

      {loading ? <div className="text-sm text-muted-foreground">Loading...</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {!loading && !error && items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No tasks here.</div>
      ) : null}

      <div className="space-y-2">
        {items.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
