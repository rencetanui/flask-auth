import { useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function SettingsPage() {
  const [msg, setMsg] = useState("");

  const ping = async () => {
    setMsg("");
    try {
      const res = await api.get("/api/health");
      setMsg(res.ok ? "API is healthy ✅" : "API responded, but ok=false");
    } catch (e) {
      setMsg(e?.message || "Failed to reach API");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-muted-foreground">Basic system checks</div>
      </div>

      <Card className="p-4 space-y-3">
        <Button variant="outline" onClick={ping}>
          Test API connection
        </Button>
        {msg ? <div className="text-sm">{msg}</div> : null}
      </Card>
    </div>
  );
}