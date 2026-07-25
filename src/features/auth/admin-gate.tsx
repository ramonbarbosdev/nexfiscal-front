import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "./auth-context";
import { hasPermission } from "./permissions";

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="nexfiscal-app flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Verificando permissões…</p>
      </div>
    );
  }

  if (!hasPermission(user, "USER_VIEW")) {
    return <Navigate to="/" />;
  }

  return children;
}
