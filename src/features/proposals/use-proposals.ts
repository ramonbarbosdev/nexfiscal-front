import { useCallback, useEffect, useRef, useState } from "react";

import type { Counters, Proposal, ProposalForm, ProposalStatus } from "./types";

const STORAGE_KEYS = ["nexfiscal:proposals:v1", "rp:proposals:v1"] as const;

function blankForm(itemId: number): ProposalForm {
  return {
    empresa: { logo: "", nome: "", whatsapp: "", instagram: "", email: "" },
    cliente: { nome: "", telefone: "" },
    projeto: { titulo: "", descricao: "", area: "", prazo: "", validade: "" },
    itens: [{ id: itemId, desc: "", qtd: 1, valor: 0 }],
    desconto: 0,
    entrada: 0,
    formaPagamento: "",
    observacoes: "",
  };
}

function deriveCounters(proposals: Proposal[]): Counters {
  const idCounter = Math.max(0, ...proposals.map((p) => p.id || 0)) + 1;
  const nums = proposals.map((p) => parseInt(String(p.numero || "").split("-")[1]) || 0);
  const seq = Math.max(0, ...nums) + 1;
  const itemIdCounter =
    Math.max(0, ...proposals.flatMap((p) => (p.itens || []).map((i) => i.id || 0))) + 1;
  return { idCounter, seq, itemIdCounter };
}

function parseStored(raw: string): Proposal[] | null {
  try {
    const saved = JSON.parse(raw) as Proposal[];
    if (!Array.isArray(saved)) return null;
    return saved.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
  } catch {
    return null;
  }
}

function loadFromStorage(): { proposals: Proposal[]; counters: Counters } | null {
  if (typeof window === "undefined") return null;

  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    const proposals = parseStored(raw);
    if (proposals) {
      return { proposals, counters: deriveCounters(proposals) };
    }
  }
  return null;
}

function initState() {
  const stored = loadFromStorage();
  if (stored) return stored;
  return { proposals: [], counters: { idCounter: 1, seq: 1, itemIdCounter: 1 } };
}

export function useProposals() {
  const [{ proposals, counters }, setState] = useState(initState);
  const countersRef = useRef(counters);
  countersRef.current = counters;

  const save = useCallback((next: Proposal[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS[0], JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => save(proposals), 1200);
    const onUnload = () => save(proposals);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [proposals, save]);

  const updateProposals = useCallback((updater: (prev: Proposal[]) => Proposal[]) => {
    setState((prev) => {
      const nextProposals = updater(prev.proposals);
      return { proposals: nextProposals, counters: deriveCounters(nextProposals) };
    });
  }, []);

  const changeStatus = useCallback(
    (id: number, status: ProposalStatus) => {
      updateProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    },
    [updateProposals],
  );

  const createBlankForm = useCallback(() => {
    const itemId = countersRef.current.itemIdCounter;
    setState((prev) => ({
      ...prev,
      counters: { ...prev.counters, itemIdCounter: itemId + 1 },
    }));
    return blankForm(itemId);
  }, []);

  const cloneFormFromProposal = useCallback((proposal: Proposal): ProposalForm => {
    const form = JSON.parse(JSON.stringify(proposal)) as ProposalForm;
    form.itens.forEach((item) => {
      if (!item.id) item.id = countersRef.current.itemIdCounter++;
    });
    return form;
  }, []);

  const saveProposal = useCallback(
    (form: ProposalForm, editingId: number | null): Proposal => {
      let saved: Proposal;

      if (editingId !== null) {
        updateProposals((prev) => {
          const idx = prev.findIndex((p) => p.id === editingId);
          if (idx === -1) return prev;
          saved = { ...prev[idx], ...form, id: editingId };
          const next = [...prev];
          next[idx] = saved;
          return next;
        });
        return saved!;
      }

      const { idCounter, seq } = countersRef.current;
      const newProposal: Proposal = {
        id: idCounter,
        numero: `${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`,
        status: "pendente",
        createdAt: new Date(),
        ...JSON.parse(JSON.stringify(form)),
      };

      setState((prev) => ({
        proposals: [...prev.proposals, newProposal],
        counters: {
          idCounter: idCounter + 1,
          seq: seq + 1,
          itemIdCounter: prev.counters.itemIdCounter,
        },
      }));

      return newProposal;
    },
    [updateProposals],
  );

  const duplicateProposal = useCallback(
    (id: number) => {
      const source = proposals.find((p) => p.id === id);
      if (!source) return;

      const { idCounter, seq, itemIdCounter } = countersRef.current;
      const copy: Proposal = JSON.parse(JSON.stringify(source));
      copy.id = idCounter;
      copy.numero = `${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
      copy.status = "pendente";
      copy.createdAt = new Date();

      let nextItemId = itemIdCounter;
      copy.itens = copy.itens.map((item) => ({ ...item, id: nextItemId++ }));

      setState((prev) => ({
        proposals: [...prev.proposals, copy],
        counters: {
          idCounter: idCounter + 1,
          seq: seq + 1,
          itemIdCounter: nextItemId,
        },
      }));
    },
    [proposals],
  );

  const nextItemId = useCallback(() => {
    const id = countersRef.current.itemIdCounter;
    setState((prev) => ({
      ...prev,
      counters: { ...prev.counters, itemIdCounter: id + 1 },
    }));
    return id;
  }, []);

  return {
    proposals,
    changeStatus,
    createBlankForm,
    cloneFormFromProposal,
    saveProposal,
    duplicateProposal,
    nextItemId,
  };
}
