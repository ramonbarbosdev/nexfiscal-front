import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/auth-context";
import { hasPermission } from "@/features/auth/permissions";

import {
  createUsuario,
  deleteUsuario,
  fetchPapeis,
  fetchUsuarios,
  updateUsuario,
  usuarioKeys,
} from "./api";
import type { Usuario, UsuarioForm } from "./types";

const blankForm = (): UsuarioForm => ({
  nome: "",
  email: "",
  senha: "",
  ativo: true,
  papeis: [],
});

export function useUsuarios() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const canView = hasPermission(user, "USER_VIEW");

  const {
    data: usuarios = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: usuarioKeys.all,
    queryFn: fetchUsuarios,
    enabled: isAuthenticated && canView,
  });

  const { data: papeis = [] } = useQuery({
    queryKey: usuarioKeys.papeis,
    queryFn: fetchPapeis,
    enabled: isAuthenticated && canView,
  });

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: usuarioKeys.all });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async ({ form, editingId }: { form: UsuarioForm; editingId: number | null }) => {
      if (editingId !== null) {
        return updateUsuario(editingId, form);
      }
      return createUsuario(form);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: invalidate,
  });

  const saveUsuario = useCallback(
    async (form: UsuarioForm, editingId: number | null): Promise<Usuario> => {
      return saveMutation.mutateAsync({ form, editingId });
    },
    [saveMutation],
  );

  const removeUsuario = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  return {
    usuarios,
    papeis,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm: blankForm,
    cloneFormFromUsuario: (usuario: Usuario): UsuarioForm => ({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      ativo: usuario.ativo,
      papeis: [...usuario.papeis],
    }),
    saveUsuario,
    removeUsuario,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    canCreate: hasPermission(user, "USER_CREATE"),
    canEdit: hasPermission(user, "USER_EDIT"),
    canDelete: hasPermission(user, "USER_DELETE"),
  };
}
