import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { EmpresasPage } from "@/features/empresas/empresas-page";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/empresas")({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AuthGate>
      <EmpresasPage />
    </AuthGate>
  ),
});
