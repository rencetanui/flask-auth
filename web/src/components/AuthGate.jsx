import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

function CenterState({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

export default function AuthGate({ children }) {
  const { booting, bootError } = useAuth();

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

  return children;
}