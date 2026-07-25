import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { ClientesPage } from "@/features/clientes/clientes-page";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/clientes")({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AuthGate>
      <ClientesPage />
    </AuthGate>
  ),
});
