import React, { useState } from "react";
import { api } from "@/lib/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const to = location.state?.from?.pathname || "/inbox"; // redirect target after login

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/api/auth/login", {
        username: form.username.trim(),
        password: form.password,
      });
      // Option A: backend returned user immediately
      if (res?.user) {
        setUser(res.user);
      } else {
        // Option B: fetch /me to be safe
        const me = await api.get("/api/auth/me");
        setUser(me.user);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm(s => ({ ...s, username: e.target.value }))}
              required
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
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 underline">Create one</Link>
        </div>
      </div>
    </div>
  );
}