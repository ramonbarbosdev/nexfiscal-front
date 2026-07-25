import { useMemo, useState } from "react";
import { Package, Pencil, Plus, Search, Trash2, Wrench } from "lucide-react";

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
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

import { ItemDrawer } from "./item-drawer";
import type { Item, ItemForm, ItemTipo } from "./types";
import { itemTipoLabel } from "./types";
import { useItens } from "./use-itens";

type TipoFilter = "todos" | ItemTipo;

const TIPO_FILTERS: { value: TipoFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "servico", label: "Serviços" },
  { value: "produto", label: "Produtos" },
];

export function ItensPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, variant, show: showToast } = useToast();
  const {
    itens,
    isLoading,
    isError,
    error,
    refetch,
    createBlankForm,
    cloneFormFromItem,
    saveItem,
    removeItem,
    isSaving,
    isDeleting,
  } = useItens();

  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { value: form, setValue: setForm, reset: resetForm } =
    useDirtyForm<ItemForm>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return itens.filter((item) => {
      if (tipoFilter !== "todos" && item.tipo !== tipoFilter) return false;
      if (!q) return true;
      return (
        item.nome.toLowerCase().includes(q) ||
        item.descricao.toLowerCase().includes(q) ||
        item.codigoInterno.toLowerCase().includes(q)
      );
    });
  }, [itens, search, tipoFilter]);

  const editingItem = editingId ? itens.find((i) => i.id === editingId) ?? null : null;

  const openDrawer = (existing: Item | null) => {
    setEditingId(existing?.id ?? null);
    resetForm(existing ? cloneFormFromItem(existing) : createBlankForm());
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await saveItem(form, editingId);
      setDrawerOpen(false);
      showToast(editingId ? "Item atualizado" : "Item criado");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao salvar item", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeItem(id);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        resetForm(null);
      }
      setDeleteId(null);
      showToast("Item excluído");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao excluir item", "error");
    }
  };

  const itemToDelete = deleteId ? itens.find((i) => i.id === deleteId) ?? null : null;

  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={toggleTheme}
      mobileAction={
        <button
          type="button"
          onClick={() => openDrawer(null)}
          className="flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:scale-[.98]"
          aria-label="Novo item"
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
        loadingLabel="Carregando itens…"
      >
        <>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
                Itens
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre produtos e serviços para reutilizar em propostas e notas fiscais.
              </p>
            </div>
            <Button className="h-10 shrink-0 px-5 font-semibold" onClick={() => openDrawer(null)}>
              Novo item
            </Button>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-background pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {TIPO_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setTipoFilter(filter.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition",
                    tipoFilter === filter.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search || tipoFilter !== "todos"
                  ? "Nenhum item encontrado."
                  : "Nenhum item cadastrado ainda."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3",
                    !item.ativo && "opacity-60",
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    {item.tipo === "servico" ? (
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{item.nome}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                        {itemTipoLabel(item.tipo)}
                      </span>
                      {!item.ativo ? (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                          Inativo
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {[item.codigoInterno, item.descricao, formatBRL(item.precoPadrao)]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDrawer(item)} aria-label="Editar item">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(item.id)}
                      aria-label="Excluir item"
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

      <ItemDrawer
        open={drawerOpen}
        editingItem={editingItem}
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
        title="Excluir item?"
        description={`O item "${itemToDelete?.nome ?? ""}" será removido permanentemente do catálogo.`}
        onConfirm={() => {
          if (deleteId !== null) void handleDelete(deleteId);
        }}
        isDeleting={isDeleting}
      />

      <AppToast message={message} variant={variant} />
    </AppShell>
  );
}
