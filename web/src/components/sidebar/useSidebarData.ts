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
      const [countsRes, listsRes] = await Promise.all([
        api.get("/api/sidebar/counts"),
        api.get("/api/lists"),
      ]);

      setCounts(countsRes.data);
      setLists(listsRes.data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { counts, lists, loading, refresh };
}