import { onlyDigits } from "@/lib/format";

export type MaskType = "phone" | "cpf" | "cnpj" | "cpfCnpj" | "cep" | "uf" | "currency";

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskCep(value: string) {
  return onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCnpj(value: string) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function maskCpfCnpj(value: string) {
  const digits = onlyDigits(value);
  return digits.length <= 11 ? maskCpf(value) : maskCnpj(value);
}

export function maskUf(value: string) {
  return value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
}

export function applyMask(value: string, type: MaskType) {
  switch (type) {
    case "phone":
      return maskPhone(value);
    case "cpf":
      return maskCpf(value);
    case "cnpj":
      return maskCnpj(value);
    case "cpfCnpj":
      return maskCpfCnpj(value);
    case "cep":
      return maskCep(value);
    case "uf":
      return maskUf(value);
    default:
      return value;
  }
}

export function parseCurrencyInput(value: string) {
  const digits = onlyDigits(value);
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function maskCurrencyInput(value: string) {
  const amount = parseCurrencyInput(value);
  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyDisplay(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
