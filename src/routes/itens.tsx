import { createFileRoute } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { ItensPage } from "@/features/itens/itens-page";
import { redirectIfNoSession } from "@/lib/auth-session";

export const Route = createFileRoute("/itens")({
  beforeLoad: redirectIfNoSession,
  component: () => (
    <AuthGate>
      <ItensPage />
    </AuthGate>
  ),
});
