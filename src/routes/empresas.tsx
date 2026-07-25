import { createFileRoute } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { EmpresasPage } from "@/features/empresas/empresas-page";
import { redirectIfNoSession } from "@/lib/auth-session";

export const Route = createFileRoute("/empresas")({
  beforeLoad: redirectIfNoSession,
  component: () => (
    <AuthGate>
      <EmpresasPage />
    </AuthGate>
  ),
});
