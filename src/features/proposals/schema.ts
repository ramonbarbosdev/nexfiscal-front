import { z } from "zod";

import { optionalEmailSchema } from "@/lib/zod-helpers";

const proposalItemSchema = z.object({
  id: z.number(),
  desc: z.string().trim().min(1, "Descrição do item é obrigatória"),
  qtd: z.number().min(1, "Quantidade mínima é 1"),
  valor: z.number().min(0.01, "Informe o valor do item"),
});

export const proposalFormSchema = z
  .object({
    empresa: z.object({
      logo: z.string(),
      nome: z.string().trim().min(1, "Informe o nome da empresa"),
      whatsapp: z.string(),
      instagram: z.string(),
      email: optionalEmailSchema,
    }),
    cliente: z.object({
      nome: z.string().trim().min(1, "Informe o nome do cliente"),
      telefone: z.string(),
    }),
    projeto: z.object({
      titulo: z.string(),
      descricao: z.string(),
      area: z.string(),
      prazo: z.string(),
      validade: z.string(),
    }),
    itens: z.array(proposalItemSchema).min(1, "Adicione pelo menos um item"),
    desconto: z.number().min(0, "Desconto não pode ser negativo"),
    entrada: z.number().min(0, "Entrada não pode ser negativa"),
    formaPagamento: z.string(),
    observacoes: z.string(),
  })
  .superRefine((data, ctx) => {
    const subtotal = data.itens.reduce((sum, item) => sum + item.qtd * item.valor, 0);
    const total = Math.max(subtotal - data.desconto, 0);
    if (data.entrada > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Entrada não pode ser maior que o total",
        path: ["entrada"],
      });
    }
    if (data.desconto > subtotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Desconto não pode ser maior que o subtotal",
        path: ["desconto"],
      });
    }
  });

export type ProposalFormInput = z.infer<typeof proposalFormSchema>;

export type ProposalTabId = "empresa" | "cliente" | "projeto" | "financeiro";

export function proposalPathToTab(path: string): ProposalTabId | null {
  if (path.startsWith("empresa")) return "empresa";
  if (path.startsWith("cliente")) return "cliente";
  if (path.startsWith("projeto") || path.startsWith("itens")) return "projeto";
  if (
    path === "desconto" ||
    path === "entrada" ||
    path === "formaPagamento" ||
    path === "observacoes"
  ) {
    return "financeiro";
  }
  return null;
}

export function getProposalWarnings(form: z.input<typeof proposalFormSchema>): string[] {
  const warnings: string[] = [];
  if (!form.projeto.titulo?.trim()) warnings.push("Projeto sem título — a proposta ficará sem identificação clara.");
  if (!form.empresa.email?.trim()) warnings.push("E-mail da empresa não informado.");
  if (!form.projeto.descricao?.trim()) warnings.push("Descrição do projeto vazia.");
  if (!form.formaPagamento?.trim()) warnings.push("Forma de pagamento não definida.");
  return warnings;
}
