import { ChevronRight, FileText } from "lucide-react";

import { ListPagination } from "@/components/list/list-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { calcItemsTotal, formatBRL, formatDate, getInitials, STATUS_META } from "./utils";
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
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium">Nenhuma proposta cadastrada</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use o botão Nova para criar a primeira proposta.
        </p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <p className="font-medium">Nenhum resultado encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajuste os filtros ou a busca para ver outras propostas.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3">
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
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-muted-foreground/30 sm:gap-4 sm:p-4"
            >
              <div className="font-mono-app flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold sm:h-11 sm:w-11">
                {proposal.cliente.nome ? getInitials(proposal.cliente.nome) : "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {proposal.projeto.titulo || "Sem título"}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-[11px] ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                  {proposal.cliente.nome} · Nº {proposal.numero} · {formatDate(proposal.createdAt)}
                </p>
                <p className="font-mono-app mt-1 text-sm font-semibold tabular-nums sm:hidden">
                  {formatBRL(total)}
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <p className="font-mono-app text-sm font-semibold tabular-nums">{formatBRL(total)}</p>
              </div>
              <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Select
                  value={proposal.status}
                  onValueChange={(value) => onStatusChange(proposal.id, value as ProposalStatus)}
                >
                  <SelectTrigger className="hidden h-8 w-[120px] text-xs sm:flex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            </div>
          );
        })}
      </div>

      <ListPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        showingFrom={showingFrom}
        showingTo={showingTo}
        onPageChange={onPageChange}
      />
    </div>
  );
}
