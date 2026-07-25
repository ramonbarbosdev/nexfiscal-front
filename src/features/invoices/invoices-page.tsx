import { useState } from "react";
import { Plus, Upload } from "lucide-react";

import { ListToolbar } from "@/components/list/list-toolbar";
import { AppHeader } from "@/components/layout/app-header";
import { AppToast } from "@/components/layout/app-toast";
import { Button } from "@/components/ui/button";
import { useListControls } from "@/hooks/use-list-controls";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

import { ImportInvoicesModal } from "./import-modal";
import { serializeInvoicesForExport } from "./import";
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
import { validateInvoiceForm } from "./utils";

export function InvoicesPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, show: showToast } = useToast();
  const {
    invoices,
    changeStatus,
    createBlankForm,
    cloneFormFromInvoice,
    saveInvoice,
    cancelInvoice,
    duplicateInvoice,
    importInvoices,
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
    setEditingId(existing?.id ?? null);
    setForm(existing ? cloneFormFromInvoice(existing) : createBlankForm());
    setDrawerOpen(true);
  };

  const openPreview = (id: number) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

  const persist = (emit: boolean) => {
    if (!form) return;
    const error = validateInvoiceForm(form);
    if (error) {
      showToast(error);
      return;
    }
    const saved = saveInvoice(form, editingId, emit);
    setDrawerOpen(false);
    openPreview(saved.id);
    showToast(emit ? "NFS-e emitida" : editingId ? "Rascunho atualizado" : "Rascunho salvo");
  };

  const handleStatusChange = (id: number, status: Parameters<typeof changeStatus>[1]) => {
    changeStatus(id, status);
    showToast("Status atualizado");
  };

  const handleDuplicate = () => {
    if (previewId === null) return;
    duplicateInvoice(previewId);
    setPreviewOpen(false);
    showToast("NFS-e duplicada");
  };

  const handleEditFromPreview = () => {
    if (!previewInvoice) return;
    setPreviewOpen(false);
    openDrawer(previewInvoice);
  };

  const handleCancel = () => {
    if (previewId === null) return;
    cancelInvoice(previewId);
    showToast("NFS-e cancelada");
  };

  const handleExport = () => {
    const blob = new Blob([serializeInvoicesForExport(invoices)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexfiscal-notas-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup exportado");
  };

  const handleImport = (items: Parameters<typeof importInvoices>[0]) => {
    const { imported, skipped } = importInvoices(items);
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
  };

  return (
    <div className="nexfiscal-app min-h-screen overflow-x-hidden bg-[#EEEEF1] text-foreground transition-colors duration-300 dark:bg-black">
      <AppHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-6xl px-3 py-5 pb-28 sm:px-4 sm:py-8 sm:pb-8 md:px-8">
        <StatsGrid invoices={invoices} />

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
                className="h-10 rounded-lg px-3"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
              <Button className="h-10 rounded-lg px-4" onClick={() => openDrawer(null)}>
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
      </main>

      <InvoiceDrawer
        open={drawerOpen}
        editingInvoice={editingInvoice}
        form={form}
        onOpenChange={setDrawerOpen}
        onFormChange={setForm}
        onSaveDraft={() => persist(false)}
        onEmit={() => persist(true)}
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

      <AppToast message={message} />

      <button
        type="button"
        onClick={() => openDrawer(null)}
        className="fixed right-4 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-[.98] sm:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Nova NFS-e"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
