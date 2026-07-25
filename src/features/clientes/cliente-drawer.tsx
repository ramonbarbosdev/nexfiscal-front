import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { AddressFields } from "@/components/form/address-fields";
import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { MaskedInput, inputClassName } from "@/components/form/masked-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCepLookup } from "@/features/cep/use-cep-lookup";
import type { CnpjLookup } from "@/features/cnpj/api";
import { companyDisplayName, mergeCnpjAddress } from "@/features/cnpj/merge-cnpj-fields";
import { useCnpjAutoFill } from "@/features/cnpj/use-cnpj-auto-fill";
import { useToast } from "@/hooks/use-toast";
import { onlyDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Cliente, ClienteForm } from "./types";

type ClienteDrawerProps = {
  open: boolean;
  editingCliente: Cliente | null;
  form: ClienteForm | null;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: ClienteForm) => void;
  onSave: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

export function ClienteDrawer({
  open,
  editingCliente,
  form,
  onOpenChange,
  onFormChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: ClienteDrawerProps) {
  const [nomeError, setNomeError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const formRef = useRef(form);
  formRef.current = form;

  const { lookupCep } = useCepLookup();
  const { show: showToast } = useToast();

  const applyFromCnpj = useCallback(
    (data: CnpjLookup) => {
      const current = formRef.current;
      if (!current) return;
      onFormChange({
        ...current,
        nome: companyDisplayName(data) || current.nome,
        cpfCnpj: data.cnpj || current.cpfCnpj,
        telefone: data.telefone || current.telefone,
        endereco: mergeCnpjAddress(current.endereco, data.endereco),
      });
    },
    [onFormChange],
  );

  const handleLookupError = useCallback(
    (message: string) => showToast(message, "warning"),
    [showToast],
  );

  const { loading: cnpjLoading, resetLookup: resetCnpjLookup } = useCnpjAutoFill(
    form?.tipo === "pj" ? form.cpfCnpj : "",
    applyFromCnpj,
    handleLookupError,
  );

  useEffect(() => {
    if (open) {
      setNomeError("");
      setDeleteOpen(false);
    }
  }, [open, editingCliente?.id]);

  if (!form) return null;

  const update = <K extends keyof ClienteForm>(key: K, value: ClienteForm[K]) => {
    if (key === "nome") setNomeError("");
    onFormChange({ ...form, [key]: value });
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      setNomeError("Informe o nome do cliente");
      return;
    }
    onSave();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>{editingCliente ? "Editar cliente" : "Novo cliente"}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <FormSection
            title="Dados do cliente"
            description={
              form.tipo === "pj"
                ? "Informe o CNPJ para preencher automaticamente."
                : "Clientes usados nas suas propostas."
            }
          >
            <FormField label="Tipo de pessoa">
              <div className="grid grid-cols-2 gap-2">
                {(["pf", "pj"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => update("tipo", tipo)}
                    className={cn(
                      "h-10 rounded-lg border text-sm font-medium transition",
                      form.tipo === tipo
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
                label={form.tipo === "pj" ? "CNPJ" : "CPF"}
                className="sm:col-span-2"
                hint={form.tipo === "pj" && cnpjLoading ? "Buscando dados do CNPJ..." : undefined}
              >
                <div className="relative">
                  <MaskedInput
                    mask={form.tipo === "pj" ? "cnpj" : "cpf"}
                    value={form.cpfCnpj}
                    onValueChange={(v) => {
                      if (form.tipo === "pj" && onlyDigits(v).length < 14) {
                        resetCnpjLookup();
                      }
                      update("cpfCnpj", v);
                    }}
                  />
                  {form.tipo === "pj" && cnpjLoading ? (
                    <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
              </FormField>
              <FormField
                label={form.tipo === "pj" ? "Razão social" : "Nome completo"}
                required
                className="sm:col-span-2"
                error={nomeError}
              >
                <Input
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Telefone" className="sm:col-span-2">
                <MaskedInput
                  mask="phone"
                  value={form.telefone}
                  onValueChange={(v) => update("telefone", v)}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Endereço" description="Informe o CEP para preencher automaticamente.">
            <AddressFields
              idPrefix="cliente"
              value={form.endereco}
              onChange={(endereco) => onFormChange({ ...form, endereco })}
              onLookupCep={lookupCep}
              onCepError={handleLookupError}
            />
          </FormSection>
        </div>

        <SheetFooter className="relative z-10 shrink-0 flex-col gap-2 border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
          {editingCliente && onDelete ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir cliente
            </Button>
          ) : null}
          <div className="flex w-full gap-2">
            <Button type="button" variant="outline" className="h-11 flex-1 rounded-lg" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" className="h-11 flex-1 rounded-lg" onClick={handleSave} disabled={isSaving || isDeleting}>
              Salvar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir cliente?"
        description={`O cliente "${editingCliente?.nome ?? ""}" será removido permanentemente do cadastro.`}
        onConfirm={() => onDelete?.()}
        isDeleting={isDeleting}
      />
    </Sheet>
  );
}
