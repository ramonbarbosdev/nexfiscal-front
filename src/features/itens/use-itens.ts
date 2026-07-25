import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/auth-context";

import { createItem, deleteItem, fetchItens, itemKeys, updateItem } from "./api";
import type { Item, ItemForm } from "./types";

const blankForm = (): ItemForm => ({
  tipo: "servico",
  nome: "",
  descricao: "",
  codigoLc116: "",
  precoPadrao: 0,
  aliquotaIss: 0,
  issRetido: false,
  unidade: "un",
  codigoInterno: "",
  ativo: true,
});

export function useItens() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: itens = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: itemKeys.all,
    queryFn: fetchItens,
    enabled: isAuthenticated,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: itemKeys.all });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async ({ form, editingId }: { form: ItemForm; editingId: number | null }) => {
      if (editingId !== null) {
        return updateItem(editingId, form);
      }
      return createItem(form);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  });

  const saveItem = useCallback(
    async (form: ItemForm, editingId: number | null): Promise<Item> => {
      return saveMutation.mutateAsync({ form, editingId });
    },
    [saveMutation],
  );

  const removeItem = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  return {
    itens,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm: blankForm,
    cloneFormFromItem: (item: Item): ItemForm => ({
      tipo: item.tipo,
      nome: item.nome,
      descricao: item.descricao,
      codigoLc116: item.codigoLc116,
      precoPadrao: item.precoPadrao,
      aliquotaIss: item.aliquotaIss,
      issRetido: item.issRetido,
      unidade: item.unidade,
      codigoInterno: item.codigoInterno,
      ativo: item.ativo,
    }),
    saveItem,
    removeItem,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
