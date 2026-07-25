import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { ApiQueryState } from "@/components/layout/api-query-state";
import { AppShell } from "@/components/layout/app-shell";
import { AppToast } from "@/components/layout/app-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";
import { formatAddressLine } from "@/lib/address";

import { ClienteDrawer } from "./cliente-drawer";
import type { Cliente, ClienteForm } from "./types";
import { useClientes } from "./use-clientes";

export function ClientesPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, variant, show: showToast } = useToast();
  const {
    clientes,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm,
    cloneFormFromCliente,
    saveCliente,
    removeCliente,
    isSaving,
    isDeleting,
  } = useClientes();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteForm | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(q) || c.telefone.includes(q),
    );
  }, [clientes, search]);

  const editingCliente = editingId ? clientes.find((c) => c.id === editingId) ?? null : null;

  const openDrawer = (existing: Cliente | null) => {
    setEditingId(existing?.id ?? null);
    setForm(existing ? cloneFormFromCliente(existing) : createBlankForm());
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await saveCliente(form, editingId);
      setDrawerOpen(false);
      showToast(editingId ? "Cliente atualizado" : "Cliente criado");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao salvar cliente", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeCliente(id);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(null);
      }
      setDeleteId(null);
      showToast("Cliente excluído");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao excluir cliente", "error");
    }
  };

  const clienteToDelete = deleteId ? clientes.find((c) => c.id === deleteId) ?? null : null;

  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={toggleTheme}
      mobileAction={
        <button
          type="button"
          onClick={() => openDrawer(null)}
          className="flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:scale-[.98]"
          aria-label="Novo cliente"
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
        loadingLabel="Carregando clientes…"
      >
        <>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
                Clientes
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre clientes para reutilizar nas propostas.
              </p>
            </div>
            <Button className="h-10 shrink-0 px-5 font-semibold" onClick={() => openDrawer(null)}>
              Novo cliente
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-border bg-background pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {cliente.nome.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{cliente.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {[cliente.telefone, formatAddressLine(cliente.endereco)]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDrawer(cliente)} aria-label="Editar cliente">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(cliente.id)}
                      aria-label="Excluir cliente"
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

      <ClienteDrawer
        open={drawerOpen}
        editingCliente={editingCliente}
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
        title="Excluir cliente?"
        description={`O cliente "${clienteToDelete?.nome ?? ""}" será removido permanentemente do cadastro.`}
        onConfirm={() => {
          if (deleteId !== null) void handleDelete(deleteId);
        }}
        isDeleting={isDeleting}
      />

      <AppToast message={message} variant={variant} />
    </AppShell>
  );
}
