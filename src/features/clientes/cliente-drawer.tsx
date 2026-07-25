import { useEffect, useState } from "react";

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

import type { Cliente, ClienteForm } from "./types";

type ClienteDrawerProps = {
  open: boolean;
  editingCliente: Cliente | null;
  form: ClienteForm | null;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: ClienteForm) => void;
  onSave: () => void;
  isSaving?: boolean;
};

export function ClienteDrawer({
  open,
  editingCliente,
  form,
  onOpenChange,
  onFormChange,
  onSave,
  isSaving,
}: ClienteDrawerProps) {
  const [nomeError, setNomeError] = useState("");

  useEffect(() => {
    if (open) setNomeError("");
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
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
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
        </div>

        <SheetFooter className="shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4">
          <Button variant="outline" className="h-11 flex-1 rounded-lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="h-11 flex-1 rounded-lg" onClick={handleSave} disabled={isSaving}>
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
