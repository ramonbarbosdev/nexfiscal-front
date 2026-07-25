export type Papel = {
  id: number;
  nome: string;
  descricao: string;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  papeis: string[];
  createdAt: Date;
};

export type UsuarioForm = {
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  papeis: string[];
};
