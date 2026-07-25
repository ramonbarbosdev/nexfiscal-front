import type { SortDirection } from "@/hooks/use-list-controls";

import type { Invoice } from "./types";
import { calcInvoiceTotals } from "./utils";

export const INVOICE_STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "emitida", label: "Emitida" },
  { value: "cancelada", label: "Cancelada" },
];

export const INVOICE_SORT_OPTIONS = [
  { value: "date", label: "Data de emissão" },
  { value: "client", label: "Tomador" },
  { value: "service", label: "Serviço" },
  { value: "value", label: "Valor" },
  { value: "number", label: "Número" },
];

export function filterInvoice(
  invoice: Invoice,
  filters: { search: string; status: string },
) {
  if (filters.status !== "all" && invoice.status !== filters.status) return false;
  if (!filters.search) return true;

  const query = filters.search.toLowerCase();
  return (
    invoice.tomador.nome.toLowerCase().includes(query) ||
    invoice.servico.descricao.toLowerCase().includes(query) ||
    invoice.numero.includes(query) ||
    invoice.prestador.razaoSocial.toLowerCase().includes(query)
  );
}

export function sortInvoice(
  a: Invoice,
  b: Invoice,
  sortBy: string,
  direction: SortDirection,
) {
  const factor = direction === "asc" ? 1 : -1;

  switch (sortBy) {
    case "client":
      return a.tomador.nome.localeCompare(b.tomador.nome, "pt-BR") * factor;
    case "service":
      return a.servico.descricao.localeCompare(b.servico.descricao, "pt-BR") * factor;
    case "value": {
      const va = calcInvoiceTotals(a.servico).valorLiquido;
      const vb = calcInvoiceTotals(b.servico).valorLiquido;
      return (va - vb) * factor;
    }
    case "number":
      return a.numero.localeCompare(b.numero, "pt-BR") * factor;
    case "date":
    default:
      return (a.dataEmissao.getTime() - b.dataEmissao.getTime()) * factor;
  }
}
