import { useRef, useState } from "react";
import { Download, FileUp, Upload } from "lucide-react";

import { ConfirmClose } from "@/components/form/confirm-close";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/format";

import {
  detectImportType,
  invoiceImportSummary,
  parseImportFile,
  type InvoiceImportItem,
} from "./import";

type ImportInvoicesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: InvoiceImportItem[]) => Promise<{ imported: number; skipped: string[] }>;
  onExport: () => void;
  invoiceCount: number;
};

export function ImportInvoicesModal({
  open,
  onOpenChange,
  onImport,
  onExport,
  invoiceCount,
}: ImportInvoicesModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<InvoiceImportItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const isDirty = preview.length > 0 || errors.length > 0 || fileName !== null;

  const reset = () => {
    setPreview([]);
    setErrors([]);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const processFile = async (file: File) => {
    const type = detectImportType(file);
    if (!type) {
      setErrors(["Formato não suportado. Use JSON, XML ou CSV."]);
      setPreview([]);
      return;
    }

    const content = await file.text();
    const result = parseImportFile(content, type);
    setFileName(file.name);
    setPreview(result.items);
    setErrors(result.errors);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    await onImport(preview);
    reset();
    onOpenChange(false);
  };

  return (
    <ConfirmClose
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      isDirty={isDirty}
      description="Você selecionou um arquivo para importação. Se sair agora, o preview será perdido."
    >
      {({ requestClose, handleOpenChange }) => (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
            <DialogHeader className="border-b px-5 py-4">
              <DialogTitle>Importar notas fiscais</DialogTitle>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) void processFile(file);
                }}
              >
                <FileUp className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Arraste um arquivo ou selecione do computador</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JSON (NexFiscal), XML (NFS-e ABRASF) ou CSV
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Escolher arquivo
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".json,.xml,.csv,application/json,text/xml,application/xml,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void processFile(file);
                  }}
                />
              </div>

              {fileName ? (
                <p className="text-xs text-muted-foreground">
                  Arquivo: <span className="font-medium text-foreground">{fileName}</span>
                </p>
              ) : null}

              {errors.length > 0 ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                  {errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              ) : null}

              {preview.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{preview.length} nota(s) pronta(s) para importar</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                    {preview.map((item, index) => {
                      const summary = invoiceImportSummary(item);
                      return (
                        <div
                          key={`${summary.numero}-${index}`}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="font-medium">Nº {summary.numero}</p>
                            <p className="text-muted-foreground">{summary.tomador}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono-app tabular-nums">{formatBRL(summary.valor)}</p>
                            <p className="text-muted-foreground capitalize">{summary.status}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-border bg-card p-3">
                <p className="mb-2 text-xs font-medium">Exportar backup</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Baixe suas {invoiceCount} nota(s) em JSON para backup ou reimportação.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={onExport} disabled={invoiceCount === 0}>
                  <Download className="h-4 w-4" />
                  Exportar JSON
                </Button>
              </div>
            </div>

            <DialogFooter className="border-t px-5 py-4">
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleImport} disabled={preview.length === 0}>
                Importar {preview.length > 0 ? `(${preview.length})` : ""}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ConfirmClose>
  );
}
