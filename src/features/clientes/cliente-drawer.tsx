import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

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
  const { lookupCep } = useCepLookup();
  const { show: showToast } = useToast();

  useEffect(() => {
    if (open) {
      setNomeError("");
      setDeleteOpen(false);
    }
  }, [open, editingCliente?.id]);

  if (!form) return null;

  const update = (key: keyof ClienteForm, value: string) => {
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
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>{editingCliente ? "Editar cliente" : "Novo cliente"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <FormSection title="Dados do cliente" description="Clientes usados nas suas propostas.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nome" required className="sm:col-span-2" error={nomeError}>
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
              onCepError={(message) => showToast(message, "warning")}
            />
          </FormSection>
        </div>

        <SheetFooter className="shrink-0 flex-col gap-2 border-t px-4 py-3 sm:px-6 sm:py-4">
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
