import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Copy, FileDown, Image, Link, MessageCircle, Pencil, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { ReceiptCard } from "./receipt-card";
import { calcItemsTotal, formatBRL } from "./utils";
import type { Proposal } from "./types";

type PreviewModalProps = {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  onToast: (message: string) => void;
};

export function PreviewModal({
  proposal,
  open,
  onOpenChange,
  onDuplicate,
  onEdit,
  onDelete,
  isDeleting,
  onToast,
}: PreviewModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!proposal) return null;

  const total = calcItemsTotal(proposal.itens) - (proposal.desconto || 0);

  const shareWhatsApp = () => {
    const text = `Proposta Nº ${proposal.numero}%0A${proposal.empresa.nome}%0A%0ACliente: ${proposal.cliente.nome}%0AProjeto: ${proposal.projeto.titulo}%0ATotal: ${formatBRL(total).replace(/\s/g, " ")}`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const downloadPng = async () => {
    const node = receiptRef.current;
    if (!node) return;
    onToast("Gerando imagem...");
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.download = `proposta-${proposal.numero}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(`https://nexfiscal.app/p/${proposal.numero}`)
      .then(() => onToast("Link copiado!"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] w-full max-w-[560px] flex-col gap-0 overflow-hidden rounded-t-3xl p-0 sm:h-auto sm:max-h-[92vh] sm:rounded-3xl">
        <DialogTitle className="sr-only">Pré-visualização da proposta</DialogTitle>

        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-5">
          <span className="text-sm font-semibold">Pré-visualização</span>
        </div>

        <div
          id="receiptWrapper"
          className="flex flex-1 justify-center overflow-y-auto bg-[#EEEEF1] px-3 py-5 dark:bg-black sm:px-8 sm:py-8"
        >
          <div ref={receiptRef}>
            <ReceiptCard proposal={proposal} />
          </div>
        </div>

        <div className="shrink-0 border-t p-3 sm:p-4">
          <Button
            type="button"
            variant="outline"
            className="mb-2 h-10 w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" /> Excluir proposta
          </Button>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <Button
              className="h-11 rounded-xl bg-[#25D366] text-white hover:bg-[#25D366]/90"
              onClick={shareWhatsApp}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" onClick={() => window.print()}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <Button variant="outline" className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs" onClick={downloadPng}>
              <Image className="h-4 w-4" /> PNG
            </Button>
            <Button variant="outline" className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs" onClick={copyLink}>
              <Link className="h-4 w-4" /> Link
            </Button>
            <Button variant="outline" className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs" onClick={onDuplicate}>
              <Copy className="h-4 w-4" /> Duplicar
            </Button>
            <Button variant="outline" className="h-10 flex-col gap-0.5 rounded-xl text-[11px] sm:gap-1 sm:text-xs" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
          </div>
        </div>
      </DialogContent>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir proposta?"
        description={`A proposta Nº ${proposal.numero} será removida permanentemente.`}
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete();
        }}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}
