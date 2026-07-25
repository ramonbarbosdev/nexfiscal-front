export type ProposalStatus = "pendente" | "aprovada" | "cancelada";

export type ProposalItem = {
  id: number;
  desc: string;
  qtd: number;
  valor: number;
};

export type ProposalForm = {
  empresa: {
    logo: string;
    nome: string;
    whatsapp: string;
    instagram: string;
    email: string;
  };
  cliente: {
    nome: string;
    telefone: string;
  };
  projeto: {
    titulo: string;
    descricao: string;
    area: string;
    prazo: string;
    validade: string;
  };
  itens: ProposalItem[];
  desconto: number;
  entrada: number;
  formaPagamento: string;
  observacoes: string;
};

export type Proposal = ProposalForm & {
  id: number;
  numero: string;
  status: ProposalStatus;
  createdAt: Date;
};

export type Counters = {
  idCounter: number;
  seq: number;
  itemIdCounter: number;
};
