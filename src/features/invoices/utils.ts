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

export function generateVerificationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function validateInvoiceForm(form: InvoiceForm): string | null {
  if (!form.prestador.razaoSocial.trim()) return "Informe a razão social do prestador";
  if (!form.prestador.cnpj.trim()) return "Informe o CNPJ do prestador";
  if (!form.prestador.inscricaoMunicipal.trim()) return "Informe a inscrição municipal";
  if (!form.tomador.nome.trim()) return "Informe o nome do tomador";
  if (!form.tomador.cpfCnpj.trim()) return "Informe o CPF/CNPJ do tomador";
  if (!form.servico.descricao.trim()) return "Informe a descrição do serviço";
  if (form.servico.valorServico <= 0) return "Informe o valor do serviço";
  return null;
}

export const STATUS_META = {
  emitida: {
    label: "Emitida",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  rascunho: {
    label: "Rascunho",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
} as const;

export { formatBRL, formatCpfCnpj, formatDate, formatDateTime } from "@/lib/format";
