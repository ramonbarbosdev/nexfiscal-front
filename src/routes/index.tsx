import { createFileRoute } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { ProposalsPage } from "@/features/proposals/proposals-page";
import { redirectIfNoSession } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
  beforeLoad: redirectIfNoSession,
  component: () => (
    <AuthGate>
      <ProposalsPage />
    </AuthGate>
  ),
});
