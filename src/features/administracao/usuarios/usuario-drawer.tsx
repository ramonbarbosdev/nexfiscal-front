import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/form/delete-confirm-dialog";
import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { inputClassName } from "@/components/form/masked-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

import type { Papel, Usuario, UsuarioForm } from "./types";

type UsuarioDrawerProps = {
  open: boolean;
  editingUsuario: Usuario | null;
  form: UsuarioForm | null;
  papeis: Papel[];
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: UsuarioForm) => void;
  onSave: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  canDelete?: boolean;
};

export function UsuarioDrawer({
  open,
  editingUsuario,
  form,
  papeis,
  onOpenChange,
  onFormChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  canDelete,
}: UsuarioDrawerProps) {
  const [nomeError, setNomeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [papeisError, setPapeisError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setNomeError("");
      setEmailError("");
      setSenhaError("");
      setPapeisError("");
      setDeleteOpen(false);
    }
  }, [open, editingUsuario?.id]);

  if (!form) return null;

  const update = <K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]) => {
    if (key === "nome") setNomeError("");
    if (key === "email") setEmailError("");
    if (key === "senha") setSenhaError("");
    if (key === "papeis") setPapeisError("");
    onFormChange({ ...form, [key]: value });
  };

  const togglePapel = (nome: string, checked: boolean) => {
    const next = checked
      ? [...form.papeis, nome]
      : form.papeis.filter((p) => p.toUpperCase() !== nome.toUpperCase());
    update("papeis", next);
  };

  const handleSave = () => {
    let valid = true;
    if (!form.nome.trim()) {
      setNomeError("Informe o nome do usuário");
      valid = false;
    }
    if (!form.email.trim()) {
      setEmailError("Informe o e-mail");
      valid = false;
    }
    if (!editingUsuario && !form.senha.trim()) {
      setSenhaError("Informe a senha");
      valid = false;
    } else if (form.senha.trim() && form.senha.trim().length < 6) {
      setSenhaError("A senha deve ter pelo menos 6 caracteres");
      valid = false;
    }
    if (form.papeis.length === 0) {
      setPapeisError("Selecione ao menos um perfil");
      valid = false;
    }
    if (!valid) return;
    onSave();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <SheetTitle>{editingUsuario ? "Editar usuário" : "Novo usuário"}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <FormSection title="Dados do usuário" description="Credenciais de acesso ao sistema.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nome" required className="sm:col-span-2" error={nomeError}>
                <Input
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label="E-mail" required className="sm:col-span-2" error={emailError}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClassName}
                  autoComplete="off"
                />
              </FormField>
              <FormField
                label={editingUsuario ? "Nova senha" : "Senha"}
                required={!editingUsuario}
                className="sm:col-span-2"
                error={senhaError}
                hint={editingUsuario ? "Deixe em branco para manter a senha atual." : undefined}
              >
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => update("senha", e.target.value)}
                  className={inputClassName}
                  autoComplete="new-password"
                />
              </FormField>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 sm:col-span-2">
                <div>
                  <Label htmlFor="usuario-ativo" className="text-sm font-medium">
                    Usuário ativo
                  </Label>
                  <p className="text-xs text-muted-foreground">Usuários inativos não conseguem entrar.</p>
                </div>
                <Switch
                  id="usuario-ativo"
                  checked={form.ativo}
                  onCheckedChange={(checked) => update("ativo", checked)}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Perfis de acesso" description="Defina o que este usuário pode fazer no sistema.">
            {papeisError ? <p className="mb-3 text-sm text-destructive">{papeisError}</p> : null}
            <div className="space-y-2">
              {papeis.map((papel) => {
                const checked = form.papeis.some((p) => p.toUpperCase() === papel.nome.toUpperCase());
                return (
                  <label
                    key={papel.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => togglePapel(papel.nome, value === true)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{papel.nome}</span>
                      {papel.descricao ? (
                        <span className="block text-xs text-muted-foreground">{papel.descricao}</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </FormSection>
        </div>

        <SheetFooter className="relative z-10 shrink-0 flex-col gap-2 border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
          {editingUsuario && onDelete && canDelete ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Desativar usuário
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
        title="Desativar usuário?"
        description={`O usuário "${editingUsuario?.nome ?? ""}" será desativado e não poderá mais acessar o sistema.`}
        onConfirm={() => onDelete?.()}
        isDeleting={isDeleting}
        confirmLabel="Desativar"
      />
    </Sheet>
  );
}
