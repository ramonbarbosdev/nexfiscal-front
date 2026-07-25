import { Check } from "lucide-react";
import { marked } from "marked";

import { calcItemsTotal, formatBRL, formatDate, getInitials } from "./utils";
import type { Proposal } from "./types";

type ReceiptCardProps = {
  proposal: Proposal;
};

export function ReceiptCard({ proposal }: ReceiptCardProps) {
  const total = calcItemsTotal(proposal.itens) - (proposal.desconto || 0);
  const saldo = Math.max(total - (proposal.entrada || 0), 0);
  const initials = getInitials(proposal.empresa.nome || "?");

  return (
    <div className="font-mono-app h-fit w-full max-w-[380px] rounded-xl border border-border bg-card px-4 py-6 text-card-foreground shadow-sm sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-col items-center text-center">
        {proposal.empresa.logo ? (
          <img
            src={proposal.empresa.logo}
            alt=""
            className="mb-2.5 h-14 w-14 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            {initials}
          </div>
        )}
        <p className="text-[15px] font-semibold tracking-tight">{proposal.empresa.nome || "—"}</p>
        <p className="mt-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Proposta
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Nº {proposal.numero}</p>
      </div>

      <div className="my-4 border-t border-dashed border-border" />

      <div className="mb-1 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cliente</span>
          <span className="font-medium">{proposal.cliente.nome || "—"}</span>
        </div>
        {proposal.cliente.telefone ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telefone</span>
            <span>{proposal.cliente.telefone}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data</span>
          <span>{formatDate(proposal.createdAt)}</span>
        </div>
      </div>

      {proposal.projeto.titulo ? (
        <>
          <div className="my-4 border-t border-dashed border-border" />
          <div className="space-y-1 text-xs">
            <p className="mb-1 text-[13px] font-semibold">{proposal.projeto.titulo}</p>
            {proposal.projeto.descricao ? (
              <div
                className="md-content text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: marked.parse(proposal.projeto.descricao) }}
              />
            ) : null}
            {proposal.projeto.area ? (
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Área</span>
                <span>{proposal.projeto.area}</span>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="my-4 border-t border-dashed border-border" />

      <div className="space-y-2">
        <p className="mb-2 text-[10px] tracking-[0.2em] text-muted-foreground">ITENS</p>
        {proposal.itens.map((item) => (
          <div key={item.id} className="flex items-baseline text-[13px]">
            <span className="flex shrink-0 items-baseline gap-1.5">
              <Check className="relative top-[1px] h-3 w-3" />
              {item.desc || "Item"}
              {item.qtd > 1 ? <span className="text-muted-foreground">x{item.qtd}</span> : null}
            </span>
            <span className="dot-leader" />
            <span className="shrink-0 tabular-nums">{formatBRL(item.qtd * item.valor)}</span>
          </div>
        ))}
      </div>

      <div className="my-4 border-t-2 border-foreground" />

      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold tracking-wide">TOTAL</span>
        <span className="text-lg font-bold tabular-nums">{formatBRL(total)}</span>
      </div>
      {proposal.desconto > 0 ? (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Desconto aplicado</span>
          <span className="tabular-nums">- {formatBRL(proposal.desconto)}</span>
        </div>
      ) : null}

      <div className="my-4 border-t border-dashed border-border" />

      <div className="space-y-1.5 text-xs">
        {proposal.formaPagamento ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pagamento</span>
            <span className="text-right">{proposal.formaPagamento}</span>
          </div>
        ) : null}
        {proposal.entrada > 0 ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada</span>
              <span className="tabular-nums">{formatBRL(proposal.entrada)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo</span>
              <span className="tabular-nums">{formatBRL(saldo)}</span>
            </div>
          </>
        ) : null}
        {proposal.projeto.prazo ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prazo</span>
            <span>{proposal.projeto.prazo}</span>
          </div>
        ) : null}
        {proposal.projeto.validade ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validade</span>
            <span>{proposal.projeto.validade}</span>
          </div>
        ) : null}
      </div>

      {proposal.observacoes ? (
        <>
          <div className="my-4 border-t border-dashed border-border" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">{proposal.observacoes}</p>
        </>
      ) : null}

      <div className="my-5 border-t border-dashed border-border" />

      <div className="text-center">
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] text-muted-foreground">
          {proposal.empresa.whatsapp ? <span>{proposal.empresa.whatsapp}</span> : null}
          {proposal.empresa.instagram ? <span>{proposal.empresa.instagram}</span> : null}
          {proposal.empresa.email ? <span>{proposal.empresa.email}</span> : null}
        </div>
      </div>
    </div>
  );
}
