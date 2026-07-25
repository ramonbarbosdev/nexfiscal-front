import { useCallback } from "react";

import { ApiError } from "@/lib/api-client";

import { fetchCnpj, type CnpjLookup } from "./api";

export function useCnpjLookup() {
  const lookupCnpj = useCallback(async (cnpjDigits: string): Promise<CnpjLookup | null> => {
    try {
      return await fetchCnpj(cnpjDigits);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }, []);

  return { lookupCnpj };
}
