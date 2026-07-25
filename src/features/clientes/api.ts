import { apiRequest, type SpringPage } from "@/lib/api-client";
import { blankAddress } from "@/lib/address";
import type { PartyAddress } from "@/lib/address";

import type { Cliente, ClienteForm } from "./types";

type ApiPartyAddress = PartyAddress;

type ApiCliente = {
  id: number;
  nome: string;
  tipo: string;
  cpfCnpj: string;
  telefone: string;
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

function mapCliente(dto: ApiCliente): Cliente {
  return {
    id: dto.id,
    nome: dto.nome,
    tipo: dto.tipo === "pj" ? "pj" : "pf",
    cpfCnpj: dto.cpfCnpj ?? "",
    telefone: dto.telefone ?? "",
    endereco: mapAddress(dto.endereco),
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
