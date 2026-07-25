import { apiRequest, type SpringPage } from "@/lib/api-client";

import type { Proposal, ProposalForm, ProposalStatus } from "./types";

type ApiProposalItem = {
  id: number;
  desc: string;
  qtd: number;
  valor: number;
};

type ApiProposal = {
  id: number;
  numero: string;
  status: string;
  createdAt: string;
  empresa: ProposalForm["empresa"];
  cliente: ProposalForm["cliente"];
  projeto: ProposalForm["projeto"];
  itens: ApiProposalItem[];
  desconto: number;
  entrada: number;
  formaPagamento: string;
  observacoes: string;
};

function mapProposal(dto: ApiProposal): Proposal {
  return {
    id: dto.id,
    numero: dto.numero,
    status: dto.status as ProposalStatus,
    createdAt: new Date(dto.createdAt),
    empresa: dto.empresa,
    cliente: dto.cliente,
    projeto: dto.projeto,
    itens: dto.itens.map((item) => ({
      id: item.id,
      desc: item.desc,
      qtd: Number(item.qtd),
      valor: Number(item.valor),
    })),
    desconto: Number(dto.desconto),
    entrada: Number(dto.entrada),
    formaPagamento: dto.formaPagamento ?? "",
    observacoes: dto.observacoes ?? "",
  };
}

function toFormPayload(form: ProposalForm) {
  return {
    empresa: form.empresa,
    cliente: form.cliente,
    projeto: form.projeto,
    itens: form.itens.map((item) => ({
      id: item.id > 0 ? item.id : null,
      desc: item.desc,
      qtd: item.qtd,
      valor: item.valor,
    })),
    desconto: form.desconto,
    entrada: form.entrada,
    formaPagamento: form.formaPagamento,
    observacoes: form.observacoes,
  };
}

export const proposalKeys = {
  all: ["propostas"] as const,
};

export async function fetchProposals(): Promise<Proposal[]> {
  const page = await apiRequest<SpringPage<ApiProposal>>("/propostas?size=1000&sort=dtCriacao,desc");
  return page.content.map(mapProposal);
}

export async function createProposal(form: ProposalForm): Promise<Proposal> {
  const dto = await apiRequest<ApiProposal>("/propostas", {
    method: "POST",
    body: toFormPayload(form),
  });
  return mapProposal(dto);
}

export async function updateProposal(id: number, form: ProposalForm): Promise<Proposal> {
  const dto = await apiRequest<ApiProposal>(`/propostas/${id}`, {
    method: "PUT",
    body: toFormPayload(form),
  });
  return mapProposal(dto);
}

export async function patchProposalStatus(id: number, status: ProposalStatus): Promise<Proposal> {
  const dto = await apiRequest<ApiProposal>(`/propostas/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return mapProposal(dto);
}

export async function duplicateProposalApi(id: number): Promise<Proposal> {
  const dto = await apiRequest<ApiProposal>(`/propostas/${id}/duplicar`, {
    method: "POST",
  });
  return mapProposal(dto);
}
