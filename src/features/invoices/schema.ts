import { z } from "zod";

import {
  addressEmitSchema,
  addressSchema,
  cnpjRequiredSchema,
  cpfCnpjSchema,
  optionalCnpjSchema,
  optionalCpfCnpjSchema,
  optionalEmailSchema,
} from "@/lib/zod-helpers";

import { LC116_SERVICES } from "./types";

const lc116Codes = LC116_SERVICES.map((s) => s.code) as [string, ...string[]];

const servicoBaseSchema = z.object({
  codigoLc116: z.enum(lc116Codes, { message: "Selecione o código LC 116" }),
  descricao: z.string().trim().min(1, "Informe a descrição do serviço"),
  discriminacao: z.string(),
  valorServico: z.number().min(0.01, "Informe o valor do serviço"),
  aliquotaIss: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(100, "Alíquota não pode passar de 100%"),
  issRetido: z.boolean(),
  valorDeducoes: z.number().min(0, "Deduções não podem ser negativas"),
  descontoIncondicionado: z.number().min(0, "Desconto não pode ser negativo"),
  descontoCondicionado: z.number().min(0, "Desconto não pode ser negativo"),
});

const prestadorEmitSchema = z.object({
  razaoSocial: z.string().trim().min(1, "Informe a razão social do prestador"),
  nomeFantasia: z.string(),
  cnpj: cnpjRequiredSchema,
  inscricaoMunicipal: z.string().trim().min(1, "Informe a inscrição municipal"),
  email: optionalEmailSchema,
  telefone: z.string(),
  endereco: addressEmitSchema,
});

const tomadorEmitSchema = z
  .object({
    tipo: z.enum(["pf", "pj"]),
    nome: z.string().trim().min(1, "Informe o nome do tomador"),
    cpfCnpj: z.string(),
    email: optionalEmailSchema,
    telefone: z.string(),
    inscricaoMunicipal: z.string(),
    endereco: addressEmitSchema,
  })
  .superRefine((data, ctx) => {
    const schema = cpfCnpjSchema(data.tipo, data.tipo === "pf" ? "CPF" : "CNPJ");
    const result = schema.safeParse(data.cpfCnpj);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error.issues[0]?.message ?? "Documento inválido",
        path: ["cpfCnpj"],
      });
    }
  });

export const invoiceEmitSchema = z.object({
  prestador: prestadorEmitSchema,
  tomador: tomadorEmitSchema,
  servico: servicoBaseSchema,
  observacoes: z.string(),
});

export const invoiceDraftSchema = z.object({
  prestador: z.object({
    razaoSocial: z.string(),
    nomeFantasia: z.string(),
    cnpj: optionalCnpjSchema,
    inscricaoMunicipal: z.string(),
    email: optionalEmailSchema,
    telefone: z.string(),
    endereco: addressSchema,
  }),
  tomador: z
    .object({
      tipo: z.enum(["pf", "pj"]),
      nome: z.string(),
      cpfCnpj: z.string(),
      email: optionalEmailSchema,
      telefone: z.string(),
      inscricaoMunicipal: z.string(),
      endereco: addressSchema,
    })
    .superRefine((data, ctx) => {
      if (!data.cpfCnpj.trim()) return;
      const schema = optionalCpfCnpjSchema(data.tipo);
      const result = schema.safeParse(data.cpfCnpj);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message ?? "Documento inválido",
          path: ["cpfCnpj"],
        });
      }
    }),
  servico: servicoBaseSchema.partial().extend({
    codigoLc116: z.string(),
    descricao: z.string(),
    discriminacao: z.string(),
    valorServico: z.number().min(0, "Valor não pode ser negativo"),
    aliquotaIss: z.number().min(0).max(100, "Alíquota não pode passar de 100%"),
    issRetido: z.boolean(),
    valorDeducoes: z.number().min(0),
    descontoIncondicionado: z.number().min(0),
    descontoCondicionado: z.number().min(0),
  }),
  observacoes: z.string(),
});

export type InvoiceTabId = "prestador" | "tomador" | "servico";

export function invoicePathToTab(path: string): InvoiceTabId | null {
  if (path.startsWith("prestador")) return "prestador";
  if (path.startsWith("tomador")) return "tomador";
  if (path.startsWith("servico") || path === "observacoes") return "servico";
  return null;
}

export function getInvoiceWarnings(form: z.input<typeof invoiceEmitSchema>): string[] {
  const warnings: string[] = [];
  if (!form.servico.discriminacao?.trim()) {
    warnings.push("Discriminação do serviço vazia — recomendado para a NFS-e.");
  }
  if (!form.tomador.email?.trim()) warnings.push("Tomador sem e-mail cadastrado.");
  if (!form.prestador.email?.trim()) warnings.push("Prestador sem e-mail cadastrado.");
  const addr = form.prestador.endereco;
  if (!addr.logradouro?.trim() || !addr.cidade?.trim()) {
    warnings.push("Endereço do prestador incompleto.");
  }
  return warnings;
}
