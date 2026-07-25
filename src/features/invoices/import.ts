import { formatCpfCnpj, onlyDigits } from "@/lib/format";

import type { Invoice, InvoiceForm, InvoiceStatus, PartyAddress } from "./types";
import { blankAddress, blankPrestador } from "./utils";

export type ImportParseResult = {
  items: InvoiceImportItem[];
  errors: string[];
};

export type InvoiceImportItem = {
  numero?: string;
  serie?: string;
  status?: InvoiceStatus;
  dataEmissao?: string | Date;
  codigoVerificacao?: string | null;
  form: InvoiceForm;
};

export type ImportFileType = "json" | "xml" | "csv";

const EXPORT_VERSION = 1;

export function detectImportType(file: File): ImportFileType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".xml")) return "xml";
  if (name.endsWith(".csv")) return "csv";
  if (file.type === "application/json") return "json";
  if (file.type.includes("xml")) return "xml";
  if (file.type === "text/csv") return "csv";
  return null;
}

export function parseImportFile(content: string, type: ImportFileType): ImportParseResult {
  switch (type) {
    case "json":
      return parseJsonImport(content);
    case "xml":
      return parseXmlImport(content);
    case "csv":
      return parseCsvImport(content);
  }
}

export function serializeInvoicesForExport(invoices: Invoice[]) {
  return JSON.stringify(
    {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      invoices: invoices.map((invoice) => ({
        ...invoice,
        dataEmissao: invoice.dataEmissao.toISOString(),
      })),
    },
    null,
    2,
  );
}

function parseJsonImport(content: string): ImportParseResult {
  const errors: string[] = [];
  try {
    const data = JSON.parse(content) as unknown;
    const rawList = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "invoices" in data
        ? (data as { invoices: unknown }).invoices
        : [data];

    if (!Array.isArray(rawList)) {
      return { items: [], errors: ["JSON inválido: esperado array de notas."] };
    }

    const items: InvoiceImportItem[] = [];
    rawList.forEach((entry, index) => {
      const normalized = normalizeImportEntry(entry, index + 1, errors);
      if (normalized) items.push(normalized);
    });

    return { items, errors };
  } catch {
    return { items: [], errors: ["Não foi possível ler o arquivo JSON."] };
  }
}

function parseXmlImport(content: string): ImportParseResult {
  const errors: string[] = [];
  if (typeof DOMParser === "undefined") {
    return { items: [], errors: ["Importação XML disponível apenas no navegador."] };
  }

  const doc = new DOMParser().parseFromString(content, "application/xml");
  if (doc.querySelector("parsererror")) {
    return { items: [], errors: ["XML inválido ou corrompido."] };
  }

  const nfseNodes = [
    ...doc.getElementsByTagName("InfNfse"),
    ...doc.getElementsByTagName("infNFSe"),
    ...doc.getElementsByTagName("Nfse"),
  ];

  const uniqueRoots = nfseNodes.length
    ? nfseNodes
    : [doc.documentElement];

  const items: InvoiceImportItem[] = [];
  uniqueRoots.forEach((node, index) => {
    const item = parseXmlNfseNode(node, index + 1, errors);
    if (item) items.push(item);
  });

  if (items.length === 0) {
    errors.push("Nenhuma NFS-e encontrada no XML.");
  }

  return { items, errors };
}

