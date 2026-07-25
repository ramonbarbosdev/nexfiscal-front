import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthGate } from "@/features/auth/auth-gate";
import { InvoicesPage } from "@/features/invoices/invoices-page";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/notas-fiscais")({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AuthGate>
      <InvoicesPage />
    </AuthGate>
  ),
  head: () => ({
    meta: [{ title: "NexFiscal — Notas Fiscais" }],
  }),
});
