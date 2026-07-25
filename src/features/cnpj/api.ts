import { apiRequest } from "@/lib/api-client";
import type { PartyAddress } from "@/lib/address";

export type CnpjLookup = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: Pick<
    PartyAddress,
    "logradouro" | "numero" | "complemento" | "bairro" | "cidade" | "uf" | "cep"
  >;
};

type ApiCnpjLookup = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
};

export async function fetchCnpj(cnpj: string): Promise<CnpjLookup> {
  const digits = cnpj.replace(/\D/g, "");
  const dto = await apiRequest<ApiCnpjLookup>(`/cnpj/${digits}`);
  return {
    razaoSocial: dto.razaoSocial ?? "",
    nomeFantasia: dto.nomeFantasia ?? "",
    cnpj: dto.cnpj ?? "",
    email: dto.email ?? "",
    telefone: dto.telefone ?? "",
    endereco: {
      logradouro: dto.endereco?.logradouro ?? "",
      numero: dto.endereco?.numero ?? "",
      complemento: dto.endereco?.complemento ?? "",
      bairro: dto.endereco?.bairro ?? "",
      cidade: dto.endereco?.cidade ?? "",
      uf: dto.endereco?.uf ?? "",
      cep: dto.endereco?.cep ?? "",
    },
  };
}