function parseXmlNfseNode(node: Element, line: number, errors: string[]): InvoiceImportItem | null {
  const numero = xmlText(node, "Numero", "nNFSe", "NumeroNfse") || undefined;
  const codigoVerificacao = xmlText(node, "CodigoVerificacao", "CodigoAutenticacao") || null;
  const dataEmissao = xmlText(node, "DataEmissao", "dhEmi", "DataEmissaoNfse") || undefined;
  const serie = xmlText(node, "Serie", "serie") || "1";

  const valorServico = xmlNumber(node, "ValorServicos", "vServ", "ValorServico");
  const aliquotaIss = xmlNumber(node, "Aliquota", "pAliq", "AliquotaIss");
  const valorDeducoes = xmlNumber(node, "ValorDeducoes");
  const descontoIncondicionado = xmlNumber(node, "DescontoIncondicionado");
  const descontoCondicionado = xmlNumber(node, "DescontoCondicionado");
  const issRetido = xmlText(node, "IssRetido") === "1" || xmlText(node, "IssRetido")?.toLowerCase() === "true";

  const prestadorNode = xmlFirst(node, "PrestadorServico", "Prestador", "emit");
  const tomadorNode = xmlFirst(node, "TomadorServico", "Tomador", "dest");
  const servicoNode = xmlFirst(node, "Servico", "ServicoNFSe", "det");

  const prestadorCnpj =
    xmlText(prestadorNode, "Cnpj", "CNPJ", "CpfCnpj") ||
    xmlText(xmlFirst(prestadorNode, "IdentificacaoPrestador"), "Cnpj", "CNPJ");

  const tomadorDoc =
    xmlText(tomadorNode, "CpfCnpj", "Cnpj", "CNPJ", "Cpf") ||
    xmlText(xmlFirst(tomadorNode, "IdentificacaoTomador"), "CpfCnpj", "Cnpj", "Cpf");

  const form: InvoiceForm = {
    prestador: {
      razaoSocial: xmlText(prestadorNode, "RazaoSocial", "xNome") || "",
      nomeFantasia: xmlText(prestadorNode, "NomeFantasia") || "",
      cnpj: prestadorCnpj ? formatCpfCnpj(prestadorCnpj) : "",
      inscricaoMunicipal:
        xmlText(prestadorNode, "InscricaoMunicipal") ||
        xmlText(xmlFirst(prestadorNode, "IdentificacaoPrestador"), "InscricaoMunicipal") ||
        "",
      email: xmlText(prestadorNode, "Email") || "",
      telefone: xmlText(prestadorNode, "Telefone") || "",
      endereco: parseXmlAddress(xmlFirst(prestadorNode, "Endereco")),
    },
    tomador: {
      tipo: onlyDigits(tomadorDoc).length > 11 ? "pj" : "pf",
      nome:
        xmlText(tomadorNode, "RazaoSocial", "xNome", "Nome") ||
        xmlText(xmlFirst(tomadorNode, "IdentificacaoTomador"), "RazaoSocial") ||
        "",
      cpfCnpj: tomadorDoc ? formatCpfCnpj(tomadorDoc) : "",
      email: xmlText(tomadorNode, "Email") || "",
      telefone: xmlText(tomadorNode, "Telefone") || "",
      inscricaoMunicipal: xmlText(tomadorNode, "InscricaoMunicipal") || "",
      endereco: parseXmlAddress(xmlFirst(tomadorNode, "Endereco")),
    },
    servico: {
      codigoLc116: formatLc116(xmlText(servicoNode, "ItemListaServico", "cTribNac", "CodigoTributacaoMunicipio")),
      descricao: xmlText(servicoNode, "Discriminacao", "xDescServ") || "Serviço importado",
      discriminacao: xmlText(servicoNode, "Discriminacao", "xDescServ") || "",
      valorServico,
      aliquotaIss: aliquotaIss || 5,
      issRetido,
      valorDeducoes,
      descontoIncondicionado,
      descontoCondicionado,
    },
    observacoes: xmlText(node, "OutrasInformacoes", "Observacao") || "",
  };

  if (!form.prestador.razaoSocial && !form.tomador.nome && valorServico === 0) {
    errors.push(`Nota ${line}: XML sem dados suficientes.`);
    return null;
  }

  return {
    numero,
    serie,
    status: "emitida",
    dataEmissao,
    codigoVerificacao,
    form,
  };
}

