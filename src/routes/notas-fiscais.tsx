import { createFileRoute } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { InvoicesPage } from "@/features/invoices/invoices-page";
import { redirectIfNoSession } from "@/lib/auth-session";

export const Route = createFileRoute("/notas-fiscais")({
  beforeLoad: redirectIfNoSession,
  component: () => (
    <AuthGate>
      <InvoicesPage />
    </AuthGate>
  ),
  head: () => ({
    meta: [{ title: "NexFiscal — Notas Fiscais" }],
  }),
});
