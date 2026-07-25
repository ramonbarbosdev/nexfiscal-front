import { StatsStrip } from "@/components/layout/stats-strip";

import { calcInvoiceTotals, formatBRL } from "./utils";
import type { Invoice } from "./types";

function buildStats(invoices: Invoice[]) {
  const total = invoices.length;
  const faturado = invoices
    .filter((i) => i.status === "emitida")
    .reduce((sum, i) => sum + calcInvoiceTotals(i.servico).valorLiquido, 0);
  const emitidas = invoices.filter((i) => i.status === "emitida").length;
  const rascunhos = invoices.filter((i) => i.status === "rascunho").length;
  const canceladas = invoices.filter((i) => i.status === "cancelada").length;

  return [
    { label: "Notas", value: total },
    { label: "Faturado", value: formatBRL(faturado), highlight: true },
    { label: "Emitidas", value: emitidas },
    { label: "Rascunhos", value: rascunhos },
    { label: "Canceladas", value: canceladas },
  ];
}

type StatsGridProps = {
  invoices: Invoice[];
};

export function StatsGrid({ invoices }: StatsGridProps) {
  return <StatsStrip items={buildStats(invoices)} />;
}
