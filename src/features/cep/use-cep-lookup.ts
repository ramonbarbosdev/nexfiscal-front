import { useCallback } from "react";

import { fetchCep } from "./api";
import type { PartyAddress } from "@/lib/address";
import { ApiError } from "@/lib/api-client";

export function useCepLookup() {
  const lookupCep = useCallback(async (cepDigits: string): Promise<Partial<PartyAddress> | null> => {
    try {
      const result = await fetchCep(cepDigits);
      return {
        logradouro: result.logradouro,
        complemento: result.complemento,
        bairro: result.bairro,
        cidade: result.cidade,
        uf: result.uf,
        cep: result.cep,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }, []);

  return { lookupCep };
}
