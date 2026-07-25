import { calcItemsTotal, formatBRL } from "./utils";
import type { Proposal } from "./types";
import { StatsStrip } from "@/components/layout/stats-strip";

function buildStats(proposals: Proposal[]) {
  const total = proposals.length;
  const vendido = proposals
    .filter((p) => p.status === "aprovada")
    .reduce((sum, p) => sum + (calcItemsTotal(p.itens) - p.desconto), 0);
  const aprovadas = proposals.filter((p) => p.status === "aprovada").length;
  const pendentes = proposals.filter((p) => p.status === "pendente").length;
  const canceladas = proposals.filter((p) => p.status === "cancelada").length;

  return [
    { label: "Total", value: total },
    { label: "Vendido", value: formatBRL(vendido), highlight: true },
    { label: "Aprovadas", value: aprovadas },
    { label: "Pendentes", value: pendentes },
    { label: "Canceladas", value: canceladas },
  ];
}

type StatsGridProps = {
  proposals: Proposal[];
};

export function StatsGrid({ proposals }: StatsGridProps) {
  return <StatsStrip items={buildStats(proposals)} />;
}
