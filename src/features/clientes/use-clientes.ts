import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/auth-context";

import { blankAddress } from "@/lib/address";

import { clienteKeys, createCliente, deleteCliente, fetchClientes, updateCliente } from "./api";
import type { Cliente, ClienteForm } from "./types";

const blankForm = (): ClienteForm => ({
  nome: "",
  telefone: "",
  endereco: blankAddress(),
});

export function useClientes() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: clientes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: clienteKeys.all,
    queryFn: fetchClientes,
    enabled: isAuthenticated,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: clienteKeys.all });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async ({ form, editingId }: { form: ClienteForm; editingId: number | null }) => {
      if (editingId !== null) {
        return updateCliente(editingId, form);
      }
      return createCliente(form);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: invalidate,
  });

  const saveCliente = useCallback(
    async (form: ClienteForm, editingId: number | null): Promise<Cliente> => {
      return saveMutation.mutateAsync({ form, editingId });
    },
    [saveMutation],
  );

  const removeCliente = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  return {
    clientes,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm: blankForm,
    cloneFormFromCliente: (cliente: Cliente): ClienteForm => ({
      nome: cliente.nome,
      telefone: cliente.telefone,
      endereco: { ...cliente.endereco },
    }),
    saveCliente,
    removeCliente,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
