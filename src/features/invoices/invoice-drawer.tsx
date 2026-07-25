import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { AddressFields } from "@/components/form/address-fields";
import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { CurrencyInput } from "@/components/form/currency-input";
import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { FormTabs } from "@/components/form/form-tabs";
import { MaskedInput, inputClassName } from "@/components/form/masked-input";
import { SuggestInput } from "@/components/form/suggest-input";
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
import { useCepLookup } from "@/features/cep/use-cep-lookup";
import { useClientes } from "@/features/clientes/use-clientes";
import type { CnpjLookup } from "@/features/cnpj/api";
import { useCnpjAutoFill } from "@/features/cnpj/use-cnpj-auto-fill";
import { useEmpresas } from "@/features/empresas/use-empresas";
import { useItens } from "@/features/itens/use-itens";
import { cn } from "@/lib/utils";
import { onlyDigits } from "@/lib/format";
import {
  firstTabWithErrors,
  formatValidationToast,
  getFieldError,
  listErrorMessages,
  tabsWithErrors,
  zodFieldErrors,
  type FieldErrors,
} from "@/lib/zod-helpers";
import type { ToastVariant } from "@/hooks/use-toast";

import {
  getInvoiceWarnings,
  invoiceDraftSchema,
  invoiceEmitSchema,
  invoicePathToTab,
} from "./schema";
import { clienteToTomador, empresaToPrestador, itemToServico } from "./party-mappers";
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
  onDelete?: () => void;
  isDeleting?: boolean;
  onToast: (message: string, variant?: ToastVariant) => void;
};

type TabId = "prestador" | "tomador" | "servico";

const TABS = [
  { id: "prestador" as const, label: "Prestador" },
  { id: "tomador" as const, label: "Tomador" },
  { id: "servico" as const, label: "Serviço" },
];

const DOCUMENT_DRAFT_HINT = "Opcional no rascunho; obrigatório para emitir.";

