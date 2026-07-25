import { useState } from "react";
import { Plus } from "lucide-react";

import { ListToolbar } from "@/components/list/list-toolbar";
import { AppHeader } from "@/components/layout/app-header";
import { AppToast } from "@/components/layout/app-toast";
import { Button } from "@/components/ui/button";
import { useListControls } from "@/hooks/use-list-controls";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

import {
  filterProposal,
  PROPOSAL_SORT_OPTIONS,
  PROPOSAL_STATUS_OPTIONS,
  sortProposal,
} from "./list-config";
import { PreviewModal } from "./preview-modal";
import { ProposalDrawer } from "./proposal-drawer";
import { ProposalsList } from "./proposals-list";
import { StatsGrid } from "./stats-grid";
import type { Proposal, ProposalForm } from "./types";
import { useProposals } from "./use-proposals";

export function ProposalsPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, show: showToast } = useToast();
  const {
    proposals,
    changeStatus,
    createBlankForm,
    cloneFormFromProposal,
    saveProposal,
    duplicateProposal,
    nextItemId,
  } = useProposals();

  const list = useListControls({
    items: proposals,
    pageSize: 10,
    defaultSort: "date",
    filterFn: filterProposal,
    sortFn: sortProposal,
    sortOptions: PROPOSAL_SORT_OPTIONS,
    statusOptions: PROPOSAL_STATUS_OPTIONS,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProposalForm | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const previewProposal = previewId ? proposals.find((p) => p.id === previewId) ?? null : null;
  const editingProposal = editingId ? proposals.find((p) => p.id === editingId) ?? null : null;

  const openDrawer = (existing: Proposal | null) => {
    setEditingId(existing?.id ?? null);
    setForm(existing ? cloneFormFromProposal(existing) : createBlankForm());
    setDrawerOpen(true);
  };

  const openPreview = (id: number) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

  const handleSave = () => {
    if (!form) return;
    if (!form.empresa.nome.trim() || !form.cliente.nome.trim()) {
      showToast("Preencha empresa e cliente");
      return;
    }

    const saved = saveProposal(form, editingId);
    setDrawerOpen(false);
    openPreview(saved.id);
    showToast(editingId ? "Proposta atualizada" : "Proposta criada");
  };

  const handleAddItem = () => {
    if (!form) return;
    const id = nextItemId();
    setForm({
      ...form,
      itens: [...form.itens, { id, desc: "", qtd: 1, valor: 0 }],
    });
  };

  const handleRemoveItem = (id: number) => {
    if (!form) return;
    if (form.itens.length <= 1) {
      showToast("Mantenha pelo menos 1 item");
      return;
    }
    setForm({ ...form, itens: form.itens.filter((item) => item.id !== id) });
  };

  const handleStatusChange = (id: number, status: Parameters<typeof changeStatus>[1]) => {
    changeStatus(id, status);
    showToast("Status atualizado");
  };

  const handleDuplicate = () => {
    if (previewId === null) return;
    duplicateProposal(previewId);
    setPreviewOpen(false);
    showToast("Proposta duplicada");
  };

  const handleEditFromPreview = () => {
    if (!previewProposal) return;
    setPreviewOpen(false);
    openDrawer(previewProposal);
  };


  return (
    <div className="nexfiscal-app min-h-screen overflow-x-hidden bg-[#EEEEF1] text-foreground transition-colors duration-300 dark:bg-black">
      <AppHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-6xl px-3 py-5 pb-28 sm:px-4 sm:py-8 sm:pb-8 md:px-8">
        <StatsGrid proposals={proposals} />

        <ListToolbar
          title="Propostas"
          description="Gerencie suas propostas comerciais."
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
          statusOptions={PROPOSAL_STATUS_OPTIONS}
          sortOptions={PROPOSAL_SORT_OPTIONS}
          hasActiveFilters={list.hasActiveFilters}
          onClearFilters={list.clearFilters}
          action={
            <Button className="h-10 shrink-0 rounded-lg px-4" onClick={() => openDrawer(null)}>
              Nova proposta
            </Button>
          }
        />

        <ProposalsList
          proposals={list.paginatedItems}
          totalItems={list.totalItems}
          page={list.page}
          totalPages={list.totalPages}
          showingFrom={list.showingFrom}
          showingTo={list.showingTo}
          onPageChange={list.setPage}
          onOpen={openPreview}
          onStatusChange={handleStatusChange}
          hasFilters={list.hasActiveFilters || proposals.length > 0}
        />
      </main>

      <ProposalDrawer
        open={drawerOpen}
        editingProposal={editingProposal}
        form={form}
        onOpenChange={setDrawerOpen}
        onFormChange={setForm}
        onSave={handleSave}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />

      <PreviewModal
        proposal={previewProposal}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDuplicate={handleDuplicate}
        onEdit={handleEditFromPreview}
        onToast={showToast}
      />

      <AppToast message={message} />

      <button
        type="button"
        onClick={() => openDrawer(null)}
        className="fixed right-4 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-[.98] sm:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Nova proposta"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
