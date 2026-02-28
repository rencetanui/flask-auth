import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/auth/register", {
        username: form.username.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      });
      nav("/today");
    } catch (err) {
      setError(err?.message || "Register failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <Card className="w-full p-6 space-y-4">
        <div>
          <div className="text-xl font-semibold">Create account</div>
          <div className="text-sm text-muted-foreground">
            Register and start using the app
          </div>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-1">
            <Label>Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm((s) => ({ ...s, confirm_password: e.target.value }))
              }
              autoComplete="new-password"
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-foreground underline" to="/login">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}