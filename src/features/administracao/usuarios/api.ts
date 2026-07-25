import { apiRequest, type SpringPage } from "@/lib/api-client";

import type { Papel, Usuario, UsuarioForm } from "./types";

type ApiUsuario = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  papeis: string[];
  createdAt: string;
};

type ApiPapel = {
  id: number;
  nome: string;
  descricao: string;
};

function mapUsuario(dto: ApiUsuario): Usuario {
  return {
    id: dto.id,
    nome: dto.nome,
    email: dto.email,
    ativo: dto.ativo,
    papeis: dto.papeis ?? [],
    createdAt: new Date(dto.createdAt),
  };
}

function mapPapel(dto: ApiPapel): Papel {
  return {
    id: dto.id,
    nome: dto.nome,
    descricao: dto.descricao ?? "",
  };
}

export const usuarioKeys = {
  all: ["usuarios"] as const,
  papeis: ["papeis"] as const,
};

export async function fetchUsuarios(): Promise<Usuario[]> {
  const page = await apiRequest<SpringPage<ApiUsuario>>("/usuarios?size=500&sort=nmUsuario,asc");
  return page.content.map(mapUsuario);
}

export async function fetchPapeis(): Promise<Papel[]> {
  const list = await apiRequest<ApiPapel[]>("/papeis");
  return list.map(mapPapel);
}

export async function createUsuario(form: UsuarioForm): Promise<Usuario> {
  const dto = await apiRequest<ApiUsuario>("/usuarios", {
    method: "POST",
    body: toPayload(form, true),
  });
  return mapUsuario(dto);
}

export async function updateUsuario(id: number, form: UsuarioForm): Promise<Usuario> {
  const dto = await apiRequest<ApiUsuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: toPayload(form, false),
  });
  return mapUsuario(dto);
}

export async function deleteUsuario(id: number): Promise<void> {
  await apiRequest<void>(`/usuarios/${id}`, { method: "DELETE" });
}

function toPayload(form: UsuarioForm, isCreate: boolean) {
  const payload: Record<string, unknown> = {
    nome: form.nome.trim(),
    email: form.email.trim(),
    ativo: form.ativo,
    papeis: form.papeis,
  };
  if (isCreate || form.senha.trim()) {
    payload.senha = form.senha.trim();
  }
  return payload;
}
