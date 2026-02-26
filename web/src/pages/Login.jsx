import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, api } from "../lib/api";

const googleEnabledByEnv = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true";

export default function Login({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    if (!googleEnabledByEnv) {
      setGoogleEnabled(false);
      return () => {
        active = false;
      };
    }

    api
      .get("/api/health")
      .then((data) => {
        if (!active) return;
        setGoogleEnabled(Boolean(data?.google_oauth_enabled));
      })
      .catch(() => {
        if (!active) return;
        setGoogleEnabled(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/auth/login", form);
      await onAuthenticated();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="panel">
        <div className="auth-brand">
          <img src="/logo.png" alt="Task Manager logo" className="auth-logo" />
        </div>
        <h1>Welcome.</h1>
        <p className="muted">Sign in to your account.</p>

        {error ? <p className="error">{error}</p> : null}

        <form onSubmit={handleSubmit} className="stack">
          <label className="stack">
            <span>Username</span>
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              autoComplete="username"
              required
            />
          </label>

          <label className="stack">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>

          {googleEnabled ? (
            <a href={`${API_BASE_URL}/login/google`} className="button">
              Sign in with Google
            </a>
          ) : null}
        </form>

        <p className="muted">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
