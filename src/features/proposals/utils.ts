import type { ProposalItem } from "./types";

export function formatBRL(value: number) {
  return (Number(value) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function calcItemsTotal(itens: ProposalItem[]) {
  return itens.reduce((sum, item) => sum + (Number(item.qtd) || 0) * (Number(item.valor) || 0), 0);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const STATUS_META = {
  aprovada: {
    label: "Aprovada",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
} as const;
