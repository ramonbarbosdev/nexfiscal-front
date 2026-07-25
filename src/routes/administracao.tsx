import { createFileRoute } from "@tanstack/react-router";

import { UsuariosPage } from "@/features/administracao/usuarios/usuarios-page";
import { AdminGate } from "@/features/auth/admin-gate";
import { AuthGate } from "@/features/auth/auth-gate";
import { redirectIfNoSession } from "@/lib/auth-session";

export const Route = createFileRoute("/administracao")({
  beforeLoad: redirectIfNoSession,
  component: () => (
    <AuthGate>
      <AdminGate>
        <UsuariosPage />
      </AdminGate>
    </AuthGate>
  ),
});
