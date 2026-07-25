export type InvoiceStatus = "rascunho" | "emitida" | "cancelada";

export type PartyAddress = {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export type Prestador = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoMunicipal: string;
  email: string;
  telefone: string;
  endereco: PartyAddress;
};

export type Tomador = {
  tipo: "pf" | "pj";
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  inscricaoMunicipal: string;
  endereco: PartyAddress;
};

export type Servico = {
  codigoLc116: string;
  descricao: string;
  discriminacao: string;
  valorServico: number;
  aliquotaIss: number;
  issRetido: boolean;
  valorDeducoes: number;
  descontoIncondicionado: number;
  descontoCondicionado: number;
};

export type InvoiceForm = {
  prestador: Prestador;
  tomador: Tomador;
  servico: Servico;
  observacoes: string;
};

export type Invoice = InvoiceForm & {
  id: number;
  numero: string;
  serie: string;
  status: InvoiceStatus;
  dataEmissao: Date;
  codigoVerificacao: string | null;
};

export type InvoiceTotals = {
  baseCalculo: number;
  valorIss: number;
  valorLiquido: number;
};

export type Counters = {
  idCounter: number;
  seq: number;
};

export const LC116_SERVICES = [
  { code: "1.01", label: "1.01 — Análise e desenvolvimento de sistemas" },
  { code: "1.02", label: "1.02 — Programação" },
  { code: "1.03", label: "1.03 — Processamento de dados" },
  { code: "1.04", label: "1.04 — Elaboração de programas de computadores" },
  { code: "1.05", label: "1.05 — Licenciamento de programas" },
  { code: "7.01", label: "7.01 — Engenharia, agronomia, arquitetura" },
  { code: "17.01", label: "17.01 — Assessoria ou consultoria" },
  { code: "17.02", label: "17.02 — Análise, exame, pesquisa e coleta de dados" },
  { code: "17.06", label: "17.06 — Propaganda e publicidade" },
] as const;
