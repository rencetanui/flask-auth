import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Card } from "../ui/card";

export default function TaskItem({ task, onToggle, onDelete }) {
  const [busy, setBusy] = useState(false);

  const handleToggle = async (checked) => {
    if (busy) return;
    setBusy(true);
    try {
      await onToggle(task, Boolean(checked));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onDelete(task);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <Checkbox checked={task.completed} onCheckedChange={handleToggle} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={
                "truncate text-sm font-medium " +
                (task.completed ? "line-through text-muted-foreground" : "")
              }
            >
              {task.content}
            </div>
          </div>

          {task.description ? (
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </div>
          ) : null}

          <div className="mt-2 text-[11px] text-muted-foreground">
            Created: {task.created_at ? new Date(task.created_at).toLocaleString() : "-"}
            {task.due_at ? ` | Due: ${new Date(task.due_at).toLocaleString()}` : ""}
          </div>
        </div>

        <Button variant="outline" size="sm" disabled={busy} onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
