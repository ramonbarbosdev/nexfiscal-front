import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmClose } from "@/components/form/confirm-close";
import { CurrencyInput } from "@/components/form/currency-input";
import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { inputClassName } from "@/components/form/masked-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LC116_SERVICES } from "@/features/invoices/types";

import { ITEM_TIPO_OPTIONS, ITEM_UNIDADE_OPTIONS, type Item, type ItemForm, type ItemTipo } from "./types";

type ItemDrawerProps = {
  open: boolean;
  editingItem: Item | null;
  form: ItemForm | null;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: ItemForm) => void;
  onSave: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  isDirty?: boolean;
};

export function ItemDrawer({
  open,
  editingItem,
  form,
  onOpenChange,
  onFormChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  isDirty = false,
}: ItemDrawerProps) {
  const [nomeError, setNomeError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setNomeError("");
      setDeleteOpen(false);
    }
  }, [open, editingItem?.id]);

  if (!form) return null;

  const isServico = form.tipo === "servico";

  const update = <K extends keyof ItemForm>(key: K, value: ItemForm[K]) => {
    if (key === "nome") setNomeError("");
    onFormChange({ ...form, [key]: value });
  };

  const handleTipoChange = (tipo: ItemTipo) => {
    onFormChange({
      ...form,
      tipo,
      unidade: tipo === "produto" ? form.unidade || "un" : "un",
      codigoLc116: tipo === "servico" ? form.codigoLc116 : "",
      aliquotaIss: tipo === "servico" ? form.aliquotaIss : 0,
      issRetido: tipo === "servico" ? form.issRetido : false,
    });
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      setNomeError("Informe o nome do item");
      return;
    }
    onSave();
  };

  return (
    <ConfirmClose open={open} onOpenChange={onOpenChange} isDirty={isDirty}>
      {({ requestClose, handleOpenChange }) => (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
            <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
              <SheetTitle>{editingItem ? "Editar item" : "Novo item"}</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <FormSection
                title="Identificação"
                description="Produtos e serviços reutilizáveis em propostas e notas fiscais."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Tipo" className="sm:col-span-2">
                    <Select value={form.tipo} onValueChange={(v) => handleTipoChange(v as ItemTipo)}>
                      <SelectTrigger className={inputClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_TIPO_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Nome" required className="sm:col-span-2" error={nomeError}>
                    <Input
                      value={form.nome}
                      onChange={(e) => update("nome", e.target.value)}
                      className={inputClassName}
                      placeholder={isServico ? "Ex.: Consultoria em TI" : "Ex.: Licença de software"}
                    />
                  </FormField>
                  <FormField label="Código interno" className="sm:col-span-2">
                    <Input
                      value={form.codigoInterno}
                      onChange={(e) => update("codigoInterno", e.target.value)}
                      className={inputClassName}
                      placeholder="SKU, referência ou código próprio"
                    />
                  </FormField>
                  <FormField label="Descrição" className="sm:col-span-2">
                    <Textarea
                      value={form.descricao}
                      onChange={(e) => update("descricao", e.target.value)}
                      className={`min-h-[88px] ${inputClassName}`}
                      placeholder="Detalhes usados na discriminação do serviço ou descrição do produto"
                    />
                  </FormField>
                  <FormField label="Preço padrão">
                    <CurrencyInput
                      value={form.precoPadrao}
                      onValueChange={(v) => update("precoPadrao", v)}
                    />
                  </FormField>
                  {!isServico ? (
                    <FormField label="Unidade">
                      <Select value={form.unidade} onValueChange={(v) => update("unidade", v)}>
                        <SelectTrigger className={inputClassName}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_UNIDADE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  ) : null}
                </div>
              </FormSection>

              {isServico ? (
                <FormSection title="NFS-e" description="Dados fiscais padrão para emissão de nota.">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Código LC 116" className="sm:col-span-2">
                      <Select
                        value={form.codigoLc116 || undefined}
                        onValueChange={(v) => update("codigoLc116", v)}
                      >
                        <SelectTrigger className={inputClassName}>
                          <SelectValue placeholder="Selecione o código" />
                        </SelectTrigger>
                        <SelectContent>
                          {LC116_SERVICES.map((service) => (
                            <SelectItem key={service.code} value={service.code}>
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Alíquota ISS (%)">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={form.aliquotaIss}
                        onChange={(e) => update("aliquotaIss", Number(e.target.value) || 0)}
                        className={inputClassName}
                      />
                    </FormField>
                    <FormField label="ISS retido">
                      <label className="flex h-10 items-center gap-2 rounded-lg border border-border px-3">
                        <Checkbox
                          checked={form.issRetido}
                          onCheckedChange={(checked) => update("issRetido", checked === true)}
                        />
                        <span className="text-sm">Retido na fonte</span>
                      </label>
                    </FormField>
                  </div>
                </FormSection>
              ) : null}

              <FormSection title="Status">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={form.ativo}
                    onCheckedChange={(checked) => update("ativo", checked === true)}
                  />
                  <span className="text-sm">Item ativo no catálogo</span>
                </label>
              </FormSection>
            </div>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t px-4 py-3 sm:px-6 sm:py-4">
              {editingItem && onDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isSaving || isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir item
                </Button>
              ) : null}
              <div className="flex w-full gap-2">
                <Button type="button" variant="outline" className="h-11 flex-1 rounded-lg" onClick={requestClose}>
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
            title="Excluir item?"
            description={`O item "${editingItem?.nome ?? ""}" será removido permanentemente do catálogo.`}
            onConfirm={() => onDelete?.()}
            isDeleting={isDeleting}
          />
        </Sheet>
      )}
    </ConfirmClose>
  );
}
