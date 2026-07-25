import { apiRequest, type SpringPage } from "@/lib/api-client";

import type { Item, ItemForm } from "./types";

type ApiItem = {
  id: number;
  tipo: Item["tipo"];
  nome: string;
  descricao: string;
  codigoLc116: string;
  precoPadrao: number;
  aliquotaIss: number;
  issRetido: boolean;
  unidade: string;
  codigoInterno: string;
  ativo: boolean;
  createdAt: string;
};

function mapItem(dto: ApiItem): Item {
  return {
    id: dto.id,
    tipo: dto.tipo,
    nome: dto.nome,
    descricao: dto.descricao ?? "",
    codigoLc116: dto.codigoLc116 ?? "",
    precoPadrao: Number(dto.precoPadrao) || 0,
    aliquotaIss: Number(dto.aliquotaIss) || 0,
    issRetido: dto.issRetido ?? false,
    unidade: dto.unidade ?? "un",
    codigoInterno: dto.codigoInterno ?? "",
    ativo: dto.ativo ?? true,
    createdAt: new Date(dto.createdAt),
  };
}

export const itemKeys = {
  all: ["itens"] as const,
};

export async function fetchItens(): Promise<Item[]> {
  const page = await apiRequest<SpringPage<ApiItem>>("/itens?size=500&sort=nmItem,asc");
  return page.content.map(mapItem);
}

export async function createItem(form: ItemForm): Promise<Item> {
  const dto = await apiRequest<ApiItem>("/itens", { method: "POST", body: form });
  return mapItem(dto);
}

export async function updateItem(id: number, form: ItemForm): Promise<Item> {
  const dto = await apiRequest<ApiItem>(`/itens/${id}`, { method: "PUT", body: form });
  return mapItem(dto);
}

export async function deleteItem(id: number): Promise<void> {
  await apiRequest<void>(`/itens/${id}`, { method: "DELETE" });
}
