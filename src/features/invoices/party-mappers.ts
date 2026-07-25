import type { Cliente } from "@/features/clientes/types";
import type { Empresa } from "@/features/empresas/types";
import type { Item } from "@/features/itens/types";

import type { Prestador, Servico, Tomador } from "./types";

export function empresaToPrestador(empresa: Empresa, current: Prestador): Prestador {
  return {
    ...current,
    razaoSocial: empresa.nome,
    nomeFantasia: empresa.nome,
    cnpj: empresa.cnpj || current.cnpj,
    email: empresa.email || current.email,
    telefone: empresa.whatsapp || current.telefone,
    endereco: { ...empresa.endereco },
  };
}

export function clienteToTomador(cliente: Cliente, current: Tomador): Tomador {
  return {
    ...current,
    tipo: cliente.tipo,
    nome: cliente.nome,
    cpfCnpj: cliente.cpfCnpj || current.cpfCnpj,
    telefone: cliente.telefone || current.telefone,
    endereco: { ...cliente.endereco },
  };
}

export function itemToServico(item: Item, current: Servico): Servico {
  return {
    ...current,
    codigoLc116: item.codigoLc116 || current.codigoLc116,
    descricao: item.nome,
    discriminacao: item.descricao || current.discriminacao,
    valorServico: item.precoPadrao > 0 ? item.precoPadrao : current.valorServico,
    aliquotaIss: item.aliquotaIss > 0 ? item.aliquotaIss : current.aliquotaIss,
    issRetido: item.issRetido,
  };
}
