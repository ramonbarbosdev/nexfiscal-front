import { apiRequest, type SpringPage } from "@/lib/api-client";
import { blankAddress } from "@/lib/address";
import type { PartyAddress } from "@/lib/address";

import type { Empresa, EmpresaForm } from "./types";

type ApiPartyAddress = PartyAddress;

type ApiEmpresa = {
  id: number;
  logo: string;
  nome: string;
  cnpj: string;
  whatsapp: string;
  instagram: string;
  email: string;
  endereco: ApiPartyAddress | null;
  createdAt: string;
};

function mapAddress(dto: ApiPartyAddress | null | undefined): PartyAddress {
  if (!dto) return blankAddress();
  return {
    logradouro: dto.logradouro ?? "",
    numero: dto.numero ?? "",
    complemento: dto.complemento ?? "",
    bairro: dto.bairro ?? "",
    cidade: dto.cidade ?? "",
    uf: dto.uf ?? "",
    cep: dto.cep ?? "",
  };
}

function mapEmpresa(dto: ApiEmpresa): Empresa {
  return {
    id: dto.id,
    logo: dto.logo ?? "",
    nome: dto.nome,
    cnpj: dto.cnpj ?? "",
    whatsapp: dto.whatsapp ?? "",
    instagram: dto.instagram ?? "",
    email: dto.email ?? "",
    endereco: mapAddress(dto.endereco),
    createdAt: new Date(dto.createdAt),
  };
}

export const empresaKeys = {
  all: ["empresas"] as const,
};

export async function fetchEmpresas(): Promise<Empresa[]> {
  const page = await apiRequest<SpringPage<ApiEmpresa>>("/empresas?size=500&sort=nmEmpresa,asc");
  return page.content.map(mapEmpresa);
}

export async function createEmpresa(form: EmpresaForm): Promise<Empresa> {
  const dto = await apiRequest<ApiEmpresa>("/empresas", { method: "POST", body: form });
  return mapEmpresa(dto);
}

export async function updateEmpresa(id: number, form: EmpresaForm): Promise<Empresa> {
  const dto = await apiRequest<ApiEmpresa>(`/empresas/${id}`, { method: "PUT", body: form });
  return mapEmpresa(dto);
}

export async function deleteEmpresa(id: number): Promise<void> {
  await apiRequest<void>(`/empresas/${id}`, { method: "DELETE" });
}
