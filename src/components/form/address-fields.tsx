import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { FormField } from "@/components/form/form-field";
import { MaskedInput } from "@/components/form/masked-input";
import { Input } from "@/components/ui/input";
import { onlyDigits } from "@/lib/format";
import type { PartyAddress } from "@/lib/address";
import { cn } from "@/lib/utils";

export type AddressValue = PartyAddress;

type AddressFieldsProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  idPrefix?: string;
  errors?: Partial<Record<keyof AddressValue, string | undefined>>;
  required?: boolean;
  onLookupCep?: (cepDigits: string) => Promise<Partial<AddressValue> | null>;
  onCepError?: (message: string) => void;
};

export function AddressFields({
  value,
  onChange,
  idPrefix = "addr",
  errors = {},
  required = false,
  onLookupCep,
  onCepError,
}: AddressFieldsProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const lastLookupRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  const set = (key: keyof AddressValue, fieldValue: string) =>
    onChange({ ...valueRef.current, [key]: fieldValue });

  useEffect(() => {
    if (!onLookupCep) return;

    const digits = onlyDigits(value.cep);
    if (digits.length !== 8 || digits === lastLookupRef.current) return;

    const timer = window.setTimeout(() => {
      lastLookupRef.current = digits;
      setCepLoading(true);
      void onLookupCep(digits)
        .then((result) => {
          if (!result) {
            onCepError?.("CEP não encontrado");
            return;
          }
          const current = valueRef.current;
          onChange({
            ...current,
            ...result,
            cep: result.cep ?? current.cep,
            numero: current.numero,
          });
        })
        .catch(() => {
          onCepError?.("Não foi possível consultar o CEP");
        })
        .finally(() => {
          setCepLoading(false);
        });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [value.cep, onLookupCep, onCepError, onChange]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <FormField
        label="CEP"
        htmlFor={`${idPrefix}-cep`}
        className="sm:col-span-2"
        required={required}
        error={errors.cep}
        hint={cepLoading ? "Buscando endereço..." : undefined}
      >
        <div className="relative">
          <MaskedInput
            id={`${idPrefix}-cep`}
            mask="cep"
            placeholder="00000-000"
            value={value.cep}
            onValueChange={(v) => {
              const digits = onlyDigits(v);
              if (digits.length < 8) {
                lastLookupRef.current = "";
              }
              set("cep", v);
            }}
          />
          {cepLoading ? (
            <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </FormField>
      <FormField label="Logradouro" htmlFor={`${idPrefix}-log`} className="sm:col-span-4" required={required} error={errors.logradouro}>
        <Input
          id={`${idPrefix}-log`}
          placeholder="Rua, avenida..."
          value={value.logradouro}
          onChange={(e) => set("logradouro", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Número" htmlFor={`${idPrefix}-num`} className="sm:col-span-2" required={required} error={errors.numero}>
        <Input
          id={`${idPrefix}-num`}
          placeholder="Nº"
          value={value.numero}
          onChange={(e) => set("numero", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Complemento" htmlFor={`${idPrefix}-comp`} className="sm:col-span-2" error={errors.complemento}>
        <Input
          id={`${idPrefix}-comp`}
          placeholder="Apto, sala..."
          value={value.complemento}
          onChange={(e) => set("complemento", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Bairro" htmlFor={`${idPrefix}-bairro`} className="sm:col-span-2" required={required} error={errors.bairro}>
        <Input
          id={`${idPrefix}-bairro`}
          value={value.bairro}
          onChange={(e) => set("bairro", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Cidade" htmlFor={`${idPrefix}-cidade`} className="sm:col-span-4" required={required} error={errors.cidade}>
        <Input
          id={`${idPrefix}-cidade`}
          value={value.cidade}
          onChange={(e) => set("cidade", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="UF" htmlFor={`${idPrefix}-uf`} className="sm:col-span-2" required={required} error={errors.uf}>
        <MaskedInput
          id={`${idPrefix}-uf`}
          mask="uf"
          placeholder="BA"
          value={value.uf}
          onValueChange={(v) => set("uf", v)}
          className={cn("uppercase")}
        />
      </FormField>
    </div>
  );
}
