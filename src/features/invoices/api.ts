import { apiRequest, getApiBaseUrl, getToken, type SpringPage } from "@/lib/api-client";

import type { Invoice, InvoiceForm, InvoiceStatus, Prestador } from "./types";

type ApiInvoice = {
  id: number;
  numero: string;
  serie: string;
  status: string;
  dataEmissao: string;
  codigoVerificacao: string | null;
  prestador: InvoiceForm["prestador"];
  tomador: InvoiceForm["tomador"];
  servico: InvoiceForm["servico"];
  observacoes: string;
};

function mapInvoice(dto: ApiInvoice): Invoice {
  return {
    id: dto.id,
    numero: dto.numero,
    serie: dto.serie,
    status: dto.status as InvoiceStatus,
    dataEmissao: new Date(dto.dataEmissao),
    codigoVerificacao: dto.codigoVerificacao,
    prestador: dto.prestador,
    tomador: dto.tomador,
    servico: {
      ...dto.servico,
      valorServico: Number(dto.servico.valorServico),
      aliquotaIss: Number(dto.servico.aliquotaIss),
      valorDeducoes: Number(dto.servico.valorDeducoes),
      descontoIncondicionado: Number(dto.servico.descontoIncondicionado),
      descontoCondicionado: Number(dto.servico.descontoCondicionado),
    },
    observacoes: dto.observacoes ?? "",
  };
}

function toFormPayload(form: InvoiceForm) {
  return {
    prestador: form.prestador,
    tomador: form.tomador,
    servico: form.servico,
    observacoes: form.observacoes,
  };
}

export const invoiceKeys = {
  all: ["notas-fiscais"] as const,
  prestador: ["config", "prestador"] as const,
};

export async function fetchInvoices(): Promise<Invoice[]> {
  const page = await apiRequest<SpringPage<ApiInvoice>>("/notas-fiscais?size=1000&sort=dtEmissao,desc");
  return page.content.map(mapInvoice);
}

export async function createInvoice(form: InvoiceForm): Promise<Invoice> {
  const dto = await apiRequest<ApiInvoice>("/notas-fiscais", {
    method: "POST",
    body: toFormPayload(form),
  });
  return mapInvoice(dto);
}

export async function updateInvoice(id: number, form: InvoiceForm): Promise<Invoice> {
  const dto = await apiRequest<ApiInvoice>(`/notas-fiscais/${id}`, {
    method: "PUT",
    body: toFormPayload(form),
  });
  return mapInvoice(dto);
}

export async function emitInvoice(id: number): Promise<Invoice> {
  const dto = await apiRequest<ApiInvoice>(`/notas-fiscais/${id}/emitir`, {
    method: "POST",
  });
  return mapInvoice(dto);
}

export async function cancelInvoiceApi(id: number): Promise<Invoice> {
  const dto = await apiRequest<ApiInvoice>(`/notas-fiscais/${id}/cancelar`, {
    method: "POST",
  });
  return mapInvoice(dto);
}

export async function patchInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
  const dto = await apiRequest<ApiInvoice>(`/notas-fiscais/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return mapInvoice(dto);
}

export async function duplicateInvoiceApi(id: number): Promise<Invoice> {
  const dto = await apiRequest<ApiInvoice>(`/notas-fiscais/${id}/duplicar`, {
    method: "POST",
  });
  return mapInvoice(dto);
}

export async function importInvoicesApi(payload: unknown): Promise<Invoice[]> {
  const list = await apiRequest<ApiInvoice[]>("/notas-fiscais/importar", {
    method: "POST",
    body: payload,
  });
  return list.map(mapInvoice);
}

export async function exportInvoicesApi(): Promise<string> {
  const token = getToken();
  const response = await fetch(`${getApiBaseUrl()}/notas-fiscais/exportar`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Falha ao exportar notas");
  }
  return response.text();
}

export async function fetchPrestadorConfig(): Promise<Prestador> {
  return apiRequest<Prestador>("/config/prestador");
}

export async function savePrestadorConfig(prestador: Prestador): Promise<Prestador> {
  return apiRequest<Prestador>("/config/prestador", {
    method: "PUT",
    body: prestador,
  });
}
