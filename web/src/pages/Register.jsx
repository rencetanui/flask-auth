import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-white/50 shadow-soft backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Task Manager logo" className="h-14 w-auto object-contain" />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Create an account to get started.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="register-username">Username</Label>
              <Input
                id="register-username"
                name="username"
                value={form.username}
                onChange={updateField}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                name="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={updateField}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
