import { FormField } from "@/components/form/form-field";
import { MaskedInput } from "@/components/form/masked-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AddressValue = {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

type AddressFieldsProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  idPrefix?: string;
};

export function AddressFields({ value, onChange, idPrefix = "addr" }: AddressFieldsProps) {
  const set = (key: keyof AddressValue, fieldValue: string) =>
    onChange({ ...value, [key]: fieldValue });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <FormField label="CEP" htmlFor={`${idPrefix}-cep`} className="sm:col-span-2">
        <MaskedInput
          id={`${idPrefix}-cep`}
          mask="cep"
          placeholder="00000-000"
          value={value.cep}
          onValueChange={(v) => set("cep", v)}
        />
      </FormField>
      <FormField label="Logradouro" htmlFor={`${idPrefix}-log`} className="sm:col-span-4">
        <Input
          id={`${idPrefix}-log`}
          placeholder="Rua, avenida..."
          value={value.logradouro}
          onChange={(e) => set("logradouro", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Número" htmlFor={`${idPrefix}-num`} className="sm:col-span-2">
        <Input
          id={`${idPrefix}-num`}
          placeholder="Nº"
          value={value.numero}
          onChange={(e) => set("numero", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Complemento" htmlFor={`${idPrefix}-comp`} className="sm:col-span-2">
        <Input
          id={`${idPrefix}-comp`}
          placeholder="Apto, sala..."
          value={value.complemento}
          onChange={(e) => set("complemento", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Bairro" htmlFor={`${idPrefix}-bairro`} className="sm:col-span-2">
        <Input
          id={`${idPrefix}-bairro`}
          value={value.bairro}
          onChange={(e) => set("bairro", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="Cidade" htmlFor={`${idPrefix}-cidade`} className="sm:col-span-4">
        <Input
          id={`${idPrefix}-cidade`}
          value={value.cidade}
          onChange={(e) => set("cidade", e.target.value)}
          className="h-10 rounded-lg"
        />
      </FormField>
      <FormField label="UF" htmlFor={`${idPrefix}-uf`} className="sm:col-span-2">
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
