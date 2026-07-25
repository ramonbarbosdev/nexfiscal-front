import { apiRequest, type SpringPage } from "@/lib/api-client";

import type { Cliente, ClienteForm } from "./types";

type ApiCliente = {
  id: number;
  nome: string;
  telefone: string;
  createdAt: string;
};

function mapCliente(dto: ApiCliente): Cliente {
  return {
    id: dto.id,
    nome: dto.nome,
    telefone: dto.telefone ?? "",
    createdAt: new Date(dto.createdAt),
  };
}

export const clienteKeys = {
  all: ["clientes"] as const,
};

export async function fetchClientes(): Promise<Cliente[]> {
  const page = await apiRequest<SpringPage<ApiCliente>>("/clientes?size=500&sort=nmCliente,asc");
  return page.content.map(mapCliente);
}

export async function createCliente(form: ClienteForm): Promise<Cliente> {
  const dto = await apiRequest<ApiCliente>("/clientes", { method: "POST", body: form });
  return mapCliente(dto);
}

export async function updateCliente(id: number, form: ClienteForm): Promise<Cliente> {
  const dto = await apiRequest<ApiCliente>(`/clientes/${id}`, { method: "PUT", body: form });
  return mapCliente(dto);
}

export async function deleteCliente(id: number): Promise<void> {
  await apiRequest<void>(`/clientes/${id}`, { method: "DELETE" });
}
