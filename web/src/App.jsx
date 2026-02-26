import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { api } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");

  async function refreshSession() {
    try {
      const data = await api.get("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err.status === 401) {
        setUser(null);
        return null;
      }
      throw err;
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setBootError("");
      try {
        await refreshSession();
      } catch (err) {
        if (alive) {
          setBootError(err.message || "Failed to reach API");
        }
      } finally {
        if (alive) {
          setBooting(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleAuthenticated() {
    await refreshSession();
  }

  async function handleLogout() {
    await api.post("/api/auth/logout");
    setUser(null);
  }

  if (booting) {
    return (
      <div className="page-shell">
        <div className="panel">
          <p className="muted">Loading session...</p>
        </div>
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="page-shell">
        <div className="panel">
          <h1>API Error</h1>
          <p className="error">{bootError}</p>
          <p className="muted">
            Make sure Flask is running at <code>http://localhost:5000</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Register onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
