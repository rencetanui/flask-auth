import React, { useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
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

  function handleGoogle() {
    // Absolute frontend URL (so backend can validate it safely)
    const nextUrl = `${window.location.origin}${to}`;
    window.location.href = `${API_BASE_URL}/api/auth/google/start?next=${encodeURIComponent(nextUrl)}`;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/api/auth/login", {
        username: form.username.trim(),
        password: form.password,
      });
      if (res?.user) {
        setUser(res.user);
      } else {
        await refreshSession();
      }
      navigate(to, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border">

        <h1 className="text-2xl font-semibold text-center mb-6">
          Sign in to your account
        </h1>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border py-2 rounded-md hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t"></div>
          <span className="mx-3 text-xs text-gray-500">OR</span>
          <div className="flex-grow border-t"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              value={form.username}
              onChange={(e) =>
                setForm((s) => ({ ...s, username: e.target.value }))
              }
              required
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              required
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}