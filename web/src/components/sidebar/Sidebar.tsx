import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useSidebarData } from "./useSidebarData";

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {n}
    </span>
  );
}

export default function Sidebar() {
  const { counts, lists } = useSidebarData();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
      isActive
        ? "bg-muted text-foreground font-medium"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    );

  return (
    <aside className="hidden h-screen w-64 border-r bg-background p-4 md:block">
      <div className="flex h-full flex-col gap-4">
        {/* Top */}
        <div className="px-1">
          <div className="text-lg font-semibold">Task App</div>
          <div className="text-xs text-muted-foreground">Personal</div>
        </div>

        <Button className="w-full">+ New Task</Button>

        {/* Navigation */}
        <nav className="space-y-1">
          <NavLink to="/inbox" className={linkClass}>
            Inbox <Badge n={counts?.inbox} />
          </NavLink>
          <NavLink to="/today" className={linkClass}>
            Today <Badge n={counts?.today} />
          </NavLink>
          <NavLink to="/upcoming" className={linkClass}>
            Upcoming <Badge n={counts?.upcoming} />
          </NavLink>
          <NavLink to="/completed" className={linkClass}>
            Completed <Badge n={counts?.completed} />
          </NavLink>
        </nav>

        {/* Lists */}
        <Separator />

        <div className="space-y-2">
          <div className="px-2 text-xs font-semibold text-muted-foreground">
            Lists
          </div>

          <div className="space-y-1">
            {lists.map((l) => (
              <NavLink key={l.id} to={`/lists/${l.id}`} className={linkClass}>
                {l.name}
                <Badge n={counts?.lists?.[String(l.id)]} />
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-auto space-y-1">
          <Separator />
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
          <button
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
              "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            onClick={async () => {
              try {
                await api.post("/api/auth/logout");
              } catch (error) {
                // Ignore logout failures and still return to login.
              }
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
