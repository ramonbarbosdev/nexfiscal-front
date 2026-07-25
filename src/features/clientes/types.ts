import type { PartyAddress } from "@/lib/address";

export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  endereco: PartyAddress;
  createdAt: Date;
};

export type ClienteForm = Omit<Cliente, "id" | "createdAt">;
