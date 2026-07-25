import type { Invoice } from "./types";
import {
  calcInvoiceTotals,
  formatBRL,
  formatCpfCnpj,
  formatDateTime,
  STATUS_META,
} from "./utils";

type InvoiceDocumentProps = {
  invoice: Invoice;
};

function AddressBlock({
  title,
  lines,
}: {
  title: string;
  lines: (string | null | undefined)[];
}) {
  const filtered = lines.filter(Boolean);
  if (filtered.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </p>
      {filtered.map((line) => (
        <p key={line} className="text-xs leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  );
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const { baseCalculo, valorIss, valorLiquido } = calcInvoiceTotals(invoice.servico);
  const meta = STATUS_META[invoice.status];
  const enderecoPrestador = invoice.prestador.endereco;
  const enderecoTomador = invoice.tomador.endereco;

  return (
    <div className="nf-document w-full max-w-[520px] rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-lg sm:p-7">
      <div className="mb-5 border-b border-dashed border-border pb-4 text-center">
        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          Nota fiscal de serviço
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight">NFS-e</h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="font-mono-app text-sm font-semibold">
            Nº {invoice.numero} · Série {invoice.serie}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
          >
            {meta.label}
          </span>
        </div>
        {invoice.codigoVerificacao ? (
          <p className="mt-2 font-mono-app text-[11px] text-muted-foreground">
            Cód. verificação: {invoice.codigoVerificacao}
          </p>
        ) : null}
        <p className="mt-1 text-[11px] text-muted-foreground">
          Emissão: {formatDateTime(invoice.dataEmissao)}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <AddressBlock
          title="Prestador"
          lines={[
            invoice.prestador.razaoSocial,
            invoice.prestador.nomeFantasia !== invoice.prestador.razaoSocial
              ? invoice.prestador.nomeFantasia
              : null,
            `CNPJ: ${formatCpfCnpj(invoice.prestador.cnpj)}`,
            `IM: ${invoice.prestador.inscricaoMunicipal}`,
            `${enderecoPrestador.logradouro}, ${enderecoPrestador.numero}`,
            enderecoPrestador.complemento,
            `${enderecoPrestador.bairro} — ${enderecoPrestador.cidade}/${enderecoPrestador.uf}`,
            enderecoPrestador.cep ? `CEP ${enderecoPrestador.cep}` : null,
          ]}
        />
        <AddressBlock
          title="Tomador"
          lines={[
            invoice.tomador.nome,
            `${invoice.tomador.tipo === "pj" ? "CNPJ" : "CPF"}: ${formatCpfCnpj(invoice.tomador.cpfCnpj)}`,
            invoice.tomador.inscricaoMunicipal
              ? `IM: ${invoice.tomador.inscricaoMunicipal}`
              : null,
            invoice.tomador.email,
            invoice.tomador.telefone,
            enderecoTomador.logradouro
              ? `${enderecoTomador.logradouro}, ${enderecoTomador.numero}`
              : null,
            enderecoTomador.cidade
              ? `${enderecoTomador.bairro} — ${enderecoTomador.cidade}/${enderecoTomador.uf}`
              : null,
          ]}
        />
      </div>

      <div className="my-5 border-t border-dashed border-border pt-4">
        <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Discriminação do serviço
        </p>
        <p className="text-sm font-semibold">{invoice.servico.descricao}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Código LC 116: {invoice.servico.codigoLc116}
        </p>
        {invoice.servico.discriminacao ? (
          <p className="mt-2 text-xs leading-relaxed">{invoice.servico.discriminacao}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <div className="space-y-2 font-mono-app text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor do serviço</span>
            <span className="tabular-nums">{formatBRL(invoice.servico.valorServico)}</span>
          </div>
          {invoice.servico.valorDeducoes > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deduções</span>
              <span className="tabular-nums">- {formatBRL(invoice.servico.valorDeducoes)}</span>
            </div>
          ) : null}
          {(invoice.servico.descontoIncondicionado > 0 ||
            invoice.servico.descontoCondicionado > 0) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descontos</span>
              <span className="tabular-nums">
                -{" "}
                {formatBRL(
                  invoice.servico.descontoIncondicionado + invoice.servico.descontoCondicionado,
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base de cálculo ISS</span>
            <span className="tabular-nums">{formatBRL(baseCalculo)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ISS ({invoice.servico.aliquotaIss}%)
              {invoice.servico.issRetido ? " retido" : ""}
            </span>
            <span className="tabular-nums">{formatBRL(valorIss)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-border pt-2 font-semibold">
            <span>Valor líquido</span>
            <span className="tabular-nums">{formatBRL(valorLiquido)}</span>
          </div>
        </div>
      </div>

      {invoice.observacoes ? (
        <div className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">Observações</p>
          {invoice.observacoes}
        </div>
      ) : null}
    </div>
  );
}
