import React, { useState } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/register", {
        username: form.username.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      });
      if (res?.user) {
        setUser(res.user);
      } else {
        const me = await api.get("/api/auth/me");
        setUser(me.user);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm(s => ({ ...s, username: e.target.value }))}
              required
              minLength={3}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))}
              required
              minLength={6}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm password</label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) => setForm(s => ({ ...s, confirm_password: e.target.value }))}
              required
              minLength={6}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}