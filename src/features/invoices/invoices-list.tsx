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

import type { Invoice, InvoiceStatus } from "./types";
import {
  calcInvoiceTotals,
  formatBRL,
  formatCpfCnpj,
  formatDate,
  STATUS_META,
} from "./utils";

type InvoicesListProps = {
  invoices: Invoice[];
  totalItems: number;
  page: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
  onPageChange: (page: number) => void;
  onOpen: (id: number) => void;
  onStatusChange: (id: number, status: InvoiceStatus) => void;
  hasFilters: boolean;
};

const ROW_STATUS_CLASS: Record<InvoiceStatus, string> = {
  rascunho: "nf-ledger-row--rascunho",
  emitida: "nf-ledger-row--emitida",
  cancelada: "nf-ledger-row--cancelada",
};

export function InvoicesList({
  invoices,
  totalItems,
  page,
  totalPages,
  showingFrom,
  showingTo,
  onPageChange,
  onOpen,
  onStatusChange,
  hasFilters,
}: InvoicesListProps) {
  if (totalItems === 0 && !hasFilters) {
    return (
      <div className="nf-empty">
        <p className="font-display text-lg font-semibold">Nenhuma NFS-e ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Emita ou importe sua primeira nota fiscal de serviço.
        </p>
      </div>
    );
  }

  if (invoices.length === 0) {
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
        <span>Nota</span>
        <span className="text-right">Valor líquido</span>
        <span className="w-[7.5rem]">Status</span>
      </div>

      <div className="divide-y divide-border">
        {invoices.map((invoice) => {
          const { valorLiquido } = calcInvoiceTotals(invoice.servico);
          const meta = STATUS_META[invoice.status];

          return (
            <div
              key={invoice.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(invoice.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpen(invoice.id);
              }}
              className={cn("nf-ledger-row rounded-none border-0 border-l-[3px]", ROW_STATUS_CLASS[invoice.status])}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {invoice.servico.descricao || "Sem descrição"}
                  </p>
                  <span className={meta.className}>{meta.label}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {invoice.tomador.nome || "Tomador não informado"} · Nº {invoice.numero} ·{" "}
                  {formatDate(invoice.dataEmissao)}
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="font-mono-app text-sm font-semibold tabular-nums">
                  {formatBRL(valorLiquido)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatCpfCnpj(invoice.tomador.cpfCnpj)}
                </p>
              </div>

              <div
                className="hidden w-[7.5rem] sm:block"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Select
                  value={invoice.status}
                  onValueChange={(value) => onStatusChange(invoice.id, value as InvoiceStatus)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="emitida">Emitida</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="font-mono-app text-sm font-semibold tabular-nums sm:hidden">
                {formatBRL(valorLiquido)}
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