export function InvoiceDrawer({
  open,
  editingInvoice,
  form,
  onOpenChange,
  onFormChange,
  onSaveDraft,
  onEmit,
  onDelete,
  isDeleting,
  onToast,
}: InvoiceDrawerProps) {
  const [tab, setTab] = useState<TabId>("prestador");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef(form);
  formRef.current = form;

  const { lookupCep } = useCepLookup();
  const { empresas } = useEmpresas();
  const { clientes } = useClientes();
  const { itens: catalogItens } = useItens();

  const applyPrestadorFromCnpj = useCallback(
    (data: CnpjLookup) => {
      const current = formRef.current;
      if (!current) return;
      onFormChange({
        ...current,
        prestador: {
          ...current.prestador,
          razaoSocial: data.razaoSocial || current.prestador.razaoSocial,
          nomeFantasia: data.nomeFantasia || current.prestador.nomeFantasia,
          cnpj: data.cnpj || current.prestador.cnpj,
          email: data.email || current.prestador.email,
          telefone: data.telefone || current.prestador.telefone,
          endereco: {
            ...current.prestador.endereco,
            ...data.endereco,
            numero: data.endereco.numero || current.prestador.endereco.numero,
          },
        },
      });
    },
    [onFormChange],
  );

  const applyTomadorFromCnpj = useCallback(
    (data: CnpjLookup) => {
      const current = formRef.current;
      if (!current) return;
      onFormChange({
        ...current,
        tomador: {
          ...current.tomador,
          nome: data.razaoSocial || current.tomador.nome,
          cpfCnpj: data.cnpj || current.tomador.cpfCnpj,
          email: data.email || current.tomador.email,
          telefone: data.telefone || current.tomador.telefone,
          endereco: {
            ...current.tomador.endereco,
            ...data.endereco,
            numero: data.endereco.numero || current.tomador.endereco.numero,
          },
        },
      });
    },
    [onFormChange],
  );

  const handleLookupError = useCallback(
    (message: string) => onToast(message, "warning"),
    [onToast],
  );

  const { loading: prestadorCnpjLoading, resetLookup: resetPrestadorCnpjLookup, markLookupDone: markPrestadorCnpjLookupDone } = useCnpjAutoFill(
    form?.prestador.cnpj ?? "",
    applyPrestadorFromCnpj,
    handleLookupError,
  );

  const { loading: tomadorCnpjLoading, resetLookup: resetTomadorCnpjLookup, markLookupDone: markTomadorCnpjLookupDone } = useCnpjAutoFill(
    form?.tomador.tipo === "pj" ? form.tomador.cpfCnpj : "",
    applyTomadorFromCnpj,
    handleLookupError,
  );

  useEffect(() => {
    if (open) {
      setDeleteOpen(false);
      setTab("prestador");
      setFieldErrors({});
    }
  }, [open, editingInvoice?.id]);

  const invalidTabs = useMemo(
    () => tabsWithErrors(fieldErrors, invoicePathToTab),
    [fieldErrors],
  );

  const empresaOptions = useMemo(
    () =>
      empresas.map((empresa) => ({
        id: empresa.id,
        label: empresa.nome,
        subtitle: [empresa.cnpj, empresa.whatsapp, empresa.email].filter(Boolean).join(" · ") || undefined,
      })),
    [empresas],
  );

  const clienteOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        id: cliente.id,
        label: cliente.nome,
        subtitle: [cliente.cpfCnpj, cliente.telefone].filter(Boolean).join(" · ") || undefined,
      })),
    [clientes],
  );

  const itemOptions = useMemo(
    () =>
      catalogItens
        .filter((item) => item.ativo && item.tipo === "servico")
        .map((item) => ({
          id: item.id,
          label: item.nome,
          subtitle: [item.codigoLc116, formatBRL(item.precoPadrao)].filter(Boolean).join(" · "),
        })),
    [catalogItens],
  );

  const clearFieldError = (path: string) => {
    setFieldErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const validate = (mode: "draft" | "emit") => {
    const schema = mode === "emit" ? invoiceEmitSchema : invoiceDraftSchema;
    const warningList = getInvoiceWarnings(form as never);
    const result = schema.safeParse(form);

    if (!result.success) {
      const nextErrors = zodFieldErrors(result.error);
      setFieldErrors(nextErrors);
      onToast(formatValidationToast(listErrorMessages(nextErrors), "error"), "error");
      const nextTab = firstTabWithErrors(
        nextErrors,
        TABS.map((item) => item.id),
        invoicePathToTab,
      );
      if (nextTab) setTab(nextTab);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    setFieldErrors({});
    if (warningList.length > 0) {
      onToast(formatValidationToast(warningList, "warning"), "warning");
    }
    return true;
  };

  const handleSaveDraftClick = () => {
    if (validate("draft")) onSaveDraft();
  };

  const handleEmitClick = () => {
    if (validate("emit")) onEmit();
  };

  if (!form) return null;

  const totals = calcInvoiceTotals(form.servico);
  const isEmitted = editingInvoice?.status === "emitida";

  const applyEmpresa = (empresaId: number) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    if (!empresa) return;
    if (empresa.cnpj) {
      markPrestadorCnpjLookupDone(empresa.cnpj);
    }
    onFormChange({
      ...form,
      prestador: empresaToPrestador(empresa, form.prestador),
    });
  };

  const applyCliente = (clienteId: number) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;
    if (cliente.tipo === "pj" && cliente.cpfCnpj) {
      markTomadorCnpjLookupDone(cliente.cpfCnpj);
    }
    onFormChange({
      ...form,
      tomador: clienteToTomador(cliente, form.tomador),
    });
  };

  const applyCatalogItem = (itemId: number) => {
    const item = catalogItens.find((i) => i.id === itemId);
    if (!item) return;
    onFormChange({
      ...form,
      servico: itemToServico(item, form.servico),
    });
  };

  const updatePrestador = (key: keyof InvoiceForm["prestador"], value: string) => {
    clearFieldError(`prestador.${key}`);
    onFormChange({ ...form, prestador: { ...form.prestador, [key]: value } });
  };

  const updateTomador = (key: keyof InvoiceForm["tomador"], value: string) => {
    clearFieldError(`tomador.${key}`);
    onFormChange({ ...form, tomador: { ...form.tomador, [key]: value } });
  };

  const updateServico = (key: keyof InvoiceForm["servico"], value: string | number | boolean) => {
    clearFieldError(`servico.${key}`);
    onFormChange({ ...form, servico: { ...form.servico, [key]: value } });
  };

  const prestadorAddressErrors = {
    cep: getFieldError(fieldErrors, "prestador.endereco.cep"),
    logradouro: getFieldError(fieldErrors, "prestador.endereco.logradouro"),
    numero: getFieldError(fieldErrors, "prestador.endereco.numero"),
    complemento: getFieldError(fieldErrors, "prestador.endereco.complemento"),
    bairro: getFieldError(fieldErrors, "prestador.endereco.bairro"),
    cidade: getFieldError(fieldErrors, "prestador.endereco.cidade"),
    uf: getFieldError(fieldErrors, "prestador.endereco.uf"),
  };

  const tomadorAddressErrors = {
    cep: getFieldError(fieldErrors, "tomador.endereco.cep"),
    logradouro: getFieldError(fieldErrors, "tomador.endereco.logradouro"),
    numero: getFieldError(fieldErrors, "tomador.endereco.numero"),
    complemento: getFieldError(fieldErrors, "tomador.endereco.complemento"),
    bairro: getFieldError(fieldErrors, "tomador.endereco.bairro"),
    cidade: getFieldError(fieldErrors, "tomador.endereco.cidade"),
    uf: getFieldError(fieldErrors, "tomador.endereco.uf"),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>
            {editingInvoice ? `Editar NFS-e nº ${editingInvoice.numero}` : "Nova NFS-e"}
          </SheetTitle>
        </SheetHeader>

        <div className="shrink-0 px-4 pt-3 sm:px-6">
          <FormTabs tabs={TABS} active={tab} onChange={setTab} invalidTabs={invalidTabs} />
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {tab === "prestador" && (
            <FormSection
              title="Prestador de serviço"
              description="Busque uma empresa cadastrada ou preencha manualmente."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Razão social" required className="sm:col-span-2" error={getFieldError(fieldErrors, "prestador.razaoSocial")}>
                  <SuggestInput
                    value={form.prestador.razaoSocial}
                    onChange={(value) => updatePrestador("razaoSocial", value)}
                    onSelect={(option) => applyEmpresa(Number(option.id))}
                    options={empresaOptions}
                    placeholder="Buscar empresa cadastrada ou digitar..."
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
                <FormField
                  label="CNPJ"
                  error={getFieldError(fieldErrors, "prestador.cnpj")}
                  hint={prestadorCnpjLoading ? "Buscando dados do CNPJ..." : DOCUMENT_DRAFT_HINT}
                >
                  <div className="relative">
                    <MaskedInput
                      mask="cnpj"
                      value={form.prestador.cnpj}
                      onValueChange={(v) => {
                        if (onlyDigits(v).length < 14) {
                          resetPrestadorCnpjLookup();
                        }
                        updatePrestador("cnpj", v);
                      }}
                    />
                    {prestadorCnpjLoading ? (
                      <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>
                </FormField>
                <FormField label="Inscrição municipal" required error={getFieldError(fieldErrors, "prestador.inscricaoMunicipal")}>
                  <Input
                    value={form.prestador.inscricaoMunicipal}
                    onChange={(e) => updatePrestador("inscricaoMunicipal", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="E-mail" error={getFieldError(fieldErrors, "prestador.email")}>
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
                required
                errors={prestadorAddressErrors}
                onLookupCep={lookupCep}
                onCepError={handleLookupError}
                onChange={(endereco) => {
                  Object.keys(endereco).forEach((key) =>
                    clearFieldError(`prestador.endereco.${key}`),
                  );
                  onFormChange({ ...form, prestador: { ...form.prestador, endereco } });
                }}
              />
            </FormSection>
          )}

          {tab === "tomador" && (
            <FormSection
              title="Tomador do serviço"
              description="Busque um cliente cadastrado ou preencha manualmente. Sem o CPF/CNPJ, salve como rascunho e complete depois."
            >
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
                  error={getFieldError(fieldErrors, "tomador.nome")}
                >
                  <SuggestInput
                    value={form.tomador.nome}
                    onChange={(value) => updateTomador("nome", value)}
                    onSelect={(option) => applyCliente(Number(option.id))}
                    options={clienteOptions}
                    placeholder="Buscar cliente cadastrado ou digitar..."
                    className={inputClassName}
                  />
                </FormField>
                <FormField
                  label={form.tomador.tipo === "pj" ? "CNPJ" : "CPF"}
                  error={getFieldError(fieldErrors, "tomador.cpfCnpj")}
                  hint={
                    form.tomador.tipo === "pj" && tomadorCnpjLoading
                      ? "Buscando dados do CNPJ..."
                      : DOCUMENT_DRAFT_HINT
                  }
                >
                  <div className="relative">
                    <MaskedInput
                      mask={form.tomador.tipo === "pj" ? "cnpj" : "cpf"}
                      value={form.tomador.cpfCnpj}
                      onValueChange={(v) => {
                        if (form.tomador.tipo === "pj" && onlyDigits(v).length < 14) {
                          resetTomadorCnpjLookup();
                        }
                        updateTomador("cpfCnpj", v);
                      }}
                    />
                    {form.tomador.tipo === "pj" && tomadorCnpjLoading ? (
                      <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>
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
                <FormField label="E-mail" error={getFieldError(fieldErrors, "tomador.email")}>
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
                required
                errors={tomadorAddressErrors}
                onLookupCep={lookupCep}
                onCepError={handleLookupError}
                onChange={(endereco) => {
                  Object.keys(endereco).forEach((key) =>
                    clearFieldError(`tomador.endereco.${key}`),
                  );
                  onFormChange({ ...form, tomador: { ...form.tomador, endereco } });
                }}
              />
            </FormSection>
          )}

          {tab === "servico" && (
            <div className="space-y-4">
              <FormSection title="Serviço prestado" description="Busque um item do catálogo ou preencha manualmente.">
                <FormField label="Código LC 116" required error={getFieldError(fieldErrors, "servico.codigoLc116")}>
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
                <FormField label="Descrição resumida" required error={getFieldError(fieldErrors, "servico.descricao")}>
                  <SuggestInput
                    value={form.servico.descricao}
                    onChange={(value) => updateServico("descricao", value)}
                    onSelect={(option) => applyCatalogItem(Number(option.id))}
                    options={itemOptions}
                    placeholder="Buscar item cadastrado ou digitar..."
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
                  <FormField label="Valor do serviço" required error={getFieldError(fieldErrors, "servico.valorServico")}>
                    <CurrencyInput
                      value={form.servico.valorServico}
                      onValueChange={(v) => updateServico("valorServico", v)}
                    />
                  </FormField>
                  <FormField label="Alíquota ISS (%)" error={getFieldError(fieldErrors, "servico.aliquotaIss")}>
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

        <SheetFooter className="relative z-10 shrink-0 flex-col gap-2 border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
          {editingInvoice && onDelete && !isEmitted ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir NFS-e
            </Button>
          ) : null}
          <div className="flex w-full gap-2">
            <Button type="button" variant="outline" className="h-11 flex-1 rounded-lg" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {!isEmitted && (
              <Button
                type="button"
                variant="secondary"
                className="h-11 flex-1 rounded-lg"
                onClick={handleSaveDraftClick}
                disabled={isDeleting}
              >
                Salvar rascunho
              </Button>
            )}
            <Button
              type="button"
              className="h-11 flex-1 rounded-lg"
              onClick={handleEmitClick}
              disabled={isEmitted || isDeleting}
            >
              {isEmitted ? "Já emitida" : "Emitir NFS-e"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir NFS-e?"
        description={`A nota fiscal Nº ${editingInvoice?.numero ?? ""} será removida permanentemente.`}
        onConfirm={() => onDelete?.()}
        isDeleting={isDeleting}
      />
    </Sheet>
  );
}
