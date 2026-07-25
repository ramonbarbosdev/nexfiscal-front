import {
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { calcItemsTotal, formatBRL } from "./utils";
import type { Proposal } from "./types";

type StatCard = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function buildStats(proposals: Proposal[]): StatCard[] {
  const total = proposals.length;
  const vendido = proposals
    .filter((p) => p.status === "aprovada")
    .reduce((sum, p) => sum + (calcItemsTotal(p.itens) - p.desconto), 0);
  const aprovadas = proposals.filter((p) => p.status === "aprovada").length;
  const pendentes = proposals.filter((p) => p.status === "pendente").length;
  const canceladas = proposals.filter((p) => p.status === "cancelada").length;

  return [
    { label: "Propostas", value: total, icon: FileText },
    { label: "Valor vendido", value: formatBRL(vendido), icon: TrendingUp },
    { label: "Aprovadas", value: aprovadas, icon: CheckCircle2 },
    { label: "Pendentes", value: pendentes, icon: Clock },
    { label: "Canceladas", value: canceladas, icon: XCircle },
  ];
}

type StatsGridProps = {
  proposals: Proposal[];
};

export function StatsGrid({ proposals }: StatsGridProps) {
  const cards = buildStats(proposals);

  return (
    <section className="mb-6 grid grid-cols-2 gap-2.5 sm:mb-9 sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-card p-4"
        >
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
