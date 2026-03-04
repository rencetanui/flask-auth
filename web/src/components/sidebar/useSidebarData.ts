import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export type SidebarCounts = {
  inbox: number;
  today: number;
  upcoming: number;
  completed: number;
  lists?: Record<string, number>; // { "listId": count }
};

export type TaskList = { id: number; name: string };

export function useSidebarData() {
  const [counts, setCounts] = useState<SidebarCounts | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/bootstrap");
      setCounts(res?.counts ?? null);
      setLists(res?.lists ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { counts, lists, loading, refresh };
}
