import { useRef, useState } from "react";
import { Ban, Copy, FileDown, Image, Link, Pencil, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { downloadElementAsPng } from "@/lib/html2canvas-export";

import { InvoiceDocument } from "./invoice-document";
import type { Invoice } from "./types";
import { calcInvoiceTotals, formatBRL } from "./utils";

type PreviewModalProps = {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  onToast: (message: string) => void;
};

export function PreviewModal({
  invoice,
  open,
  onOpenChange,
  onDuplicate,
  onEdit,
  onCancel,
  onDelete,
  isDeleting,
  onToast,
}: PreviewModalProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!invoice) return null;

  const canDelete = invoice.status !== "emitida";

  const { valorLiquido } = calcInvoiceTotals(invoice.servico);

  const downloadPng = async () => {
    const node = docRef.current;
    if (!node) return;
    onToast("Gerando imagem...");
    try {
      await downloadElementAsPng(node, `nfse-${invoice.numero}.png`);
    } catch {
      onToast("Não foi possível gerar a imagem");
    }
  };

  const copyLink = () => {
    const url = `https://nexfiscal.app/nf/${invoice.numero}`;
    navigator.clipboard.writeText(url).then(() => onToast("Link copiado!"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] w-full max-w-[600px] flex-col gap-0 overflow-hidden rounded-t-3xl p-0 sm:h-auto sm:max-h-[92vh] sm:rounded-3xl">
        <DialogTitle className="sr-only">Pré-visualização da NFS-e</DialogTitle>

        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-5">
          <div>
            <span className="text-sm font-semibold">NFS-e Nº {invoice.numero}</span>
            <p className="text-xs text-muted-foreground">{formatBRL(valorLiquido)}</p>
          </div>
        </div>

        <div
          id="nfDocumentWrapper"
          className="flex flex-1 justify-center overflow-y-auto bg-[#EEEEF1] px-3 py-5 dark:bg-black sm:px-6 sm:py-8"
        >
          <div ref={docRef}>
            <InvoiceDocument invoice={invoice} />
          </div>
        </div>

        <div className="shrink-0 border-t p-3 sm:p-4">
          {canDelete ? (
            <Button
              type="button"
              variant="outline"
              className="mb-2 h-10 w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" /> Excluir NFS-e
            </Button>
          ) : null}
          <div className="mb-2 grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11 rounded-xl" onClick={() => window.print()}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" onClick={downloadPng}>
              <Image className="h-4 w-4" /> PNG
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs"
              onClick={copyLink}
            >
              <Link className="h-4 w-4" /> Link
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs"
              onClick={onDuplicate}
            >
              <Copy className="h-4 w-4" /> Duplicar
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs"
              onClick={onEdit}
              disabled={invoice.status === "cancelada"}
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs"
              onClick={onCancel}
              disabled={invoice.status !== "emitida"}
            >
              <Ban className="h-4 w-4" /> Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir NFS-e?"
        description={`A nota fiscal Nº ${invoice.numero} será removida permanentemente.`}
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete();
        }}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}
