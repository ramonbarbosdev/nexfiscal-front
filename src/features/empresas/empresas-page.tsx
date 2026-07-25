import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { ApiQueryState } from "@/components/layout/api-query-state";
import { AppShell } from "@/components/layout/app-shell";
import { AppToast } from "@/components/layout/app-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { useDirtyForm } from "@/hooks/use-dirty-form";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";
import { formatAddressLine } from "@/lib/address";

import { EmpresaDrawer } from "./empresa-drawer";
import type { Empresa, EmpresaForm } from "./types";
import { useEmpresas } from "./use-empresas";

export function EmpresasPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, variant, show: showToast } = useToast();
  const {
    empresas,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm,
    cloneFormFromEmpresa,
    saveEmpresa,
    removeEmpresa,
    isSaving,
    isDeleting,
  } = useEmpresas();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { value: form, setValue: setForm, reset: resetForm } =
    useDirtyForm<EmpresaForm>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.whatsapp.includes(q),
    );
  }, [empresas, search]);

  const editingEmpresa = editingId ? empresas.find((e) => e.id === editingId) ?? null : null;

  const openDrawer = (existing: Empresa | null) => {
    setEditingId(existing?.id ?? null);
    resetForm(existing ? cloneFormFromEmpresa(existing) : createBlankForm());
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await saveEmpresa(form, editingId);
      setDrawerOpen(false);
      showToast(editingId ? "Empresa atualizada" : "Empresa criada");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao salvar empresa", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeEmpresa(id);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        resetForm(null);
      }
      setDeleteId(null);
      showToast("Empresa excluída");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao excluir empresa", "error");
    }
  };

  const empresaToDelete = deleteId ? empresas.find((e) => e.id === deleteId) ?? null : null;

  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={toggleTheme}
      mobileAction={
        <button
          type="button"
          onClick={() => openDrawer(null)}
          className="flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:scale-[.98]"
          aria-label="Nova empresa"
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <ApiQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        loadingLabel="Carregando empresas…"
      >
        <>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
                Minhas empresas
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre empresas para reutilizar nas propostas.
              </p>
            </div>
            <Button className="h-10 shrink-0 px-5 font-semibold" onClick={() => openDrawer(null)}>
              Nova empresa
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-border bg-background pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada ainda."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((empresa) => (
                <div
                  key={empresa.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {empresa.logo ? (
                      <img src={empresa.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {empresa.nome.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{empresa.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {[empresa.whatsapp, empresa.email, formatAddressLine(empresa.endereco)]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDrawer(empresa)} aria-label="Editar empresa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(empresa.id)}
                      aria-label="Excluir empresa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      </ApiQueryState>

      <EmpresaDrawer
        open={drawerOpen}
        editingEmpresa={editingEmpresa}
        form={form}
        onOpenChange={setDrawerOpen}
        onFormChange={setForm}
        onSave={() => void handleSave()}
        onDelete={editingId ? () => void handleDelete(editingId) : undefined}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Excluir empresa?"
        description={`A empresa "${empresaToDelete?.nome ?? ""}" será removida permanentemente do cadastro.`}
        onConfirm={() => {
          if (deleteId !== null) void handleDelete(deleteId);
        }}
        isDeleting={isDeleting}
      />

      <AppToast message={message} variant={variant} />
    </AppShell>
  );
}
