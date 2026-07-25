import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { ItensPage } from "@/features/itens/itens-page";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/itens")({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AuthGate>
      <ItensPage />
    </AuthGate>
  ),
});
