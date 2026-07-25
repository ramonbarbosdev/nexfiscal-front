import type { InvoiceForm, InvoiceTotals, Prestador, Servico } from "./types";

export function blankAddress() {
  return {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  };
}

export function blankPrestador(): Prestador {
  return {
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoMunicipal: "",
    email: "",
    telefone: "",
    endereco: blankAddress(),
  };
}

export function calcInvoiceTotals(servico: Servico): InvoiceTotals {
  const baseCalculo = Math.max(
    servico.valorServico -
      servico.valorDeducoes -
      servico.descontoIncondicionado -
      servico.descontoCondicionado,
    0,
  );
  const valorIss = baseCalculo * (servico.aliquotaIss / 100);
  const valorLiquido = servico.issRetido ? baseCalculo - valorIss : baseCalculo;

  return { baseCalculo, valorIss, valorLiquido };
}

export const STATUS_META = {
  emitida: {
    label: "Emitida",
    className: "nf-status nf-status--success",
  },
  rascunho: {
    label: "Rascunho",
    className: "nf-status nf-status--pending",
  },
  cancelada: {
    label: "Cancelada",
    className: "nf-status nf-status--muted",
  },
} as const;

export { formatBRL, formatCpfCnpj, formatDate, formatDateTime } from "@/lib/format";
