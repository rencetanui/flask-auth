import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Card, CardContent } from "./components/ui/card";
import { api } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";

function CenterState({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

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
      <CenterState>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading session...</p>
          </CardContent>
        </Card>
      </CenterState>
    );
  }

  if (bootError) {
    return (
      <CenterState>
        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">API Error</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                The frontend could not initialize your session.
              </p>
            </div>
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{bootError}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Make sure Flask is running at <code>http://localhost:5000</code>.
            </p>
          </CardContent>
        </Card>
      </CenterState>
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
