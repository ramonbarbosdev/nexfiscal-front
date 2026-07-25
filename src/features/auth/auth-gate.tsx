import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "./auth-context";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="nexfiscal-app flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Verificando sessão…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}
