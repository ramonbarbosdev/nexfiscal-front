import { useEffect, useRef, useState } from "react";

import { onlyDigits } from "@/lib/format";

import type { CnpjLookup } from "./api";
import { useCnpjLookup } from "./use-cnpj-lookup";

export function useCnpjAutoFill(
  cnpj: string,
  onResult: (data: CnpjLookup) => void,
  onError?: (message: string) => void,
) {
  const { lookupCnpj } = useCnpjLookup();
  const [loading, setLoading] = useState(false);
  const lastLookupRef = useRef("");
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  useEffect(() => {
    const digits = onlyDigits(cnpj);
    if (digits.length !== 14 || digits === lastLookupRef.current) return;

    const timer = window.setTimeout(() => {
      lastLookupRef.current = digits;
      setLoading(true);
      void lookupCnpj(digits)
        .then((result) => {
          if (!result) {
            onErrorRef.current?.("CNPJ não encontrado");
            return;
          }
          onResultRef.current(result);
        })
        .catch(() => {
          onErrorRef.current?.("Não foi possível consultar o CNPJ");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [cnpj, lookupCnpj]);

  const resetLookup = () => {
    lastLookupRef.current = "";
  };

  const markLookupDone = (cnpjValue: string) => {
    lastLookupRef.current = onlyDigits(cnpjValue);
  };

  return { loading, resetLookup, markLookupDone };
}
