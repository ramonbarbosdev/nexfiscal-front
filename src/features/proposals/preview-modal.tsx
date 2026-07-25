import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  CheckCircle2,
  Copy,
  FileDown,
  FileText,
  Image,
  Link,
  MessageCircle,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { ReceiptCard } from "./receipt-card";
import { ServiceReportCard } from "./service-report-card";
import { calcItemsTotal, formatBRL } from "./utils";
import type { Proposal, ProposalStatus } from "./types";

type PreviewMode = "proposta" | "relatorio";

type PreviewModalProps = {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: ProposalStatus) => void;
  onGenerateInvoice: () => void;
  isDeleting?: boolean;
  isGeneratingInvoice?: boolean;
  onToast: (message: string) => void;
};

export function PreviewModal({
  proposal,
  open,
  onOpenChange,
  onDuplicate,
  onEdit,
  onDelete,
  onStatusChange,
  onGenerateInvoice,
  isDeleting,
  isGeneratingInvoice,
  onToast,
}: PreviewModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mode, setMode] = useState<PreviewMode>("proposta");

  useEffect(() => {
    if (!open || !proposal) return;
    setMode(proposal.status === "concluida" ? "relatorio" : "proposta");
  }, [open, proposal?.id, proposal?.status]);

  if (!proposal) return null;

  const total = calcItemsTotal(proposal.itens) - (proposal.desconto || 0);
  const isReport = mode === "relatorio";

  const shareWhatsApp = () => {
    const lines = isReport
      ? [
          `Relatório de serviços — Proposta Nº ${proposal.numero}`,
          proposal.empresa.nome,
          "",
          `Cliente: ${proposal.cliente.nome}`,
          `Serviço: ${proposal.projeto.titulo}`,
          `Valor: ${formatBRL(total).replace(/\s/g, " ")}`,
        ]
      : [
          `Proposta Nº ${proposal.numero}`,
          proposal.empresa.nome,
          "",
          `Cliente: ${proposal.cliente.nome}`,
          `Projeto: ${proposal.projeto.titulo}`,
          `Total: ${formatBRL(total).replace(/\s/g, " ")}`,
        ];
    const text = lines.join("%0A");
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const downloadPng = async () => {
    const node = receiptRef.current;
    if (!node) return;
    onToast("Gerando imagem...");
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.download = isReport ? `relatorio-${proposal.numero}.png` : `proposta-${proposal.numero}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(`https://nexfiscal.app/p/${proposal.numero}`)
      .then(() => onToast("Link copiado!"));
  };

  const markConcluida = () => {
    onStatusChange("concluida");
    setMode("relatorio");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] w-full max-w-[560px] flex-col gap-0 overflow-hidden rounded-t-3xl p-0 sm:h-auto sm:max-h-[92vh] sm:rounded-3xl">
        <DialogTitle className="sr-only">
          {isReport ? "Relatório de serviços" : "Pré-visualização da proposta"}
        </DialogTitle>

        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 sm:px-5">
          <span className="text-sm font-semibold">Pré-visualização</span>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setMode("proposta")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition",
                mode === "proposta"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Proposta
            </button>
            <button
              type="button"
              onClick={() => setMode("relatorio")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition",
                mode === "relatorio"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Relatório
            </button>
          </div>
        </div>

        <div
          id="receiptWrapper"
          className="flex flex-1 justify-center overflow-y-auto bg-[#EEEEF1] px-3 py-5 dark:bg-black sm:px-8 sm:py-8"
        >
          <div ref={receiptRef}>
            {isReport ? <ServiceReportCard proposal={proposal} /> : <ReceiptCard proposal={proposal} />}
          </div>
        </div>

        <div className="shrink-0 border-t p-3 sm:p-4">
          {proposal.status !== "concluida" && proposal.status !== "cancelada" ? (
            <Button
              type="button"
              variant="outline"
              className="mb-2 h-10 w-full rounded-xl"
              onClick={markConcluida}
            >
              <CheckCircle2 className="h-4 w-4" /> Marcar serviço como concluído
            </Button>
          ) : null}

          <Button
            type="button"
            className="mb-2 h-11 w-full rounded-xl"
            onClick={onGenerateInvoice}
            disabled={isGeneratingInvoice || proposal.status === "cancelada"}
          >
            <Receipt className="h-4 w-4" />
            {isGeneratingInvoice ? "Abrindo NFS-e…" : "Gerar NFS-e a partir desta proposta"}
          </Button>

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
          {isReport ? (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3" />
              Envie o relatório para o cliente conferir antes de emitir a NFS-e.
            </p>
          ) : null}
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
