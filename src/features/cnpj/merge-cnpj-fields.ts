import type { PartyAddress } from "@/lib/address";

import type { CnpjLookup } from "./api";

export function companyDisplayName(data: CnpjLookup): string {
  return data.razaoSocial || data.nomeFantasia;
}

export function mergeCnpjAddress(current: PartyAddress, from: CnpjLookup["endereco"]): PartyAddress {
  return {
    ...current,
    ...from,
    numero: from.numero || current.numero,
  };
}
