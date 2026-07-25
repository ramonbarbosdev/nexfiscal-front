import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

type ApiQueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  loadingLabel?: string;
  children: ReactNode;
};

export function ApiQueryState({
  isLoading,
  isError,
  error,
  onRetry,
  loadingLabel = "Carregando…",
  children,
}: ApiQueryStateProps) {
  if (isLoading) {
    return <p className="px-1 py-8 text-sm text-muted-foreground">{loadingLabel}</p>;
  }

  if (isError) {
    const message =
      error instanceof ApiError
        ? error.message
        : error?.message ?? "Não foi possível conectar à API.";

    return (
      <div className="nf-panel mx-1 my-6 max-w-lg p-6">
        <h2 className="font-display text-lg font-semibold">API indisponível</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Verifique se o backend está rodando e se `VITE_API_URL` está correto.
        </p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return children;
}
