import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { marked } from "marked";

import { CurrencyInput } from "@/components/form/currency-input";
import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { FormTabs } from "@/components/form/form-tabs";
import { MaskedInput, inputClassName } from "@/components/form/masked-input";
import { SuggestInput } from "@/components/form/suggest-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
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
import { useClientes } from "@/features/clientes/use-clientes";
import { useEmpresas } from "@/features/empresas/use-empresas";

import {
  getProposalWarnings,
  proposalFormSchema,
  proposalPathToTab,
} from "./schema";
import { calcItemsTotal, formatBRL } from "./utils";
import type { Proposal, ProposalForm, ProposalSaveMeta } from "./types";

type ProposalDrawerProps = {
  open: boolean;
  editingProposal: Proposal | null;
  form: ProposalForm | null;
  saveMeta: ProposalSaveMeta;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: ProposalForm) => void;
  onSaveMetaChange: (meta: ProposalSaveMeta) => void;
  onSave: (meta: ProposalSaveMeta) => void;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onToast: (message: string, variant?: ToastVariant) => void;
};

type TabId = "empresa" | "cliente" | "projeto" | "financeiro";

const TABS = [
  { id: "empresa" as const, label: "Empresa" },
  { id: "cliente" as const, label: "Cliente" },
  { id: "projeto" as const, label: "Projeto" },
  { id: "financeiro" as const, label: "Valores" },
];

