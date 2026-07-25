import { useState } from "react";
import { Plus, Upload } from "lucide-react";

import { ListToolbar } from "@/components/list/list-toolbar";
import { ApiQueryState } from "@/components/layout/api-query-state";
import { AppShell } from "@/components/layout/app-shell";
import { AppToast } from "@/components/layout/app-toast";
import { Button } from "@/components/ui/button";
import { useListControls } from "@/hooks/use-list-controls";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";

import { ImportInvoicesModal } from "./import-modal";
import { InvoiceDrawer } from "./invoice-drawer";
import {
  filterInvoice,
  INVOICE_SORT_OPTIONS,
  INVOICE_STATUS_OPTIONS,
  sortInvoice,
} from "./list-config";
import { InvoicesList } from "./invoices-list";
import { PreviewModal } from "./preview-modal";
import { StatsGrid } from "./stats-grid";
import type { Invoice, InvoiceForm } from "./types";
import { useInvoices } from "./use-invoices";

export function InvoicesPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, variant, show: showToast } = useToast();
  const {
    invoices,
    isLoading,
    isError,
    error,
    refetch,
    isPrestadorReady,
    changeStatus,
    createBlankForm,
    cloneFormFromInvoice,
    saveInvoice,
    cancelInvoice,
    duplicateInvoice,
    importInvoices,
    exportInvoices,
  } = useInvoices();

  const list = useListControls({
    items: invoices,
    pageSize: 10,
    defaultSort: "date",
    filterFn: filterInvoice,
    sortFn: sortInvoice,
    sortOptions: INVOICE_SORT_OPTIONS,
    statusOptions: INVOICE_STATUS_OPTIONS,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InvoiceForm | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const previewInvoice = previewId ? invoices.find((i) => i.id === previewId) ?? null : null;
  const editingInvoice = editingId ? invoices.find((i) => i.id === editingId) ?? null : null;

  const openDrawer = (existing: Invoice | null) => {
    if (!existing && !isPrestadorReady) {
      showToast("Aguarde o carregamento da configuração do prestador", "warning");
      return;
    }

    try {
      setEditingId(existing?.id ?? null);
      setForm(existing ? cloneFormFromInvoice(existing) : createBlankForm());
      setDrawerOpen(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao abrir formulário", "error");
    }
  };

  const openPreview = (id: number) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

  const persist = async (emit: boolean) => {
    if (!form) return;
    try {
      const saved = await saveInvoice(form, editingId, emit);
      setDrawerOpen(false);
      openPreview(saved.id);
      showToast(emit ? "NFS-e emitida" : editingId ? "Rascunho atualizado" : "Rascunho salvo");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao salvar nota", "error");
    }
  };

  const handleStatusChange = async (id: number, status: Parameters<typeof changeStatus>[1]) => {
    try {
      await changeStatus(id, status);
      showToast("Status atualizado");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao atualizar status", "error");
    }
  };

  const handleDuplicate = async () => {
    if (previewId === null) return;
    try {
      await duplicateInvoice(previewId);
      setPreviewOpen(false);
      showToast("NFS-e duplicada");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao duplicar", "error");
    }
  };

  const handleEditFromPreview = () => {
    if (!previewInvoice) return;
    setPreviewOpen(false);
    openDrawer(previewInvoice);
  };

  const handleCancel = async () => {
    if (previewId === null) return;
    try {
      await cancelInvoice(previewId);
      showToast("NFS-e cancelada");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao cancelar", "error");
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportInvoices();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexfiscal-notas-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Backup exportado");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao exportar", "error");
    }
  };

  const handleImport = async (items: Parameters<typeof importInvoices>[0]) => {
    try {
      const { imported, skipped } = await importInvoices(items);
      if (imported > 0) {
        showToast(
          skipped.length > 0
            ? `${imported} importada(s), ${skipped.length} ignorada(s)`
            : `${imported} nota(s) importada(s)`,
        );
      } else {
        showToast(skipped.length > 0 ? "Nenhuma nota importada (duplicadas)" : "Nada para importar");
      }
      return { imported, skipped };
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao importar", "error");
      return { imported: 0, skipped: [] as string[] };
    }
  };

  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={toggleTheme}
      mobileAction={
        <button
          type="button"
          onClick={() => openDrawer(null)}
          className="flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:scale-[.98]"
          aria-label="Nova NFS-e"
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <StatsGrid invoices={invoices} />

      <ApiQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        loadingLabel="Carregando notas fiscais…"
      >
        <>
      <ListToolbar
          title="Notas Fiscais de Serviço"
          description="Emissão e controle de NFS-e."
          search={list.search}
          onSearchChange={list.setSearch}
          status={list.status}
          onStatusChange={list.setStatus}
          sortBy={list.sortBy}
          onSortByChange={list.setSortBy}
          sortDirection={list.sortDirection}
          onSortDirectionChange={list.setSortDirection}
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          statusOptions={INVOICE_STATUS_OPTIONS}
          sortOptions={INVOICE_SORT_OPTIONS}
          hasActiveFilters={list.hasActiveFilters}
          onClearFilters={list.clearFilters}
          action={
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                className="h-10 border-border px-3"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
              <Button className="h-10 px-5 font-semibold" onClick={() => openDrawer(null)}>
                Nova NFS-e
              </Button>
            </div>
          }
        />

        <InvoicesList
          invoices={list.paginatedItems}
          totalItems={list.totalItems}
          page={list.page}
          totalPages={list.totalPages}
          showingFrom={list.showingFrom}
          showingTo={list.showingTo}
          onPageChange={list.setPage}
          onOpen={openPreview}
          onStatusChange={handleStatusChange}
          hasFilters={list.hasActiveFilters || invoices.length > 0}
        />
        </>
      </ApiQueryState>

      <InvoiceDrawer
        open={drawerOpen}
        editingInvoice={editingInvoice}
        form={form}
        onOpenChange={setDrawerOpen}
        onFormChange={setForm}
        onSaveDraft={() => persist(false)}
        onEmit={() => persist(true)}
        onToast={showToast}
      />

      <PreviewModal
        invoice={previewInvoice}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDuplicate={handleDuplicate}
        onEdit={handleEditFromPreview}
        onCancel={handleCancel}
        onToast={showToast}
      />

      <ImportInvoicesModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        onExport={handleExport}
        invoiceCount={invoices.length}
      />

      <AppToast message={message} variant={variant} />
    </AppShell>
  );
}