function parseCsvImport(content: string): ImportParseResult {
  const errors: string[] = [];
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return { items: [], errors: ["CSV vazio ou sem linhas de dados."] };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const items: InvoiceImportItem[] = [];

  lines.slice(1).forEach((line, index) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cols[i]?.trim() ?? "";
    });

    const form: InvoiceForm = {
      prestador: {
        ...blankPrestador(),
        razaoSocial: row.prestador_razao || row.razao_social_prestador || "",
        cnpj: row.prestador_cnpj ? formatCpfCnpj(row.prestador_cnpj) : "",
        inscricaoMunicipal: row.prestador_im || "",
        email: row.prestador_email || "",
        telefone: row.prestador_telefone || "",
      },
      tomador: {
        tipo: onlyDigits(row.tomador_cpf_cnpj || row.tomador_cnpj || "").length > 11 ? "pj" : "pf",
        nome: row.tomador_nome || "",
        cpfCnpj: formatCpfCnpj(row.tomador_cpf_cnpj || row.tomador_cnpj || row.tomador_cpf || ""),
        email: row.tomador_email || "",
        telefone: row.tomador_telefone || "",
        inscricaoMunicipal: row.tomador_im || "",
        endereco: blankAddress(),
      },
      servico: {
        codigoLc116: formatLc116(row.codigo_lc116 || row.codigo_servico || "17.01"),
        descricao: row.servico_descricao || row.descricao || "",
        discriminacao: row.servico_discriminacao || row.discriminacao || "",
        valorServico: parseNumber(row.valor_servico || row.valor),
        aliquotaIss: parseNumber(row.aliquota_iss || row.aliquota) || 5,
        issRetido: ["1", "true", "sim"].includes((row.iss_retido || "").toLowerCase()),
        valorDeducoes: parseNumber(row.valor_deducoes),
        descontoIncondicionado: parseNumber(row.desconto_incondicionado),
        descontoCondicionado: parseNumber(row.desconto_condicionado),
      },
      observacoes: row.observacoes || "",
    };

    if (!form.tomador.nome && !form.servico.descricao) {
      errors.push(`Linha ${index + 2}: dados insuficientes.`);
      return;
    }

    items.push({
      numero: row.numero || undefined,
      serie: row.serie || "1",
      status: parseStatus(row.status),
      dataEmissao: row.data_emissao || undefined,
      codigoVerificacao: row.codigo_verificacao || null,
      form,
    });
  });

  return { items, errors };
}

function normalizeImportEntry(
  entry: unknown,
  line: number,
  errors: string[],
): InvoiceImportItem | null {
  if (!entry || typeof entry !== "object") {
    errors.push(`Item ${line}: formato inválido.`);
    return null;
  }

  const raw = entry as Record<string, unknown>;
  const form = (raw.form as InvoiceForm | undefined) ?? (raw as unknown as InvoiceForm);

  if (!form.prestador || !form.tomador || !form.servico) {
    const reconstructed: InvoiceForm = {
      prestador: (raw.prestador as InvoiceForm["prestador"]) ?? blankPrestador(),
      tomador: (raw.tomador as InvoiceForm["tomador"]) ?? {
        tipo: "pj",
        nome: "",
        cpfCnpj: "",
        email: "",
        telefone: "",
        inscricaoMunicipal: "",
        endereco: blankAddress(),
      },
      servico: (raw.servico as InvoiceForm["servico"]) ?? {
        codigoLc116: "17.01",
        descricao: "",
        discriminacao: "",
        valorServico: 0,
        aliquotaIss: 5,
        issRetido: false,
        valorDeducoes: 0,
        descontoIncondicionado: 0,
        descontoCondicionado: 0,
      },
      observacoes: String(raw.observacoes ?? ""),
    };

    return {
      numero: raw.numero ? String(raw.numero) : undefined,
      serie: raw.serie ? String(raw.serie) : "1",
      status: parseStatus(String(raw.status ?? "emitida")),
      dataEmissao: raw.dataEmissao ? String(raw.dataEmissao) : undefined,
      codigoVerificacao: raw.codigoVerificacao ? String(raw.codigoVerificacao) : null,
      form: reconstructed,
    };
  }

  return {
    numero: raw.numero ? String(raw.numero) : undefined,
    serie: raw.serie ? String(raw.serie) : "1",
    status: parseStatus(String(raw.status ?? "emitida")),
    dataEmissao: raw.dataEmissao ? String(raw.dataEmissao) : undefined,
    codigoVerificacao: raw.codigoVerificacao ? String(raw.codigoVerificacao) : null,
    form,
  };
}

