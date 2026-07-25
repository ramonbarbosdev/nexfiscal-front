import { useState } from "react";
import { Plus } from "lucide-react";

import { ListToolbar } from "@/components/list/list-toolbar";
import { ApiQueryState } from "@/components/layout/api-query-state";
import { AppShell } from "@/components/layout/app-shell";
import { AppToast } from "@/components/layout/app-toast";
import { Button } from "@/components/ui/button";
import { useListControls } from "@/hooks/use-list-controls";
import { useTheme } from "@/hooks/use-theme";
import { useDirtyForm } from "@/hooks/use-dirty-form";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";

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
import type { Proposal, ProposalForm, ProposalSaveMeta } from "./types";
import { defaultProposalSaveMeta } from "./types";
import { useProposals } from "./use-proposals";

export function ProposalsPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { message, variant, show: showToast } = useToast();
  const {
    proposals,
    isLoading,
    isError,
    error,
    refetch,
    changeStatus,
    createBlankForm,
    cloneFormFromProposal,
    saveProposal,
    duplicateProposal,
    removeProposal,
    isDeleting,
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
  const { value: form, setValue: setForm, reset: resetForm } =
    useDirtyForm<ProposalForm>();
  const {
    value: saveMeta,
    setValue: setSaveMeta,
    reset: resetSaveMeta,
  } = useDirtyForm<ProposalSaveMeta>(defaultProposalSaveMeta());
  const [previewId, setPreviewId] = useState<number | null>(null);

  const previewProposal = previewId ? proposals.find((p) => p.id === previewId) ?? null : null;
  const editingProposal = editingId ? proposals.find((p) => p.id === editingId) ?? null : null;

  const openDrawer = (existing: Proposal | null) => {
    setEditingId(existing?.id ?? null);
    resetForm(existing ? cloneFormFromProposal(existing) : createBlankForm());
    resetSaveMeta(defaultProposalSaveMeta());
    setDrawerOpen(true);
  };

  const openPreview = (id: number) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

  const handleSave = async (meta: ProposalSaveMeta) => {
    if (!form) return;
    try {
      const saved = await saveProposal(form, editingId, meta);
      setDrawerOpen(false);
      openPreview(saved.id);
      showToast(editingId ? "Proposta atualizada" : "Proposta criada");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao salvar proposta", "error");
    }
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
      await duplicateProposal(previewId);
      setPreviewOpen(false);
      showToast("Proposta duplicada");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao duplicar", "error");
    }
  };

  const handleEditFromPreview = () => {
    if (!previewProposal) return;
    setPreviewOpen(false);
    openDrawer(previewProposal);
  };

  const handleDelete = async (id: number) => {
    try {
      await removeProposal(id);
      if (editingId === id) {
        setDrawerOpen(false);
        setEditingId(null);
        setForm(null);
      }
      if (previewId === id) {
        setPreviewOpen(false);
        setPreviewId(null);
      }
      showToast("Proposta excluída");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Erro ao excluir proposta", "error");
    }
  };


  return (
    <AppShell
      isDark={isDark}
      onToggleTheme={toggleTheme}
      mobileAction={
        drawerOpen ? undefined : (
        <button
          type="button"
          onClick={() => openDrawer(null)}
          className="flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:scale-[.98]"
          aria-label="Nova proposta"
        >
          <Plus className="h-5 w-5" />
        </button>
        )
      }
    >
      <StatsGrid proposals={proposals} />

      <ApiQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        loadingLabel="Carregando propostas…"
      >
        <>
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
            <Button className="h-10 shrink-0 px-5 font-semibold" onClick={() => openDrawer(null)}>
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
        </>
      </ApiQueryState>

      <ProposalDrawer
        open={drawerOpen}
        editingProposal={editingProposal}
        form={form}
        saveMeta={saveMeta}
        onOpenChange={setDrawerOpen}
        onFormChange={setForm}
        onSaveMetaChange={setSaveMeta}
        onSave={handleSave}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onDelete={editingId ? () => void handleDelete(editingId) : undefined}
        isDeleting={isDeleting}
        onToast={showToast}
      />

      <PreviewModal
        proposal={previewProposal}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDuplicate={handleDuplicate}
        onEdit={handleEditFromPreview}
        onDelete={() => {
          if (previewId !== null) void handleDelete(previewId);
        }}
        isDeleting={isDeleting}
        onToast={showToast}
      />

      <AppToast message={message} variant={variant} />
    </AppShell>
  );
}
