import { apiRequest } from "@/lib/api-client";
import type { PartyAddress } from "@/lib/address";

export type CepLookup = Pick<
  PartyAddress,
  "logradouro" | "complemento" | "bairro" | "cidade" | "uf" | "cep"
>;

export async function fetchCep(cep: string): Promise<CepLookup> {
  const digits = cep.replace(/\D/g, "");
  return apiRequest<CepLookup>(`/cep/${digits}`);
}
