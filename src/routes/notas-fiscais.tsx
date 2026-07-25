import { createFileRoute } from "@tanstack/react-router";

import { InvoicesPage } from "@/features/invoices/invoices-page";

export const Route = createFileRoute("/notas-fiscais")({
  component: InvoicesPage,
  head: () => ({
    meta: [{ title: "NexFiscal — Notas Fiscais" }],
  }),
});
