import { useCallback, useEffect, useRef, useState } from "react";

import type { Counters, Invoice, InvoiceForm, InvoiceStatus, Prestador } from "./types";
import { buildInvoicesFromImport, type InvoiceImportItem } from "./import";
import { blankAddress, blankPrestador, generateVerificationCode } from "./utils";

const STORAGE_KEY = "nexfiscal:invoices:v1";
const PRESTADOR_KEY = "nexfiscal:prestador:v1";

function loadPrestadorDefaults(): Prestador {
  if (typeof window === "undefined") return blankPrestador();
  try {
    const raw = localStorage.getItem(PRESTADOR_KEY);
    if (raw) return JSON.parse(raw) as Prestador;
  } catch {
    // ignore
  }
  return blankPrestador();
}

function savePrestadorDefaults(prestador: Prestador) {
  try {
    localStorage.setItem(PRESTADOR_KEY, JSON.stringify(prestador));
  } catch {
    // ignore
  }
}

function blankForm(): InvoiceForm {
  return {
    prestador: loadPrestadorDefaults(),
    tomador: {
      tipo: "pj",
      nome: "",
      cpfCnpj: "",
      email: "",
      telefone: "",
      inscricaoMunicipal: "",
      endereco: blankAddress(),
    },
    servico: {
      codigoLc116: "17.01",
      descricao: "",
      discriminacao: "",
      valorServico: 0,
      aliquotaIss: 5,
      issRetido: false,
      valorDeducoes: 0,
      descontoIncondicionado: 0,
      descontoCondicionado: 0,
    },
    observacoes: "",
  };
}

function deriveCounters(invoices: Invoice[]): Counters {
  const idCounter = Math.max(0, ...invoices.map((i) => i.id || 0)) + 1;
  const nums = invoices.map((i) => parseInt(i.numero, 10) || 0);
  const seq = Math.max(0, ...nums) + 1;
  return { idCounter, seq };
}

function loadFromStorage(): { invoices: Invoice[]; counters: Counters } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Invoice[];
    if (!Array.isArray(saved)) return null;
    const invoices = saved.map((i) => ({ ...i, dataEmissao: new Date(i.dataEmissao) }));
    return { invoices, counters: deriveCounters(invoices) };
  } catch {
    return null;
  }
}

function initState() {
  const stored = loadFromStorage();
  if (stored) return stored;
  return { invoices: [], counters: { idCounter: 1, seq: 1 } };
}

export function useInvoices() {
  const [{ invoices, counters }, setState] = useState(initState);
  const countersRef = useRef(counters);
  countersRef.current = counters;

  const save = useCallback((next: Invoice[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => save(invoices), 1200);
    const onUnload = () => save(invoices);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [invoices, save]);

  const updateInvoices = useCallback((updater: (prev: Invoice[]) => Invoice[]) => {
    setState((prev) => {
      const nextInvoices = updater(prev.invoices);
      return { invoices: nextInvoices, counters: deriveCounters(nextInvoices) };
    });
  }, []);

  const changeStatus = useCallback(
    (id: number, status: InvoiceStatus) => {
      updateInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                status,
                codigoVerificacao:
                  status === "emitida" && !inv.codigoVerificacao
                    ? generateVerificationCode()
                    : inv.codigoVerificacao,
              }
            : inv,
        ),
      );
    },
    [updateInvoices],
  );

  const createBlankForm = useCallback(() => blankForm(), []);

  const cloneFormFromInvoice = useCallback((invoice: Invoice): InvoiceForm => {
    return JSON.parse(JSON.stringify(invoice)) as InvoiceForm;
  }, []);

  const saveInvoice = useCallback(
    (form: InvoiceForm, editingId: number | null, emit: boolean): Invoice => {
      savePrestadorDefaults(form.prestador);

      if (editingId !== null) {
        let saved!: Invoice;
        updateInvoices((prev) => {
          const idx = prev.findIndex((i) => i.id === editingId);
          if (idx === -1) return prev;
          const current = prev[idx];
          saved = {
            ...current,
            ...form,
            id: editingId,
            status: emit ? "emitida" : current.status === "emitida" ? "emitida" : "rascunho",
            codigoVerificacao: emit
              ? current.codigoVerificacao ?? generateVerificationCode()
              : current.codigoVerificacao,
            dataEmissao: emit ? new Date() : current.dataEmissao,
          };
          const next = [...prev];
          next[idx] = saved;
          return next;
        });
        return saved!;
      }

      const { idCounter, seq } = countersRef.current;
      const newInvoice: Invoice = {
        id: idCounter,
        numero: String(seq).padStart(6, "0"),
        serie: "1",
        status: emit ? "emitida" : "rascunho",
        dataEmissao: new Date(),
        codigoVerificacao: emit ? generateVerificationCode() : null,
        ...JSON.parse(JSON.stringify(form)),
      };

      setState((prev) => ({
        invoices: [...prev.invoices, newInvoice],
        counters: { idCounter: idCounter + 1, seq: seq + 1 },
      }));

      return newInvoice;
    },
    [updateInvoices],
  );

  const cancelInvoice = useCallback(
    (id: number) => {
      changeStatus(id, "cancelada");
    },
    [changeStatus],
  );

  const duplicateInvoice = useCallback(
    (id: number) => {
      const source = invoices.find((i) => i.id === id);
      if (!source) return;

      const { idCounter, seq } = countersRef.current;
      const copy: Invoice = {
        ...JSON.parse(JSON.stringify(source)),
        id: idCounter,
        numero: String(seq).padStart(6, "0"),
        status: "rascunho",
        dataEmissao: new Date(),
        codigoVerificacao: null,
      };

      setState((prev) => ({
        invoices: [...prev.invoices, copy],
        counters: { idCounter: idCounter + 1, seq: seq + 1 },
      }));
    },
    [invoices],
  );

  const importInvoices = useCallback(
    (items: InvoiceImportItem[]) => {
      const { invoices: imported, skipped, counters } = buildInvoicesFromImport(
        items,
        invoices,
        countersRef.current,
      );

      if (imported.length > 0) {
        setState((prev) => ({
          invoices: [...prev.invoices, ...imported],
          counters,
        }));
      }

      return { imported: imported.length, skipped };
    },
    [invoices],
  );

  return {
    invoices,
    changeStatus,
    createBlankForm,
    cloneFormFromInvoice,
    saveInvoice,
    cancelInvoice,
    duplicateInvoice,
    importInvoices,
  };
}
