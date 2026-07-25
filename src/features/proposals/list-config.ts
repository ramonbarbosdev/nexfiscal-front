import type { SortDirection } from "@/hooks/use-list-controls";

import type { Proposal } from "./types";
import { calcItemsTotal } from "./utils";

export const PROPOSAL_STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovada", label: "Aprovada" },
  { value: "concluida", label: "Concluída" },
  { value: "cancelada", label: "Cancelada" },
];

export const PROPOSAL_SORT_OPTIONS = [
  { value: "date", label: "Data de criação" },
  { value: "client", label: "Cliente" },
  { value: "title", label: "Projeto" },
  { value: "value", label: "Valor" },
  { value: "number", label: "Número" },
];

export function filterProposal(
  proposal: Proposal,
  filters: { search: string; status: string },
) {
  if (filters.status !== "all" && proposal.status !== filters.status) return false;
  if (!filters.search) return true;

  const query = filters.search.toLowerCase();
  return (
    proposal.cliente.nome.toLowerCase().includes(query) ||
    proposal.projeto.titulo.toLowerCase().includes(query) ||
    proposal.empresa.nome.toLowerCase().includes(query) ||
    proposal.numero.toLowerCase().includes(query)
  );
}

export function sortProposal(
  a: Proposal,
  b: Proposal,
  sortBy: string,
  direction: SortDirection,
) {
  const factor = direction === "asc" ? 1 : -1;

  switch (sortBy) {
    case "client":
      return a.cliente.nome.localeCompare(b.cliente.nome, "pt-BR") * factor;
    case "title":
      return (a.projeto.titulo || "").localeCompare(b.projeto.titulo || "", "pt-BR") * factor;
    case "value": {
      const va = calcItemsTotal(a.itens) - a.desconto;
      const vb = calcItemsTotal(b.itens) - b.desconto;
      return (va - vb) * factor;
    }
    case "number":
      return a.numero.localeCompare(b.numero, "pt-BR") * factor;
    case "date":
    default:
      return (a.createdAt.getTime() - b.createdAt.getTime()) * factor;
  }
}
