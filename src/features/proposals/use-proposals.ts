import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import { useAuth } from "@/features/auth/auth-context";

import {
  createProposal,
  duplicateProposalApi,
  fetchProposals,
  patchProposalStatus,
  proposalKeys,
  updateProposal,
} from "./api";
import type { Proposal, ProposalForm, ProposalStatus } from "./types";

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

export function useProposals() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const itemIdCounter = useRef(1);

  const {
    data: proposals = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: proposalKeys.all,
    queryFn: fetchProposals,
    enabled: isAuthenticated,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: proposalKeys.all });
  }, [queryClient]);

  const changeStatus = useCallback(
    async (id: number, status: ProposalStatus) => {
      await patchProposalStatus(id, status);
      await invalidate();
    },
    [invalidate],
  );

  const createBlankForm = useCallback(() => {
    const id = itemIdCounter.current++;
    return blankForm(id);
  }, []);

  const cloneFormFromProposal = useCallback((proposal: Proposal): ProposalForm => {
    const form = JSON.parse(JSON.stringify(proposal)) as ProposalForm;
    form.itens.forEach((item) => {
      if (!item.id) item.id = itemIdCounter.current++;
    });
    return form;
  }, []);

  const saveMutation = useMutation({
    mutationFn: async ({ form, editingId }: { form: ProposalForm; editingId: number | null }) => {
      if (editingId !== null) {
        return updateProposal(editingId, form);
      }
      return createProposal(form);
    },
    onSuccess: invalidate,
  });

  const saveProposal = useCallback(
    async (form: ProposalForm, editingId: number | null): Promise<Proposal> => {
      return saveMutation.mutateAsync({ form, editingId });
    },
    [saveMutation],
  );

  const duplicateProposal = useCallback(
    async (id: number) => {
      await duplicateProposalApi(id);
      await invalidate();
    },
    [invalidate],
  );

  const nextItemId = useCallback(() => itemIdCounter.current++, []);

  return {
    proposals,
    isLoading,
    isError,
    error,
    refetch,
    changeStatus,
    createBlankForm,
    cloneFormFromProposal,
    saveProposal,
    duplicateProposal,
    nextItemId,
  };
}
