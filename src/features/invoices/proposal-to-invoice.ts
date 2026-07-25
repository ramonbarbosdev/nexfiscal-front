import type { Proposal } from "@/features/proposals/types";
import { calcItemsTotal } from "@/features/proposals/utils";

import type { InvoiceForm, Prestador } from "./types";
import { blankAddress } from "./utils";

const INVOICE_FROM_PROPOSAL_KEY = "nexfiscal:invoice-from-proposal";

type StashedInvoiceFromProposal = {
  form: InvoiceForm;
  proposalId: number;
  proposalNumero: string;
};

export function proposalToInvoiceForm(
  proposal: Proposal,
  prestadorDefaults: Prestador,
): InvoiceForm {
  const total = Math.max(calcItemsTotal(proposal.itens) - (proposal.desconto || 0), 0);
  const itemLines = proposal.itens
    .filter((item) => item.desc.trim())
    .map((item) => `- ${item.desc} (${item.qtd} × R$ ${item.valor.toFixed(2)})`);

  const discriminacao = [proposal.projeto.descricao?.trim(), ...itemLines]
    .filter(Boolean)
    .join("\n");

  const observacoes = [
    proposal.observacoes?.trim(),
    proposal.formaPagamento ? `Forma de pagamento: ${proposal.formaPagamento}` : "",
    `Referência: Proposta Nº ${proposal.numero}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    prestador: {
      ...prestadorDefaults,
      razaoSocial: proposal.empresa.nome || prestadorDefaults.razaoSocial,
      nomeFantasia: proposal.empresa.nome || prestadorDefaults.nomeFantasia,
      email: proposal.empresa.email || prestadorDefaults.email,
      telefone: proposal.empresa.whatsapp || prestadorDefaults.telefone,
    },
    tomador: {
      tipo: "pf",
      nome: proposal.cliente.nome,
      cpfCnpj: "",
      email: "",
      telefone: proposal.cliente.telefone,
      inscricaoMunicipal: "",
      endereco: blankAddress(),
    },
    servico: {
      codigoLc116: "17.01",
      descricao: proposal.projeto.titulo || proposal.itens[0]?.desc || "Serviços prestados",
      discriminacao,
      valorServico: total,
      aliquotaIss: 5,
      issRetido: false,
      valorDeducoes: 0,
      descontoIncondicionado: 0,
      descontoCondicionado: 0,
    },
    observacoes,
  };
}

export function stashInvoiceFromProposal(form: InvoiceForm, proposal: Proposal) {
  const payload: StashedInvoiceFromProposal = {
    form,
    proposalId: proposal.id,
    proposalNumero: proposal.numero,
  };
  sessionStorage.setItem(INVOICE_FROM_PROPOSAL_KEY, JSON.stringify(payload));
}

export function consumeInvoiceFromProposal(): StashedInvoiceFromProposal | null {
  const raw = sessionStorage.getItem(INVOICE_FROM_PROPOSAL_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(INVOICE_FROM_PROPOSAL_KEY);
  try {
    return JSON.parse(raw) as StashedInvoiceFromProposal;
  } catch {
    return null;
  }
}