function parseXmlAddress(node: Element | null): PartyAddress {
  if (!node) return blankAddress();
  return {
    logradouro: xmlText(node, "Endereco", "xLgr", "Logradouro") || "",
    numero: xmlText(node, "Numero", "nro") || "",
    complemento: xmlText(node, "Complemento", "xCpl") || "",
    bairro: xmlText(node, "Bairro", "xBairro") || "",
    cidade: xmlText(node, "Cidade", "xMun", "NomeMunicipio") || "",
    uf: xmlText(node, "Uf", "UF") || "",
    cep: xmlText(node, "Cep", "CEP") || "",
  };
}

function xmlFirst(parent: Element | null, ...names: string[]) {
  if (!parent) return null;
  for (const name of names) {
    const nodes = parent.getElementsByTagName(name);
    if (nodes[0]) return nodes[0];
    const lower = [...parent.getElementsByTagName("*")].find(
      (el) => el.localName.toLowerCase() === name.toLowerCase(),
    );
    if (lower) return lower;
  }
  return null;
}

function xmlText(node: Element | null, ...names: string[]) {
  if (!node) return "";
  for (const name of names) {
    const direct = [...node.getElementsByTagName(name)][0];
    if (direct?.textContent?.trim()) return direct.textContent.trim();
    const insensitive = [...node.getElementsByTagName("*")].find(
      (el) => el.localName.toLowerCase() === name.toLowerCase() && el.textContent?.trim(),
    );
    if (insensitive?.textContent) return insensitive.textContent.trim();
  }
  return "";
}

function xmlNumber(node: Element | null, ...names: string[]) {
  return parseNumber(xmlText(node, ...names));
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function parseStatus(value: string | undefined): InvoiceStatus {
  const v = (value || "emitida").toLowerCase();
  if (v === "rascunho" || v === "draft") return "rascunho";
  if (v === "cancelada" || v === "cancelled" || v === "canceled") return "cancelada";
  return "emitida";
}

function formatLc116(code: string) {
  const digits = onlyDigits(code);
  if (digits.length < 3) return code || "17.01";
  if (code.includes(".")) return code;
  return `${digits.slice(0, digits.length - 2)}.${digits.slice(-2)}`;
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

export function invoiceImportSummary(item: InvoiceImportItem) {
  return {
    numero: item.numero ?? "—",
    tomador: item.form.tomador.nome || "—",
    valor: item.form.servico.valorServico,
    status: item.status ?? "emitida",
  };
}

export function buildInvoicesFromImport(
  items: InvoiceImportItem[],
  existing: Invoice[],
  startCounters: { idCounter: number; seq: number },
): { invoices: Invoice[]; skipped: string[]; counters: { idCounter: number; seq: number } } {
  const skipped: string[] = [];
  const imported: Invoice[] = [];
  let { idCounter, seq } = startCounters;

  const existingNumbers = new Set(existing.map((i) => i.numero));

  for (const item of items) {
    const numero = item.numero ?? String(seq).padStart(6, "0");

    if (item.numero && existingNumbers.has(item.numero)) {
      skipped.push(`Nº ${item.numero} já existe`);
      continue;
    }

    const invoice: Invoice = {
      id: idCounter++,
      numero,
      serie: item.serie ?? "1",
      status: item.status ?? "emitida",
      dataEmissao: item.dataEmissao ? new Date(item.dataEmissao) : new Date(),
      codigoVerificacao: item.codigoVerificacao ?? null,
      ...JSON.parse(JSON.stringify(item.form)),
    };

    imported.push(invoice);
    existingNumbers.add(numero);

    const numeric = parseInt(numero, 10);
    if (!item.numero && numeric >= seq) seq = numeric + 1;
    if (item.numero) {
      const n = parseInt(item.numero, 10);
      if (n >= seq) seq = n + 1;
    }
  }

  return { invoices: imported, skipped, counters: { idCounter, seq } };
}
