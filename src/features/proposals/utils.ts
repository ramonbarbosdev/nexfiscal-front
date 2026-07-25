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
    className: "nf-status nf-status--success",
  },
  pendente: {
    label: "Pendente",
    className: "nf-status nf-status--pending",
  },
  cancelada: {
    label: "Cancelada",
    className: "nf-status nf-status--muted",
  },
} as const;
