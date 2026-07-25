import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { ApiQueryState } from "@/components/layout/api-query-state";
import { AppShell } from "@/components/layout/app-shell";
import { AppToast } from "@/components/layout/app-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { useDirtyForm } from "@/hooks/use-dirty-form";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";

import type { Usuario, UsuarioForm } from "./types";
import { UsuarioDrawer } from "./usuario-drawer";
import { useUsuarios } from "./use-usuarios";

export function UsuariosPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, variant, show: showToast } = useToast();
  const {
    usuarios,
    papeis,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm,
    cloneFormFromUsuario,
    saveUsuario,
    removeUsuario,
    isSaving,
    isDeleting,
    canCreate,
    canEdit,
    canDelete,
  } = useUsuarios();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { value: form, setValue: setForm, reset: resetForm } = useDirtyForm<UsuarioForm>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.papeis.some((p) => p.toLowerCase().includes(q)),
    );
  }, [usuarios, search]);

  const editingUsuario = editingId ? usuarios.find((u) => u.id === editingId) ?? null : null;

  const openDrawer = (existing: Usuario | null) => {
    if (existing && !canEdit) return;
    if (!existing && !canCreate) return;
    setEditingId(existing?.id ?? null);
    resetForm(existing ? cloneFormFromUsuario(existing) : createBlankForm());
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await saveUsuario(form, editingId);
      setDrawerOpen(false);
      showToast(editingId ? "Usuário atualizado" : "Usuário criado");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao salvar usuário", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeUsuario(id);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        resetForm(null);
      }
      setDeleteId(null);
      showToast("Usuário desativado");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao desativar usuário", "error");
    }
  };

  const usuarioToDelete = deleteId ? usuarios.find((u) => u.id === deleteId) ?? null : null;

  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={toggleTheme}
      mobileAction={
        canCreate ? (
          <button
            type="button"
            onClick={() => openDrawer(null)}
            className="flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:scale-[.98]"
            aria-label="Novo usuário"
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : undefined
      }
    >
      <ApiQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        loadingLabel="Carregando usuários…"
      >
        <>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
                Administração
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie usuários e perfis de acesso ao sistema.
              </p>
            </div>
            {canCreate ? (
              <Button className="h-10 shrink-0 px-5 font-semibold" onClick={() => openDrawer(null)}>
                Novo usuário
              </Button>
            ) : null}
          </div>

          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-border bg-background pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado ainda."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {usuario.nome.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{usuario.nome}</p>
                      {!usuario.ativo ? <Badge variant="secondary">Inativo</Badge> : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{usuario.email}</p>
                    {usuario.papeis.length > 0 ? (
                      <p className="truncate text-xs text-muted-foreground">{usuario.papeis.join(" · ")}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEdit ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDrawer(usuario)}
                        aria-label="Editar usuário"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(usuario.id)}
                        aria-label="Desativar usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      </ApiQueryState>

      <UsuarioDrawer
        open={drawerOpen}
        editingUsuario={editingUsuario}
        form={form}
        papeis={papeis}
        onOpenChange={setDrawerOpen}
        onFormChange={setForm}
        onSave={() => void handleSave()}
        onDelete={editingId && canDelete ? () => void handleDelete(editingId) : undefined}
        isSaving={isSaving}
        isDeleting={isDeleting}
        canDelete={canDelete}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Desativar usuário?"
        description={`O usuário "${usuarioToDelete?.nome ?? ""}" será desativado e não poderá mais acessar o sistema.`}
        onConfirm={() => {
          if (deleteId !== null) void handleDelete(deleteId);
        }}
        isDeleting={isDeleting}
        confirmLabel="Desativar"
      />

      <AppToast message={message} variant={variant} />
    </AppShell>
  );
}
