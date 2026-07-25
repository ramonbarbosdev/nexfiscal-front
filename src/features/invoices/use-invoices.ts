import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/auth-context";

import {
  cancelInvoiceApi,
  createInvoice,
  deleteInvoice,
  duplicateInvoiceApi,
  emitInvoice,
  exportInvoicesApi,
  fetchInvoices,
  fetchPrestadorConfig,
  importInvoicesApi,
  invoiceKeys,
  patchInvoiceStatus,
  savePrestadorConfig,
  updateInvoice,
} from "./api";
import type { InvoiceImportItem } from "./import";
import { blankAddress } from "./utils";
import type { Invoice, InvoiceForm, InvoiceStatus } from "./types";

function blankForm(prestador: InvoiceForm["prestador"]): InvoiceForm {
  return {
    prestador,
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

export function useInvoices() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: invoices = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: invoiceKeys.all,
    queryFn: fetchInvoices,
    enabled: isAuthenticated,
  });

  const {
    data: prestadorDefaults,
    isLoading: isPrestadorLoading,
    isError: isPrestadorError,
    error: prestadorError,
    refetch: refetchPrestador,
  } = useQuery({
    queryKey: invoiceKeys.prestador,
    queryFn: fetchPrestadorConfig,
    enabled: isAuthenticated,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
  }, [queryClient]);

  const changeStatus = useCallback(
    async (id: number, status: InvoiceStatus) => {
      await patchInvoiceStatus(id, status);
      await invalidate();
    },
    [invalidate],
  );

  const createBlankForm = useCallback(() => {
    if (!prestadorDefaults) {
      throw new Error("Configuração do prestador ainda não carregada");
    }
    return blankForm(prestadorDefaults);
  }, [prestadorDefaults]);

  const cloneFormFromInvoice = useCallback((invoice: Invoice): InvoiceForm => {
    return JSON.parse(JSON.stringify(invoice)) as InvoiceForm;
  }, []);

  const saveMutation = useMutation({
    mutationFn: async ({
      form,
      editingId,
      emit,
    }: {
      form: InvoiceForm;
      editingId: number | null;
      emit: boolean;
    }) => {
      await savePrestadorConfig(form.prestador);
      queryClient.setQueryData(invoiceKeys.prestador, form.prestador);

      let saved: Invoice;
      if (editingId !== null) {
        saved = await updateInvoice(editingId, form);
        if (emit) {
          saved = await emitInvoice(editingId);
        }
      } else {
        saved = await createInvoice(form);
        if (emit) {
          saved = await emitInvoice(saved.id);
        }
      }
      return saved;
    },
    onSuccess: invalidate,
  });

  const saveInvoice = useCallback(
    async (form: InvoiceForm, editingId: number | null, emit: boolean): Promise<Invoice> => {
      return saveMutation.mutateAsync({ form, editingId, emit });
    },
    [saveMutation],
  );

  const cancelInvoice = useCallback(
    async (id: number) => {
      await cancelInvoiceApi(id);
      await invalidate();
    },
    [invalidate],
  );

  const duplicateInvoice = useCallback(
    async (id: number) => {
      await duplicateInvoiceApi(id);
      await invalidate();
    },
    [invalidate],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: invalidate,
  });

  const removeInvoice = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const importInvoices = useCallback(
    async (items: InvoiceImportItem[]) => {
      if (items.length === 0) {
        return { imported: 0, skipped: [] as string[] };
      }

      const imported = await importInvoicesApi({ invoices: items });
      await invalidate();

      return { imported: imported.length, skipped: [] as string[] };
    },
    [invalidate],
  );

  const exportInvoices = useCallback(async () => {
    return exportInvoicesApi();
  }, []);

  return {
    invoices,
    isLoading: isLoading || isPrestadorLoading,
    isError: isError || isPrestadorError,
    error: (error ?? prestadorError) as Error | null,
    refetch: async () => {
      await Promise.all([refetch(), refetchPrestador()]);
    },
    isPrestadorReady: Boolean(prestadorDefaults),
    changeStatus,
    createBlankForm,
    cloneFormFromInvoice,
    saveInvoice,
    cancelInvoice,
    duplicateInvoice,
    removeInvoice,
    isDeleting: deleteMutation.isPending,
    importInvoices,
    exportInvoices,
  };
}