export function ProposalDrawer({
  open,
  editingProposal,
  form,
  saveMeta,
  onOpenChange,
  onFormChange,
  onSaveMetaChange,
  onSave,
  onAddItem,
  onRemoveItem,
  onToast,
}: ProposalDrawerProps) {
  const { empresas } = useEmpresas();
  const { clientes } = useClientes();
  const [tab, setTab] = useState<TabId>("empresa");
  const [mdTab, setMdTab] = useState<"edit" | "preview">("edit");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTab("empresa");
      setMdTab("edit");
      setFieldErrors({});
    }
  }, [open, editingProposal?.id]);

  const invalidTabs = useMemo(
    () => tabsWithErrors(fieldErrors, proposalPathToTab),
    [fieldErrors],
  );

  const empresaOptions = useMemo(
    () =>
      empresas.map((empresa) => ({
        id: empresa.id,
        label: empresa.nome,
        subtitle: [empresa.whatsapp, empresa.email].filter(Boolean).join(" · ") || undefined,
      })),
    [empresas],
  );

  const clienteOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        id: cliente.id,
        label: cliente.nome,
        subtitle: cliente.telefone || undefined,
      })),
    [clientes],
  );

  const clearFieldError = (path: string) => {
    setFieldErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const handleSaveClick = () => {
    const warningList = getProposalWarnings(form!);
    const result = proposalFormSchema.safeParse(form);

    if (!result.success) {
      const nextErrors = zodFieldErrors(result.error);
      setFieldErrors(nextErrors);
      onToast(formatValidationToast(listErrorMessages(nextErrors), "error"), "error");
      const nextTab = firstTabWithErrors(
        nextErrors,
        TABS.map((item) => item.id),
        proposalPathToTab,
      );
      if (nextTab) setTab(nextTab);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFieldErrors({});
    if (warningList.length > 0) {
      onToast(formatValidationToast(warningList, "warning"), "warning");
    }
    onSave(saveMeta);
  };

  const selectEmpresa = (value: string) => {
    if (value === "none") {
      onSaveMetaChange({ ...saveMeta, empresaId: null });
      return;
    }
    const empresa = empresas.find((e) => e.id === Number(value));
    if (!empresa) return;
    onFormChange({
      ...form!,
      empresa: {
        logo: empresa.logo,
        nome: empresa.nome,
        whatsapp: empresa.whatsapp,
        instagram: empresa.instagram,
        email: empresa.email,
      },
    });
    onSaveMetaChange({ ...saveMeta, empresaId: empresa.id });
  };

  const selectCliente = (value: string) => {
    if (value === "none") {
      onSaveMetaChange({ ...saveMeta, clienteId: null });
      return;
    }
    const cliente = clientes.find((c) => c.id === Number(value));
    if (!cliente) return;
    onFormChange({
      ...form!,
      cliente: { nome: cliente.nome, telefone: cliente.telefone },
    });
    onSaveMetaChange({ ...saveMeta, clienteId: cliente.id });
  };

  if (!form) return null;

  const update = (patch: Partial<ProposalForm>) => onFormChange({ ...form, ...patch });
  const updateEmpresa = (key: keyof ProposalForm["empresa"], value: string) => {
    clearFieldError(`empresa.${key}`);
    onFormChange({ ...form, empresa: { ...form.empresa, [key]: value } });
  };
  const updateCliente = (key: keyof ProposalForm["cliente"], value: string) => {
    clearFieldError(`cliente.${key}`);
    onFormChange({ ...form, cliente: { ...form.cliente, [key]: value } });
  };
  const updateProjeto = (key: keyof ProposalForm["projeto"], value: string) => {
    clearFieldError(`projeto.${key}`);
    onFormChange({ ...form, projeto: { ...form.projeto, [key]: value } });
  };

  const updateItem = (id: number, field: "desc" | "qtd" | "valor", value: string | number) => {
    const index = form.itens.findIndex((item) => item.id === id);
    if (index >= 0) clearFieldError(`itens.${index}.${field}`);
    onFormChange({
      ...form,
      itens: form.itens.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "desc" ? value : Number(value) || 0,
            }
          : item,
      ),
    });
  };

  const handleLogoChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateEmpresa("logo", String(ev.target?.result ?? ""));
    reader.readAsDataURL(file);
  };

  const subtotal = calcItemsTotal(form.itens);
  const total = Math.max(subtotal - (form.desconto || 0), 0);
  const saldo = Math.max(total - (form.entrada || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[640px]">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>{editingProposal ? "Editar proposta" : "Nova proposta"}</SheetTitle>
        </SheetHeader>

        <div className="shrink-0 px-4 pt-3 sm:px-6">
          <FormTabs tabs={TABS} active={tab} onChange={setTab} invalidTabs={invalidTabs} />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {tab === "empresa" && (
            <FormSection title="Dados da empresa" description="Informações do prestador na proposta.">
              {empresas.length > 0 ? (
                <FormField label="Empresa cadastrada">
                  <Select
                    value={saveMeta.empresaId ? String(saveMeta.empresaId) : "none"}
                    onValueChange={selectEmpresa}
                  >
                    <SelectTrigger className="h-10 border-border bg-background">
                      <SelectValue placeholder="Selecionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Digitar manualmente</SelectItem>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={String(empresa.id)}>
                          {empresa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              ) : null}
              <div className="flex items-start gap-4">
                <FormField label="Logo">
                  <label
                    htmlFor="proposal-logo"
                    className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted"
                  >
                    {form.empresa.logo ? (
                      <img src={form.empresa.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </label>
                  <input
                    id="proposal-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoChange(e.target.files?.[0])}
                  />
                </FormField>
                <FormField label="Nome da empresa" required className="flex-1" error={getFieldError(fieldErrors, "empresa.nome")}>
                  <Input
                    value={form.empresa.nome}
                    onChange={(e) => updateEmpresa("nome", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="WhatsApp">
                  <MaskedInput
                    mask="phone"
                    value={form.empresa.whatsapp}
                    onValueChange={(v) => updateEmpresa("whatsapp", v)}
                  />
                </FormField>
                <FormField label="Instagram">
                  <Input
                    value={form.empresa.instagram}
                    onChange={(e) => updateEmpresa("instagram", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="E-mail" className="sm:col-span-2" error={getFieldError(fieldErrors, "empresa.email")}>
                  <Input
                    type="email"
                    value={form.empresa.email}
                    onChange={(e) => updateEmpresa("email", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <Checkbox
                  checked={saveMeta.salvarEmpresa}
                  onCheckedChange={(checked) =>
                    onSaveMetaChange({ ...saveMeta, salvarEmpresa: checked === true })
                  }
                />
                <span className="text-sm">
                  Salvar empresa no cadastro
                  {saveMeta.empresaId ? " (atualizar existente)" : " (criar nova)"}
                </span>
              </label>
            </FormSection>
          )}

          {tab === "cliente" && (
            <FormSection title="Dados do cliente">
              {clientes.length > 0 ? (
                <FormField label="Cliente cadastrado">
                  <Select
                    value={saveMeta.clienteId ? String(saveMeta.clienteId) : "none"}
                    onValueChange={selectCliente}
                  >
                    <SelectTrigger className="h-10 border-border bg-background">
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Digitar manualmente</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={String(cliente.id)}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              ) : null}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nome" required className="sm:col-span-2" error={getFieldError(fieldErrors, "cliente.nome")}>
                  <Input
                    value={form.cliente.nome}
                    onChange={(e) => updateCliente("nome", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Telefone">
                  <MaskedInput
                    mask="phone"
                    value={form.cliente.telefone}
                    onValueChange={(v) => updateCliente("telefone", v)}
                  />
                </FormField>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <Checkbox
                  checked={saveMeta.salvarCliente}
                  onCheckedChange={(checked) =>
                    onSaveMetaChange({ ...saveMeta, salvarCliente: checked === true })
                  }
                />
                <span className="text-sm">
                  Salvar cliente no cadastro
                  {saveMeta.clienteId ? " (atualizar existente)" : " (criar novo)"}
                </span>
              </label>
            </FormSection>
          )}

          {tab === "projeto" && (
            <div className="space-y-4">
              <FormSection title="Detalhes do projeto">
                <FormField label="Título">
                  <Input
                    value={form.projeto.titulo}
                    onChange={(e) => updateProjeto("titulo", e.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Descrição" hint="Suporta Markdown">
                  <div className="mb-2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={mdTab === "edit" ? "default" : "outline"}
                      onClick={() => setMdTab("edit")}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={mdTab === "preview" ? "default" : "outline"}
                      onClick={() => setMdTab("preview")}
                    >
                      Visualizar
                    </Button>
                  </div>
                  {mdTab === "edit" ? (
                    <Textarea
                      rows={4}
                      value={form.projeto.descricao}
                      onChange={(e) => updateProjeto("descricao", e.target.value)}
                      className="resize-none rounded-lg font-mono-app text-sm"
                    />
                  ) : (
                    <div className="min-h-16 rounded-lg border border-input bg-background px-3 py-2.5">
                      {form.projeto.descricao.trim() ? (
                        <div
                          className="md-content"
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(form.projeto.descricao),
                          }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Sem conteúdo.</p>
                      )}
                    </div>
                  )}
                </FormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField label="Área">
                    <Input
                      value={form.projeto.area}
                      onChange={(e) => updateProjeto("area", e.target.value)}
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField label="Prazo">
                    <Input
                      value={form.projeto.prazo}
                      onChange={(e) => updateProjeto("prazo", e.target.value)}
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField label="Validade">
                    <Input
                      value={form.projeto.validade}
                      onChange={(e) => updateProjeto("validade", e.target.value)}
                      className={inputClassName}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection
                title="Itens"
                action={
                  <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </Button>
                }
              >
                <div className="hidden grid-cols-[1fr_72px_120px_100px_32px] gap-2 px-1 text-[11px] font-medium text-muted-foreground sm:grid">
                  <span>Descrição</span>
                  <span className="text-center">Qtd</span>
                  <span className="text-right">Valor unit.</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>
                <div className="space-y-3">
                  {form.itens.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_72px_120px_100px_32px] sm:items-center sm:border-0 sm:p-0"
                    >
                      <FormField
                        label="Descrição"
                        className="sm:hidden"
                        error={getFieldError(fieldErrors, `itens.${index}.desc`)}
                      >
                        <Input
                          value={item.desc}
                          onChange={(e) => updateItem(item.id, "desc", e.target.value)}
                          className={inputClassName}
                        />
                      </FormField>
                      <Input
                        value={item.desc}
                        onChange={(e) => updateItem(item.id, "desc", e.target.value)}
                        className={`hidden sm:block ${inputClassName}`}
                      />
                      <FormField
                        label="Qtd"
                        className="sm:hidden"
                        error={getFieldError(fieldErrors, `itens.${index}.qtd`)}
                      >
                        <Input
                          type="number"
                          min={0}
                          value={item.qtd}
                          onChange={(e) => updateItem(item.id, "qtd", e.target.value)}
                          className={`${inputClassName} text-center`}
                        />
                      </FormField>
                      <Input
                        type="number"
                        min={0}
                        value={item.qtd}
                        onChange={(e) => updateItem(item.id, "qtd", e.target.value)}
                        className={`hidden sm:block ${inputClassName} text-center`}
                      />
                      <FormField
                        label="Valor"
                        className="sm:hidden"
                        error={getFieldError(fieldErrors, `itens.${index}.valor`)}
                      >
                        <CurrencyInput
                          value={item.valor}
                          onValueChange={(v) => updateItem(item.id, "valor", v)}
                        />
                      </FormField>
                      <CurrencyInput
                        value={item.valor}
                        onValueChange={(v) => updateItem(item.id, "valor", v)}
                        className="hidden sm:block"
                      />
                      <p className="text-right font-mono-app text-sm tabular-nums">
                        {formatBRL(item.qtd * item.valor)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </FormSection>
            </div>
          )}

          {tab === "financeiro" && (
            <div className="space-y-4">
              <FormSection title="Resumo financeiro">
                <div className="space-y-3 font-mono-app text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatBRL(subtotal)}</span>
                  </div>
                  <FormField label="Desconto" error={getFieldError(fieldErrors, "desconto")}>
                    <CurrencyInput
                      value={form.desconto}
                      onValueChange={(v) => {
                        clearFieldError("desconto");
                        update({ desconto: v });
                      }}
                    />
                  </FormField>
                  <div className="flex justify-between border-t border-dashed border-border pt-2 font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatBRL(total)}</span>
                  </div>
                  <FormField label="Entrada" error={getFieldError(fieldErrors, "entrada")}>
                    <CurrencyInput
                      value={form.entrada}
                      onValueChange={(v) => {
                        clearFieldError("entrada");
                        update({ entrada: v });
                      }}
                    />
                  </FormField>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Saldo</span>
                    <span className="tabular-nums">{formatBRL(saldo)}</span>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Pagamento e observações">
                <FormField label="Forma de pagamento">
                  <Input
                    value={form.formaPagamento}
                    onChange={(e) => update({ formaPagamento: e.target.value })}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Observações">
                  <Textarea
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => update({ observacoes: e.target.value })}
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
          <Button className="h-11 flex-1 rounded-lg" onClick={handleSaveClick}>
            Salvar proposta
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
