export type Empresa = {
  id: number;
  logo: string;
  nome: string;
  whatsapp: string;
  instagram: string;
  email: string;
  createdAt: Date;
};

export type EmpresaForm = Omit<Empresa, "id" | "createdAt">;
