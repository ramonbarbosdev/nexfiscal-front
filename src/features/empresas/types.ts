import type { PartyAddress } from "@/lib/address";

export type Empresa = {
  id: number;
  logo: string;
  nome: string;
  cnpj: string;
  whatsapp: string;
  instagram: string;
  email: string;
  endereco: PartyAddress;
  createdAt: Date;
};

export type EmpresaForm = Omit<Empresa, "id" | "createdAt">;
