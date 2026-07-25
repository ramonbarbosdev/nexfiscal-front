import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { ProposalsPage } from "@/features/proposals/proposals-page";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AuthGate>
      <ProposalsPage />
    </AuthGate>
  ),
});
