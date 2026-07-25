import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { applyMask, type MaskType } from "@/lib/masks";

const inputClassName = "h-10 rounded-lg";

type MaskedInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  mask: MaskType;
  value: string;
  onValueChange: (value: string) => void;
};

export function MaskedInput({
  mask,
  value,
  onValueChange,
  className,
  inputMode,
  ...props
}: MaskedInputProps) {
  const resolvedInputMode =
    inputMode ??
    (mask === "phone" || mask === "cep" || mask === "currency" ? "numeric" : undefined);

  return (
    <Input
      {...props}
      inputMode={resolvedInputMode}
      value={value}
      onChange={(e) => onValueChange(applyMask(e.target.value, mask))}
      className={cn(inputClassName, className)}
    />
  );
}

export { inputClassName };
