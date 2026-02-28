import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function toIsoOrNull(value) {
  if (!value) return null;
  // value is like "2026-02-27T14:30"
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function TaskComposer({ defaultListId = null, onCreate }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [dueLocal, setDueLocal] = useState(""); // datetime-local string
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => content.trim().length > 0 && !submitting, [content, submitting]);

  const submit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await onCreate({
        content: content.trim(),
        description: description.trim() || null,
        due_at: toIsoOrNull(dueLocal),
        list_id: defaultListId,
      });

      setContent("");
      setDescription("");
      setDueLocal("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">+ New Task</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Task title..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Due date/time (optional)</div>
            <Input
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}