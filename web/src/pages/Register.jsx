import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../lib/api";

export default function Register({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/auth/register", form);
      await onAuthenticated();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
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
        <h1>Register</h1>
        <p className="muted">Create an account to get started.</p>

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
              autoComplete="new-password"
              required
            />
          </label>

          <label className="stack">
            <span>Confirm Password</span>
            <input
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={updateField}
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
