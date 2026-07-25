import { apiRequest, type SpringPage } from "@/lib/api-client";

import type { Empresa, EmpresaForm } from "./types";

type ApiEmpresa = {
  id: number;
  logo: string;
  nome: string;
  whatsapp: string;
  instagram: string;
  email: string;
  createdAt: string;
};

function mapEmpresa(dto: ApiEmpresa): Empresa {
  return {
    id: dto.id,
    logo: dto.logo ?? "",
    nome: dto.nome,
    whatsapp: dto.whatsapp ?? "",
    instagram: dto.instagram ?? "",
    email: dto.email ?? "",
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
