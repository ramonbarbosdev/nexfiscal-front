export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  createdAt: Date;
};

export type ClienteForm = Omit<Cliente, "id" | "createdAt">;
