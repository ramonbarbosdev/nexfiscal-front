import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/auth-context";

import { blankAddress } from "@/lib/address";

import { createEmpresa, deleteEmpresa, empresaKeys, fetchEmpresas, updateEmpresa } from "./api";
import type { Empresa, EmpresaForm } from "./types";

const blankForm = (): EmpresaForm => ({
  logo: "",
  nome: "",
  cnpj: "",
  whatsapp: "",
  instagram: "",
  email: "",
  endereco: blankAddress(),
});

export function useEmpresas() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: empresas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: empresaKeys.all,
    queryFn: fetchEmpresas,
    enabled: isAuthenticated,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: empresaKeys.all });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async ({ form, editingId }: { form: EmpresaForm; editingId: number | null }) => {
      if (editingId !== null) {
        return updateEmpresa(editingId, form);
      }
      return createEmpresa(form);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmpresa,
    onSuccess: invalidate,
  });

  const saveEmpresa = useCallback(
    async (form: EmpresaForm, editingId: number | null): Promise<Empresa> => {
      return saveMutation.mutateAsync({ form, editingId });
    },
    [saveMutation],
  );

  const removeEmpresa = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  return {
    empresas,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm: blankForm,
    cloneFormFromEmpresa: (empresa: Empresa): EmpresaForm => ({
      logo: empresa.logo,
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      whatsapp: empresa.whatsapp,
      instagram: empresa.instagram,
      email: empresa.email,
      endereco: { ...empresa.endereco },
    }),
    saveEmpresa,
    removeEmpresa,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
