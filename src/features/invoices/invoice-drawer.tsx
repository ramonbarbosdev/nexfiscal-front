import { useEffect, useState } from "react";

import { AddressFields } from "@/components/form/address-fields";
import { CurrencyInput } from "@/components/form/currency-input";
import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { FormTabs } from "@/components/form/form-tabs";
import { MaskedInput, inputClassName } from "@/components/form/masked-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { Invoice, InvoiceForm } from "./types";
import { LC116_SERVICES } from "./types";
import { calcInvoiceTotals, formatBRL } from "./utils";

type InvoiceDrawerProps = {
  open: boolean;
  editingInvoice: Invoice | null;
  form: InvoiceForm | null;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: InvoiceForm) => void;
  onSaveDraft: () => void;
  onEmit: () => void;
};

type TabId = "prestador" | "tomador" | "servico";

const TABS = [
  { id: "prestador" as const, label: "Prestador" },
  { id: "tomador" as const, label: "Tomador" },
  { id: "servico" as const, label: "Serviço" },
];

export function InvoiceDrawer({
  open,
  editingInvoice,
  form,
  onOpenChange,
  onFormChange,
  onSaveDraft,
  onEmit,
}: InvoiceDrawerProps) {
  const [tab, setTab] = useState<TabId>("prestador");

  useEffect(() => {
    if (open) setTab("prestador");
  }, [open, editingInvoice?.id]);

  if (!form) return null;

  const totals = calcInvoiceTotals(form.servico);
  const isEmitted = editingInvoice?.status === "emitida";

  const updatePrestador = (key: keyof InvoiceForm["prestador"], value: string) =>
    onFormChange({ ...form, prestador: { ...form.prestador, [key]: value } });

  const updateTomador = (key: keyof InvoiceForm["tomador"], value: string) =>
    onFormChange({ ...form, tomador: { ...form.tomador, [key]: value } });

  const updateServico = (key: keyof InvoiceForm["servico"], value: string | number | boolean) =>
    onFormChange({ ...form, servico: { ...form.servico, [key]: value } });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[640px]">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>
            {editingInvoice ? `Editar NFS-e nº ${editingInvoice.numero}` : "Nova NFS-e"}
          </SheetTitle>
        </SheetHeader>

        <div className="shrink-0 px-4 pt-3 sm:px-6">
          <FormTabs tabs={TABS} active={tab} onChange={setTab} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {tab === "prestador" && (
            <FormSection title="Prestador de serviço" description="Dados da sua empresa.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Razão social" required className="sm:col-span-2">
                  <Input
                    value={form.prestador.razaoSocial}
                    onChange={(e) => updatePrestador("razaoSocial", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Nome fantasia" className="sm:col-span-2">
                  <Input
                    value={form.prestador.nomeFantasia}
                    onChange={(e) => updatePrestador("nomeFantasia", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="CNPJ" required>
                  <MaskedInput
                    mask="cnpj"
                    value={form.prestador.cnpj}
                    onValueChange={(v) => updatePrestador("cnpj", v)}
                  />
                </FormField>
                <FormField label="Inscrição municipal" required>
                  <Input
                    value={form.prestador.inscricaoMunicipal}
                    onChange={(e) => updatePrestador("inscricaoMunicipal", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="E-mail">
                  <Input
                    type="email"
                    value={form.prestador.email}
                    onChange={(e) => updatePrestador("email", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Telefone">
                  <MaskedInput
                    mask="phone"
                    value={form.prestador.telefone}
                    onValueChange={(v) => updatePrestador("telefone", v)}
                  />
                </FormField>
              </div>
              <AddressFields
                idPrefix="prestador"
                value={form.prestador.endereco}
                onChange={(endereco) =>
                  onFormChange({ ...form, prestador: { ...form.prestador, endereco } })
                }
              />
            </FormSection>
          )}

          {tab === "tomador" && (
            <FormSection title="Tomador do serviço">
              <FormField label="Tipo de pessoa">
                <div className="grid grid-cols-2 gap-2">
                  {(["pf", "pj"] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => updateTomador("tipo", tipo)}
                      className={cn(
                        "h-10 rounded-lg border text-sm font-medium transition",
                        form.tomador.tipo === tipo
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {tipo === "pf" ? "Pessoa física" : "Pessoa jurídica"}
                    </button>
                  ))}
                </div>
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label={form.tomador.tipo === "pj" ? "Razão social" : "Nome completo"}
                  required
                  className="sm:col-span-2"
                >
                  <Input
                    value={form.tomador.nome}
                    onChange={(e) => updateTomador("nome", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label={form.tomador.tipo === "pj" ? "CNPJ" : "CPF"} required>
                  <MaskedInput
                    mask={form.tomador.tipo === "pj" ? "cnpj" : "cpf"}
                    value={form.tomador.cpfCnpj}
                    onValueChange={(v) => updateTomador("cpfCnpj", v)}
                  />
                </FormField>
                {form.tomador.tipo === "pj" ? (
                  <FormField label="Inscrição municipal">
                    <Input
                      value={form.tomador.inscricaoMunicipal}
                      onChange={(e) => updateTomador("inscricaoMunicipal", e.target.value)}
                      className={inputClassName}
                    />
                  </FormField>
                ) : null}
                <FormField label="E-mail">
                  <Input
                    type="email"
                    value={form.tomador.email}
                    onChange={(e) => updateTomador("email", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Telefone">
                  <MaskedInput
                    mask="phone"
                    value={form.tomador.telefone}
                    onValueChange={(v) => updateTomador("telefone", v)}
                  />
                </FormField>
              </div>
              <AddressFields
                idPrefix="tomador"
                value={form.tomador.endereco}
                onChange={(endereco) =>
                  onFormChange({ ...form, tomador: { ...form.tomador, endereco } })
                }
              />
            </FormSection>
          )}

          {tab === "servico" && (
            <div className="space-y-4">
              <FormSection title="Serviço prestado">
                <FormField label="Código LC 116" required>
                  <Select
                    value={form.servico.codigoLc116}
                    onValueChange={(v) => updateServico("codigoLc116", v)}
                  >
                    <SelectTrigger className={inputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LC116_SERVICES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Descrição resumida" required>
                  <Input
                    value={form.servico.descricao}
                    onChange={(e) => updateServico("descricao", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Discriminação do serviço">
                  <Textarea
                    rows={3}
                    value={form.servico.discriminacao}
                    onChange={(e) => updateServico("discriminacao", e.target.value)}
                    className="resize-none rounded-lg"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Valores e tributos">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Valor do serviço" required>
                    <CurrencyInput
                      value={form.servico.valorServico}
                      onValueChange={(v) => updateServico("valorServico", v)}
                    />
                  </FormField>
                  <FormField label="Alíquota ISS (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={form.servico.aliquotaIss}
                      onChange={(e) => updateServico("aliquotaIss", Number(e.target.value) || 0)}
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField label="Deduções">
                    <CurrencyInput
                      value={form.servico.valorDeducoes}
                      onValueChange={(v) => updateServico("valorDeducoes", v)}
                    />
                  </FormField>
                  <FormField label="Desconto incondicionado">
                    <CurrencyInput
                      value={form.servico.descontoIncondicionado}
                      onValueChange={(v) => updateServico("descontoIncondicionado", v)}
                    />
                  </FormField>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.servico.issRetido}
                    onChange={(e) => updateServico("issRetido", e.target.checked)}
                    className="rounded border-border"
                  />
                  ISS retido na fonte
                </label>
                <div className="space-y-2 border-t border-dashed border-border pt-3 font-mono-app text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base de cálculo</span>
                    <span className="tabular-nums">{formatBRL(totals.baseCalculo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor ISS</span>
                    <span className="tabular-nums">{formatBRL(totals.valorIss)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Valor líquido</span>
                    <span className="tabular-nums">{formatBRL(totals.valorLiquido)}</span>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Observações">
                <FormField label="Observações adicionais">
                  <Textarea
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => onFormChange({ ...form, observacoes: e.target.value })}
                    className="resize-none rounded-lg"
                  />
                </FormField>
              </FormSection>
            </div>
          )}
        </div>

        <SheetFooter className="shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4">
          <Button variant="outline" className="h-11 flex-1 rounded-lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!isEmitted && (
            <Button variant="secondary" className="h-11 flex-1 rounded-lg" onClick={onSaveDraft}>
              Salvar rascunho
            </Button>
          )}
          <Button className="h-11 flex-1 rounded-lg" onClick={onEmit} disabled={isEmitted}>
            {isEmitted ? "Já emitida" : "Emitir NFS-e"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
