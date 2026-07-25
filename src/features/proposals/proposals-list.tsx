import { ChevronRight } from "lucide-react";

import { ListPagination } from "@/components/list/list-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { calcItemsTotal, formatBRL, formatDate, STATUS_META } from "./utils";
import type { Proposal, ProposalStatus } from "./types";

type ProposalsListProps = {
  proposals: Proposal[];
  totalItems: number;
  page: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
  onPageChange: (page: number) => void;
  onOpen: (id: number) => void;
  onStatusChange: (id: number, status: ProposalStatus) => void;
  hasFilters: boolean;
};

const ROW_STATUS_CLASS: Record<ProposalStatus, string> = {
  pendente: "nf-ledger-row--pendente",
  aprovada: "nf-ledger-row--aprovada",
  cancelada: "nf-ledger-row--cancelada",
};

export function ProposalsList({
  proposals,
  totalItems,
  page,
  totalPages,
  showingFrom,
  showingTo,
  onPageChange,
  onOpen,
  onStatusChange,
  hasFilters,
}: ProposalsListProps) {
  if (totalItems === 0 && !hasFilters) {
    return (
      <div className="nf-empty">
        <p className="font-display text-lg font-semibold">Nenhuma proposta ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece registrando sua primeira proposta comercial.
        </p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="nf-empty">
        <p className="font-medium">Nenhum resultado</p>
        <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou a busca.</p>
      </div>
    );
  }

  return (
    <div className="nf-panel">
      <div className="nf-panel-header hidden text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4">
        <span>Proposta</span>
        <span className="text-right">Valor</span>
        <span className="w-[7.5rem]">Status</span>
      </div>

      <div className="divide-y divide-border">
        {proposals.map((proposal) => {
          const total = calcItemsTotal(proposal.itens) - (proposal.desconto || 0);
          const meta = STATUS_META[proposal.status];

          return (
            <div
              key={proposal.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(proposal.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpen(proposal.id);
              }}
              className={cn("nf-ledger-row rounded-none border-0 border-l-[3px]", ROW_STATUS_CLASS[proposal.status])}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {proposal.projeto.titulo || "Sem título"}
                  </p>
                  <span className={meta.className}>{meta.label}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {proposal.cliente.nome || "Cliente não informado"} · Nº {proposal.numero} ·{" "}
                  {formatDate(proposal.createdAt)}
                </p>
              </div>

              <p className="font-mono-app hidden shrink-0 text-sm font-semibold tabular-nums sm:block">
                {formatBRL(total)}
              </p>

              <div
                className="hidden w-[7.5rem] sm:block"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Select
                  value={proposal.status}
                  onValueChange={(value) => onStatusChange(proposal.id, value as ProposalStatus)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="font-mono-app text-sm font-semibold tabular-nums sm:hidden">
                {formatBRL(total)}
              </p>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-3">
        <ListPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          showingFrom={showingFrom}
          showingTo={showingTo}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
