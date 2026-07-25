export type PartyAddress = {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export function blankAddress(): PartyAddress {
  return {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  };
}

export function formatAddressLine(address: PartyAddress): string {
  const parts = [
    address.cidade && address.uf ? `${address.cidade}/${address.uf}` : address.cidade || address.uf,
    address.bairro,
  ].filter(Boolean);
  return parts.join(" · ");
}
