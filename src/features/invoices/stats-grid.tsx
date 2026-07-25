import { CheckCircle2, Clock, FileText, TrendingUp, XCircle, type LucideIcon } from "lucide-react";

import { calcInvoiceTotals, formatBRL } from "./utils";
import type { Invoice } from "./types";

type StatCard = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

function buildStats(invoices: Invoice[]): StatCard[] {
  const total = invoices.length;
  const faturado = invoices
    .filter((i) => i.status === "emitida")
    .reduce((sum, i) => sum + calcInvoiceTotals(i.servico).valorLiquido, 0);
  const emitidas = invoices.filter((i) => i.status === "emitida").length;
  const rascunhos = invoices.filter((i) => i.status === "rascunho").length;
  const canceladas = invoices.filter((i) => i.status === "cancelada").length;

  return [
    { label: "Notas", value: total, icon: FileText },
    { label: "Faturado", value: formatBRL(faturado), icon: TrendingUp },
    { label: "Emitidas", value: emitidas, icon: CheckCircle2 },
    { label: "Rascunhos", value: rascunhos, icon: Clock },
    { label: "Canceladas", value: canceladas, icon: XCircle },
  ];
}

type StatsGridProps = {
  invoices: Invoice[];
};

export function StatsGrid({ invoices }: StatsGridProps) {
  const cards = buildStats(invoices);

  return (
    <section className="mb-6 grid grid-cols-2 gap-2.5 sm:mb-9 sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {card.label}
            </span>
            <card.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>
          <p className="font-mono-app text-xl font-bold tabular-nums">{card.value}</p>
        </div>
      ))}
    </section>
  );
}
