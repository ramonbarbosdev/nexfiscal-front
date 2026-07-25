import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListSortOption, ListStatusOption, SortDirection } from "@/hooks/use-list-controls";

type ListToolbarProps = {
  title: string;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (value: SortDirection) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  statusOptions: ListStatusOption[];
  sortOptions: ListSortOption[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  action?: React.ReactNode;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function ListToolbar({
  title,
  description,
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  pageSize,
  onPageSizeChange,
  statusOptions,
  sortOptions,
  hasActiveFilters,
  onClearFilters,
  action,
}: ListToolbarProps) {
  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
        </div>
        {action}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 rounded-lg pl-9"
            />
          </div>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortDirection} onValueChange={(v) => onSortDirectionChange(v as SortDirection)}>
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mais recentes</SelectItem>
              <SelectItem value="asc">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Exibir</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-8 w-[72px] rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">por página</span>
          </div>

          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={onClearFilters}>
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
