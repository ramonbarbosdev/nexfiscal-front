export type ItemTipo = "produto" | "servico";

export type Item = {
  id: number;
  tipo: ItemTipo;
  nome: string;
  descricao: string;
  codigoLc116: string;
  precoPadrao: number;
  aliquotaIss: number;
  issRetido: boolean;
  unidade: string;
  codigoInterno: string;
  ativo: boolean;
  createdAt: Date;
};

export type ItemForm = Omit<Item, "id" | "createdAt">;

export const ITEM_TIPO_OPTIONS: { value: ItemTipo; label: string }[] = [
  { value: "servico", label: "Serviço" },
  { value: "produto", label: "Produto" },
];

export const ITEM_UNIDADE_OPTIONS = [
  { value: "un", label: "Unidade (un)" },
  { value: "hr", label: "Hora (hr)" },
  { value: "dia", label: "Dia" },
  { value: "m²", label: "Metro quadrado (m²)" },
  { value: "m", label: "Metro (m)" },
  { value: "kg", label: "Quilograma (kg)" },
  { value: "pct", label: "Pacote (pct)" },
];

export function itemTipoLabel(tipo: ItemTipo): string {
  return ITEM_TIPO_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo;
}
