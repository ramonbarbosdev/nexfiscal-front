import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

import type { Empresa, EmpresaForm } from "./types";

type EmpresaDrawerProps = {
  open: boolean;
  editingEmpresa: Empresa | null;
  form: EmpresaForm | null;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: EmpresaForm) => void;
  onSave: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

export function EmpresaDrawer({
  open,
  editingEmpresa,
  form,
  onOpenChange,
  onFormChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: EmpresaDrawerProps) {
  const [nomeError, setNomeError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { lookupCep } = useCepLookup();
  const { show: showToast } = useToast();

  useEffect(() => {
    if (open) {
      setNomeError("");
      setDeleteOpen(false);
    }
  }, [open, editingEmpresa?.id]);

  if (!form) return null;

  const update = (key: keyof EmpresaForm, value: string) => {
    if (key === "nome") setNomeError("");
    onFormChange({ ...form, [key]: value });
  };

  const handleLogoChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("logo", String(ev.target?.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      setNomeError("Informe o nome da empresa");
      return;
    }
    onSave();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>{editingEmpresa ? "Editar empresa" : "Nova empresa"}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <FormSection title="Dados da empresa" description="Empresas usadas nas suas propostas.">
            <div className="flex items-start gap-4">
              <FormField label="Logo">
                <label
                  htmlFor="empresa-logo"
                  className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted"
                >
                  {form.logo ? (
                    <img src={form.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                </label>
                <input
                  id="empresa-logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoChange(e.target.files?.[0])}
                />
              </FormField>
              <FormField label="Nome" required className="flex-1" error={nomeError}>
                <Input
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  className={inputClassName}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="WhatsApp">
                <MaskedInput
                  mask="phone"
                  value={form.whatsapp}
                  onValueChange={(v) => update("whatsapp", v)}
                />
              </FormField>
              <FormField label="Instagram">
                <Input
                  value={form.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="E-mail" className="sm:col-span-2">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClassName}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Endereço" description="Informe o CEP para preencher automaticamente.">
            <AddressFields
              idPrefix="empresa"
              value={form.endereco}
              onChange={(endereco) => onFormChange({ ...form, endereco })}
              onLookupCep={lookupCep}
              onCepError={(message) => showToast(message, "warning")}
            />
          </FormSection>
        </div>

        <SheetFooter className="relative z-10 shrink-0 flex-col gap-2 border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
          {editingEmpresa && onDelete ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir empresa
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
        title="Excluir empresa?"
        description={`A empresa "${editingEmpresa?.nome ?? ""}" será removida permanentemente do cadastro.`}
        onConfirm={() => onDelete?.()}
        isDeleting={isDeleting}
      />
    </Sheet>
  );
}
