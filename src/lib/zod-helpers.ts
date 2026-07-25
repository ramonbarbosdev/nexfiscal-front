import { z } from "zod";

import { onlyDigits } from "@/lib/format";

export type FieldErrors = Record<string, string>;

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

export function getFieldError(errors: FieldErrors, path: string): string | undefined {
  return errors[path];
}

export function listErrorMessages(errors: FieldErrors): string[] {
  return [...new Set(Object.values(errors))];
}

export function formatValidationToast(messages: string[], kind: "error" | "warning") {
  if (messages.length === 0) return "";
  if (messages.length === 1) return messages[0];

  const noun = kind === "error" ? "erro" : "aviso";
  const rest = messages.length - 1;
  return `${messages[0]} (+${rest} ${rest === 1 ? `outro ${noun}` : `outros ${noun}s`})`;
}

export function tabsWithErrors<T extends string>(
  errors: FieldErrors,
  mapPathToTab: (path: string) => T | null,
): Set<T> {
  const tabs = new Set<T>();
  for (const path of Object.keys(errors)) {
    const tab = mapPathToTab(path);
    if (tab) tabs.add(tab);
  }
  return tabs;
}

export function firstTabWithErrors<T extends string>(
  errors: FieldErrors,
  tabOrder: T[],
  mapPathToTab: (path: string) => T | null,
): T | null {
  const invalid = tabsWithErrors(errors, mapPathToTab);
  return tabOrder.find((tab) => invalid.has(tab)) ?? null;
}

export const optionalEmailSchema = z
  .string()
  .refine((v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), "E-mail inválido");

export const requiredEmailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail")
  .email("E-mail inválido");

export function cpfCnpjSchema(tipo: "pf" | "pj", label?: string) {
  const name = label ?? (tipo === "pf" ? "CPF" : "CNPJ");
  const length = tipo === "pf" ? 11 : 14;
  return z
    .string()
    .trim()
    .min(1, `Informe o ${name}`)
    .refine((v) => onlyDigits(v).length === length, `${name} deve ter ${length} dígitos`);
}

export function optionalCpfCnpjSchema(tipo: "pf" | "pj", label?: string) {
  const name = label ?? (tipo === "pf" ? "CPF" : "CNPJ");
  const length = tipo === "pf" ? 11 : 14;
  return z
    .string()
    .refine((v) => !v.trim() || onlyDigits(v).length === length, `${name} inválido`);
}

export const cnpjRequiredSchema = z
  .string()
  .trim()
  .min(1, "Informe o CNPJ")
  .refine((v) => onlyDigits(v).length === 14, "CNPJ deve ter 14 dígitos");

export const optionalCnpjSchema = z
  .string()
  .refine((v) => !v.trim() || onlyDigits(v).length === 14, "CNPJ inválido");

export const addressSchema = z.object({
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
  cep: z.string(),
});

export const addressEmitSchema = addressSchema.extend({
  logradouro: z.string().trim().min(1, "Informe o logradouro"),
  numero: z.string().trim().min(1, "Informe o número"),
  bairro: z.string().trim().min(1, "Informe o bairro"),
  cidade: z.string().trim().min(1, "Informe a cidade"),
  uf: z.string().trim().length(2, "UF deve ter 2 letras"),
  cep: z
    .string()
    .trim()
    .min(1, "Informe o CEP")
    .refine((v) => onlyDigits(v).length === 8, "CEP deve ter 8 dígitos"),
});
