import { createFileRoute } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { ClientesPage } from "@/features/clientes/clientes-page";
import { redirectIfNoSession } from "@/lib/auth-session";

export const Route = createFileRoute("/clientes")({
  beforeLoad: redirectIfNoSession,
  component: () => (
    <AuthGate>
      <ClientesPage />
    </AuthGate>
  ),
});
