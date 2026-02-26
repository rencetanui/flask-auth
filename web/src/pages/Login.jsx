import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button, buttonVariants } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-white/50 shadow-soft backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Task Manager logo" className="h-14 w-auto object-contain" />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in to your account.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                name="username"
                value={form.username}
                onChange={updateField}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </Button>

            {googleEnabled ? (
              <a
                href={`${API_BASE_URL}/login/google`}
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                Sign in with Google
              </a>
            ) : null}
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
