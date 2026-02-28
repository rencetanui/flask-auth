import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        // If you have /api/me, use it. Otherwise you can remove this page or read username from session elsewhere.
        const res = await api.get("/api/auth/me");
        setUser(res.user || null);
      } catch (e) {
        setError(e?.message || "Failed to load profile");
      }
    })();
  }, []);

  const logout = async () => {
    try {
      // if your backend logout is POST /api/logout:
      await api.post("/api/auth/logout", {});
    } catch (err) {
      // ignore; still redirect
    }
    window.location.href = "/login";
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Profile</div>
        <div className="text-sm text-muted-foreground">Account details</div>
      </div>

      <Card className="p-4 space-y-3">
        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {!error && !user ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : null}

        {user ? (
          <>
            <div className="text-sm">
              <span className="text-muted-foreground">Username:</span>{" "}
              <span className="font-medium">{user.username}</span>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        ) : null}
      </Card>
    </div>
  );
}