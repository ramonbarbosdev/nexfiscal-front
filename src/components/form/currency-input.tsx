import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrencyDisplay, maskCurrencyInput, parseCurrencyInput } from "@/lib/masks";

import { inputClassName } from "./masked-input";

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  value: number;
  onValueChange: (value: number) => void;
};

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        {...props}
        inputMode="numeric"
        value={value ? formatCurrencyDisplay(value) : ""}
        placeholder="0,00"
        onChange={(e) => onValueChange(parseCurrencyInput(e.target.value))}
        onBlur={(e) => {
          onValueChange(parseCurrencyInput(e.target.value));
          props.onBlur?.(e);
        }}
        className={cn(inputClassName, "pl-9 text-right font-mono-app tabular-nums", className)}
      />
    </div>
  );
}

export function CurrencyInputRaw({
  value,
  onValueChange,
  className,
  ...props
}: CurrencyInputProps) {
  const display = value ? maskCurrencyInput(String(Math.round(value * 100))) : "";

  return (
    <Input
      {...props}
      inputMode="numeric"
      value={display}
      placeholder="0,00"
      onChange={(e) => onValueChange(parseCurrencyInput(e.target.value))}
      className={cn(inputClassName, "text-right font-mono-app tabular-nums", className)}
    />
  );
}
