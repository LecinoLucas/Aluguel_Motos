import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { TRPCError } from "@trpc/server";
import type { DocumentImportInput } from "./documentos.schemas";

type ExtractedDocumentFields = {
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissor: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  cnh: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  chassi: string;
  renavam: string;
};

type PartialFields = Partial<ExtractedDocumentFields>;

type LocalExtractionAvailability = {
  available: boolean;
  pdf: boolean;
  image: boolean;
  ocr: boolean;
};

const PDF_OCR_PAGE_LIMIT = 3;

const emptyFields = (): ExtractedDocumentFields => ({
  nome: "",
  cpf: "",
  rg: "",
  orgaoEmissor: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
  cnh: "",
  marca: "",
  modelo: "",
  ano: "",
  cor: "",
  placa: "",
  chassi: "",
  renavam: "",
});

const ufPorSigla: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

const siglaPorEstado = Object.fromEntries(
  Object.entries(ufPorSigla).map(([sigla, estado]) => [estado.toUpperCase(), sigla]),
) as Record<string, string>;

const VISION_OCR_SWIFT_SOURCE = String.raw`
import AppKit
import Foundation
import Vision

func groupedLines(from observations: [VNRecognizedTextObservation]) -> [String] {
    struct Token {
        let text: String
        let x: CGFloat
        let y: CGFloat
    }

    let tokens = observations.compactMap { observation -> Token? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let text = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return nil }
        return Token(text: text, x: observation.boundingBox.minX, y: observation.boundingBox.midY)
    }

    var buckets: [(y: CGFloat, tokens: [Token])] = []
    let tolerance: CGFloat = 0.018

    for token in tokens {
        if let index = buckets.firstIndex(where: { abs($0.y - token.y) <= tolerance }) {
            buckets[index].tokens.append(token)
        } else {
            buckets.append((y: token.y, tokens: [token]))
        }
    }

    return buckets
        .sorted { $0.y > $1.y }
        .map { bucket in
            bucket.tokens
                .sorted { $0.x < $1.x }
                .map(\.text)
                .joined(separator: " ")
        }
}

guard CommandLine.arguments.count >= 2 else {
    fputs("Uso: swift ocr.swift <imagem>\n", stderr)
    exit(2)
}

let imagePath = CommandLine.arguments[1]
let imageURL = URL(fileURLWithPath: imagePath)

guard let image = NSImage(contentsOf: imageURL) else {
    fputs("Nao foi possivel abrir a imagem.\n", stderr)
    exit(3)
}

var proposedRect = CGRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
    fputs("Nao foi possivel converter a imagem.\n", stderr)
    exit(4)
}

var requestError: Error?
var lines: [String] = []

let request = VNRecognizeTextRequest { request, error in
    requestError = error
    let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
    lines = groupedLines(from: observations)
}

request.recognitionLanguages = ["pt-BR", "en-US"]
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
request.minimumTextHeight = 0.01

do {
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try handler.perform([request])
} catch {
    fputs("Falha no OCR: \(error.localizedDescription)\n", stderr)
    exit(5)
}

if let requestError {
    fputs("Falha no OCR: \(requestError.localizedDescription)\n", stderr)
    exit(6)
}

print(lines.joined(separator: "\n"))
`;

function commandExists(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn("which", [command]);
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

async function runCommand(command: string, args: string[], options?: { cwd?: string; input?: Buffer | string }) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options?.cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdout).toString("utf8"));
        return;
      }

      reject(
        new Error(
          Buffer.concat(stderr).toString("utf8").trim() || `${command} terminou com código ${code ?? -1}`,
        ),
      );
    });

    if (options?.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();
  });
}

export async function getLocalDocumentExtractionAvailability(): Promise<LocalExtractionAvailability> {
  const [hasPdfToText, hasPdfToPpm, hasSwift] = await Promise.all([
    commandExists("pdftotext"),
    commandExists("pdftoppm"),
    process.platform === "darwin" ? commandExists("swift") : Promise.resolve(false),
  ]);

  return {
    available: hasPdfToText || hasSwift,
    pdf: hasPdfToText,
    image: hasSwift,
    ocr: hasPdfToPpm && hasSwift,
  };
}

function normalizeDocumentText(text: string) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  for (let t = 9; t <= 10; t += 1) {
    let sum = 0;
    for (let index = 0; index < t; index += 1) {
      sum += Number(digits[index]) * (t + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    const check = remainder === 10 ? 0 : remainder;
    if (Number(digits[t]) !== check) return false;
  }
  return true;
}

function isValidRenavam(renavam: string): boolean {
  const digits = renavam.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 11) return false;
  const padded = digits.padStart(11, "0");
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(padded[index]) * weights[index];
  }
  const remainder = (sum * 10) % 11;
  const check = remainder >= 10 ? 0 : remainder;
  return Number(padded[10]) === check;
}

function isValidPlaca(placa: string): boolean {
  const cleaned = placa.replace(/[\s-]/g, "").toUpperCase();
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleaned);
}

function isValidChassi(chassi: string): boolean {
  const cleaned = chassi.replace(/\s/g, "").toUpperCase();
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned) && !/[IOQ]/.test(cleaned);
}

function looksLikeName(value: string): boolean {
  const cleaned = value.replace(/[^A-ZÀ-Úa-zà-ú ]/g, "").trim();
  const words = cleaned.split(/\s+/).filter((word) => word.length >= 2);
  return words.length >= 2 && cleaned.length >= 6;
}

function cleanExtractedName(name: string): string {
  return name
    .replace(/\b(REPUBLICA|FEDERATIVA|BRASIL|CARTEIRA|HABILITACAO|VALIDADE|NACIONAL|DEPARTAMENTO|DETRAN|TRANSITO|EQUATORIAL|ENERGIA|FATURA|CONTA)\b/gi, "")
    .replace(/[0-9]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isCnhInstitutionalLine(line: string) {
  return /\b(REP[ÚU]BLICA|FEDERATIVA|BRASIL|MINIST[ÉE]RIO|TRANSPORTES|SECRETARIA|SENATRAN|DEPARTAMENTO\s+NACIONAL\s+DE\s+TR[ÂA]NSITO|CARTEIRA\s+NACIONAL\s+DE\s+HABILITA[ÇC][ÃA]O|QR-?CODE|GOV\.BR|V[ÁA]LIDA\s+EM\s+TODO\s+O\s+TERRIT[ÓO]RIO\s+NACIONAL|PERMISS[ÃA]O|OBSERVA[ÇC][ÕO]ES|ASSINATURA\s+DO\s+PORTADOR|ASSINADOR\s+SERPRO|SERPRO|CONTRAN|DENATRAN|DATA\s+EMISS[ÃA]O|LOCAL:|DOCUMENTO\s+ASSINADO\s+COM\s+CERTIFICADO\s+DIGITAL|MEDIDA\s+PROVIS[ÓO]RIA|VALIDA[ÇC][ÃA]O\s+DO\s+DOCUMENTO\s+DIGITAL)\b/.test(line);
}

function cleanCnhNameCandidate(value: string) {
  return cleanExtractedName(
    value
      .replace(/\b(?:DOC\.?\s*IDENTIDADE|IDENTIDADE|ORG\.?\s*EMISSOR\/?UF|ORG\.?\s*EMISSOR|EMISSOR\/?UF|EMISSOR|CPF|FILIAC[ÇC][ÃA]O|VALIDADE|REGISTRO|OBSERVA[ÇC][ÕO]ES|ASSINATURA|LOCAL|DATA\s+EMISS[ÃA]O|QR-?CODE|GOV\.BR)\b[\s\S]*$/i, "")
      .replace(/^[^A-ZÀ-Ú]+/i, "")
      .trim(),
  );
}

function pickCnhNameCandidate(value: string) {
  const cleaned = cleanCnhNameCandidate(value);
  if (!cleaned) return "";
  if (isCnhInstitutionalLine(cleaned) || looksLikeFieldLabelLine(cleaned) || looksLikeVehicleLabelLine(cleaned)) {
    return "";
  }
  return looksLikeName(cleaned) ? cleaned : "";
}

function findCnhNameByContext(lines: string[]) {
  const anchorPattern = /\b(DOC\.?\s*IDENTIDADE|IDENTIDADE|CPF|FILIAC[ÇC][ÃA]O)\b/;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!anchorPattern.test(line)) continue;

    const sameLineCandidate = pickCnhNameCandidate(line.split(anchorPattern)[0] || "");
    if (sameLineCandidate) {
      return sameLineCandidate;
    }

    for (let previous = index - 1; previous >= Math.max(0, index - 2); previous -= 1) {
      const candidate = pickCnhNameCandidate(lines[previous] || "");
      if (candidate) {
        return candidate;
      }
    }
  }

  return "";
}

function cleanExtractedAddress(address: string): string {
  return address
    .replace(/\b(ENDERE[ÇC]O|LOGRADOURO|LOCAL DE CONSUMO|END\.?)\b[:\s-]*/gi, "")
    .replace(/\b(CEP|CPF|CNPJ|FONE|TELEFONE|CELULAR)\b.*$/gi, "")
    .replace(/(?:\s+\d{2}\/\d{2}\/\d{4}){1,4}(?:\s+\d{1,3})?/g, "")
    .replace(/\b(CONSULTE PELA CHAVE|NOTA FISCAL|DATA DE EMISS[ÃA]O)\b.*$/gi, "")
    .replace(/\b(BRASIL|GOV\.?BR)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .replace(/[.,;:-]\s*$/, "");
}

function findFirstGroup(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }
  return "";
}

function findFirstValidCpf(text: string) {
  const patterns = [
    /CPF[^A-Z0-9]{0,10}([0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}-?[0-9OQDIL|!ZSBG]{2})/g,
    /\b([0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}-?[0-9OQDIL|!ZSBG]{2})\b/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    match = pattern.exec(text);
    while (match !== null) {
      const candidate = normalizeOcrDigits(match[1]).replace(/\D/g, "");
      if (candidate.length === 11 && isValidCpf(candidate)) {
        return candidate;
      }
      match = pattern.exec(text);
    }
  }

  return "";
}

function findFirstCpfCandidate(text: string) {
  const patterns = [
    /CPF[^A-Z0-9]{0,10}([0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}-?[0-9OQDIL|!ZSBG]{2})/g,
    /([0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}\.?[0-9OQDIL|!ZSBG]{3}-?[0-9OQDIL|!ZSBG]{2})/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    match = pattern.exec(text);
    while (match !== null) {
      const candidate = normalizeOcrDigits(match[1]).replace(/\D/g, "");
      if (candidate.length === 11) {
        return candidate;
      }
      match = pattern.exec(text);
    }
  }

  return "";
}

function pickLikelyUppercaseLine(text: string, blacklist: RegExp[] = []) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 10);

  return (
    lines.find((line) => {
      const upperRatio = line.replace(/[^A-ZÀ-Ú]/g, "").length / line.length;
      const hasEnoughWords = line.split(" ").filter(Boolean).length >= 3;
      return upperRatio > 0.45 && hasEnoughWords && !blacklist.some((rule) => rule.test(line));
    }) || ""
  );
}

function looksLikeAddressLine(line: string) {
  return /\b(RUA|R\.|AV(?:ENIDA)?|AL(?:AMEDA)?|TRAV(?:ESSA)?|RESIDENCIAL|SETOR|QD\.?|QUADRA|LT\.?|LOTE|EST(?:RADA)?|ROD(?:OVIA)?|FAZENDA|CH[ÁA]CARA|CONDOM[ÍI]NIO|VILA|N[ÚU]MERO|NUMERO)\b/.test(line) && !looksLikeVehicleLabelLine(line);
}

function looksLikeFieldLabelLine(line: string) {
  const normalized = line.trim().toUpperCase();
  if (!normalized || /\d/.test(normalized)) {
    return false;
  }

  return /\b(NOME|SOBRENOME|CPF|RG|IDENTIDADE|DOC\.?|ORG[ÃA]O|EMISSOR|UF|REGISTRO|VALIDADE|NASCIMENTO|CATEGORIA|PLACA|MODELO|MARCA|COR|CHASSI|RENAVAM|ANO|LOGRADOURO|ENDERE[ÇC]O|CEP|CIDADE|ESTADO)\b/.test(normalized);
}

function isUtilityNoiseLine(line: string) {
  return /\b(EQUATORIAL|ENERGIA|FATURA|CONTA|VENCIMENTO|REFERENTE|UNIDADE\s+CONSUMIDORA|INSTALA[ÇC][AÃ]O|MEDIDOR|ATENDIMENTO|AG[ÊE]NCIA|EMISS[ÃA]O|TARIFA|C[ÓO]DIGO\s+DE\s+BARRAS|TOTAL\s+A\s+PAGAR|SANEAGO|CELPE|CPFL|CEMIG|ENEL|SABESP|COMPANHIA|DISTRIBUI[ÇC][AÃ]O)\b/.test(line);
}

function looksLikeResidenceProofContext(lines: string[], text: string) {
  const utilityMatches = lines.filter((line) =>
    /\b(EQUATORIAL|ENERGIA|FATURA|CONTA|VENCIMENTO|REFERENTE|UNIDADE\s+CONSUMIDORA|INSTALA[ÇC][AÃ]O|MEDIDOR|ATENDIMENTO|AG[ÊE]NCIA|EMISS[ÃA]O|TARIFA|C[ÓO]DIGO\s+DE\s+BARRAS|TOTAL\s+A\s+PAGAR|SANEAGO|CELPE|CPFL|CEMIG|ENEL|SABESP|COMPANHIA|DISTRIBUI[ÇC][AÃ]O|CLIENTE|TITULAR|CONSUMIDOR(?:A)?|BENEFICI[ÁA]RIO|LOCAL\s+DE\s+CONSUMO|ENDERE[ÇC]O|LOGRADOURO|CEP)\b/.test(line),
  ).length;

  const addressMatches = lines.filter((line) => looksLikeAddressLine(line)).length;
  const cityMatches = lines.filter((line) => /\b[A-ZÀ-Ú]{3,}(?:\s+[A-ZÀ-Ú]+)*\s*[-\/|]?\s*[A-Z]{2}\b/.test(line)).length;
  const hasStrongVehicleMarkers = /\b(CERTIFICADO\s+DE\s+REGISTRO|LICENCIAMENTO\s+DE\s+VE[IÍ]CULO|C[ÓO]DIGO\s+RENAVAM|N[ÚU]MERO\s+DO\s+CRV|CHASSI|PLACA|MARCA\s*\/\s*MODELO|COMBUST[ÍI]VEL|CARROCERIA|LOTA[ÇC][AÃ]O)\b/.test(text);

  if (hasStrongVehicleMarkers) {
    return false;
  }

  return utilityMatches >= 2 && (addressMatches >= 1 || cityMatches >= 1);
}

function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  if (digits.length !== 11 || !isValidCpf(digits)) return cpf.trim();
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCpfCandidate(cpf: string) {
  const digits = normalizeOcrDigits(cpf).replace(/\D/g, "").slice(0, 11);
  if (digits.length !== 11) return cpf.trim();
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCep(cep: string) {
  const digits = cep.replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) return cep.trim();
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone.trim();
}

function normalizeOcrDigits(value: string) {
  return value
    .toUpperCase()
    .replace(/[OQD]/g, "0")
    .replace(/[IL|!]/g, "1")
    .replace(/Z/g, "2")
    .replace(/S/g, "5")
    .replace(/G/g, "6")
    .replace(/B/g, "8");
}

function normalizeOcrUf(value: string) {
  return value
    .toUpperCase()
    .replace(/0/g, "O")
    .replace(/[1|!]/g, "I")
    .replace(/5/g, "S")
    .replace(/6/g, "G")
    .replace(/8/g, "B")
    .replace(/4/g, "A")
    .replace(/2/g, "Z");
}

function findFirstCepCandidate(text: string) {
  const patterns = [
    /CEP[^A-Z0-9]{0,6}([0-9OQDIL|!ZSBG]{5}[\s.-]?[0-9OQDIL|!ZSBG]{3})/g,
    /\b([0-9OQDIL|!ZSBG]{5}[\s.-]?[0-9OQDIL|!ZSBG]{3})\b/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    match = pattern.exec(text);
    while (match !== null) {
      const candidate = normalizeOcrDigits(match[1]).replace(/\D/g, "");
      if (candidate.length === 8) {
        return candidate;
      }
      match = pattern.exec(text);
    }
  }

  return "";
}

function extractCepFromLine(line: string) {
  const normalized = normalizeOcrDigits(line).replace(/\bCEP\b[:\s-]*/g, " ");
  const match = normalized.match(/\b([0-9]{5})[\s.-]?([0-9]{3})\b/);
  return match ? `${match[1]}${match[2]}` : "";
}

function extractCidadeUfFromCepLine(line: string) {
  const normalized = line
    .toUpperCase()
    .replace(/^.*?\b[0-9]{5}[\s.-]?[0-9]{3}\b/, "")
    .replace(/\bBRASIL\b/g, "")
    .replace(/\b\d{4,}\b/g, "")
    .replace(/^[\s:|,.-]+/, "")
    .replace(/[|]/g, " ")
    .trim();

  const match = normalized.match(/([A-ZÀ-Ú][A-ZÀ-Ú ]+?)\s+([A-Z]{2})(?:\s+|$)/);
  if (!match) {
    return { cidade: "", uf: "" };
  }

  return {
    cidade: match[1].trim().replace(/0/g, "O"),
    uf: normalizeOcrUf(match[2].trim()),
  };
}

function findCpfLineIndex(lines: string[]) {
  return lines.findIndex((line) => Boolean(findFirstValidCpf(line)));
}

function findNameBeforeCpfLine(lines: string[], cpfLineIndex: number) {
  if (cpfLineIndex <= 0) return "";

  for (let index = cpfLineIndex - 1; index >= Math.max(0, cpfLineIndex - 3); index -= 1) {
    const candidate = lines[index]?.trim();
    if (!candidate || isUtilityNoiseLine(candidate) || looksLikeFieldLabelLine(candidate) || looksLikeVehicleLabelLine(candidate)) {
      continue;
    }

    const cleaned = cleanExtractedName(candidate);
    if (looksLikeName(cleaned)) {
      return cleaned;
    }
  }

  return "";
}

function findAddressBlockAfterCpf(lines: string[], cpfLineIndex: number) {
  if (cpfLineIndex < 0) return { addressLines: [] as string[], cepLine: "" };

  const addressLines: string[] = [];
  let cepLine = "";

  for (let index = cpfLineIndex + 1; index < Math.min(lines.length, cpfLineIndex + 7); index += 1) {
    const candidate = lines[index]?.trim();
    if (!candidate) continue;
    if (looksLikeVehicleLabelLine(candidate) || /\b(TOTAL\s+A\s+PAGAR|VENCIMENTO|CONTA\s+M[EÊ]S|PARCEIRO\s+DE\s+NEG[ÓO]CIO|UNIDADE\s+CONSUMIDORA|PERDAS\s+DE\s+TRANSFORMA[ÇC][ÃA]O)\b/.test(candidate)) {
      break;
    }

    if (!cepLine && (candidate.includes("CEP") || extractCepFromLine(candidate))) {
      cepLine = candidate;
      continue;
    }

    if (looksLikeAddressLine(candidate) || /\b(RESIDENCIAL|CONDOM[ÍI]NIO|BAIRRO|APTO|BLOCO|CASA|S\/N)\b/.test(candidate)) {
      addressLines.push(candidate);
      continue;
    }

    if (addressLines.length > 0 && !looksLikeFieldLabelLine(candidate) && !isUtilityNoiseLine(candidate)) {
      addressLines.push(candidate);
    }
  }

  return { addressLines, cepLine };
}

function findBestCidadeUfMatch(lines: string[]) {
  const candidates = lines
    .filter((line) => /\b[A-ZÀ-Ú]{3,}(\s+[A-ZÀ-Ú]+)*\s*[-\/|]?\s*[A-Z0-9]{2}\b/.test(line) && !looksLikeAddressLine(line) && !/CEP|CNPJ|CPF|FONE|TELEFONE|CELULAR/.test(line) && !isUtilityNoiseLine(line))
    .map((line) => {
      const match = line.match(/([A-ZÀ-Ú][A-ZÀ-Ú ]+?)\s*[-\/|]?\s*\b([A-Z0-9]{2})\b/);
      const city = match?.[1]?.trim() || "";
      const uf = normalizeOcrUf(match?.[2] || "");
      const score = city.length + (ufPorSigla[uf] ? 100 : 0) - (line.includes("|") ? 10 : 0);

      return { match, city, uf, score };
    })
    .filter((candidate) => candidate.match);

  return candidates.sort((left, right) => right.score - left.score)[0] || null;
}

function formatState(ufOrState: string) {
  const value = ufOrState.trim().toUpperCase();
  return siglaPorEstado[value] || (ufPorSigla[value] ? value : ufOrState.trim());
}

function formatOrgaoEmissor(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ");
  const match = normalized.match(/\b(SSP|SESP|DETRAN|IFP|PC)\s*[-/]?\s*([A-Z]{2})\b/);
  if (!match) {
    return value.trim();
  }
  return `${match[1]}/${match[2]}`;
}

function extractIdentityLineParts(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ");
  const rg = normalized.match(/\b([0-9][0-9.\-]{4,14})\b/)?.[1] || "";
  const issuerMatch =
    normalized.match(/\b(SSP|SESP|DETRAN|IFP|PC|SDS|DGPC|POLICIA\s+CIVIL)\s*[-/]?\s*([A-Z]{2})\b/) ||
    normalized.match(/\b([A-Z]{2,8})\s+([A-Z]{2})\b/);

  return {
    rg,
    orgaoEmissor: issuerMatch ? formatOrgaoEmissor(`${issuerMatch[1]}/${issuerMatch[2]}`) : "",
  };
}

function looksLikeVehicleLabelLine(line: string) {
  return /\b(CAPACIDADE|CATEGORIA|RENAVAM|PLACA|EXERC[ÍI]CIO|ANO|MOTOR|EIXOS|LOTA[ÇC][AÃ]O|CARROCERIA|NOME|CPF|LOCAL|DATA|MARCA|MODELO|ESP[ÉE]CIE|TIPO|CHASSI|COR|COMBUST[ÍI]VEL|QRCODE|CRV)\b/.test(line);
}

function extractValueAfterLabel(lines: string[], labelPattern: RegExp) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!labelPattern.test(line)) {
      continue;
    }

    const sameLine = line.replace(labelPattern, "").trim();
    if (sameLine && !looksLikeVehicleLabelLine(sameLine) && !looksLikeFieldLabelLine(sameLine)) {
      return sameLine;
    }

    for (let next = index + 1; next < Math.min(lines.length, index + 4); next += 1) {
      const candidate = lines[next]?.trim();
      if (!candidate || looksLikeVehicleLabelLine(candidate)) {
        continue;
      }
      return candidate;
    }
  }

  return "";
}

function findNextLineMatching(
  lines: string[],
  labelPattern: RegExp,
  matcher: (line: string) => boolean,
  maxDistance = 6,
) {
  for (let index = 0; index < lines.length; index += 1) {
    if (!labelPattern.test(lines[index])) {
      continue;
    }

    for (let next = index + 1; next < Math.min(lines.length, index + 1 + maxDistance); next += 1) {
      const candidate = lines[next]?.trim();
      if (!candidate) {
        continue;
      }

      if (matcher(candidate)) {
        return candidate;
      }
    }
  }

  return "";
}

function findCRLVYearPair(lines: string[], text: string) {
  const fromLabel = text.match(/ANO\s+FABRICA[ÇC][AÃ]O\s+ANO\s+MODELO[\s\S]{0,120}?\b((?:19|20)\d{2})\b\s+\b((?:19|20)\d{2})\b/);
  if (fromLabel) {
    return `${fromLabel[1]}/${fromLabel[2]}`;
  }

  const yearLine = findNextLineMatching(
    lines,
    /\bANO\s+FABRICA[ÇC][AÃ]O\b/,
    (line) => /\b((?:19|20)\d{2})\b.*\b((?:19|20)\d{2})\b/.test(line),
    4,
  );
  const match = yearLine.match(/\b((?:19|20)\d{2})\b.*\b((?:19|20)\d{2})\b/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function findCRLVMarcaModelo(lines: string[], text: string) {
  const fromNearbyLine = findNextLineMatching(
    lines,
    /\bMARCA\s*\/\s*MODELO(?:\s*\/\s*VERS[ÃA]O)?\b/,
    (line) => /\//.test(line) && !/ASSINADO|DIGITALMENTE|DETRAN|DADOS DO SEGURO|ESP[ÉE]CIE|TIPO/.test(line),
    6,
  );
  if (fromNearbyLine) {
    return fromNearbyLine;
  }

  return findFirstGroup(text, [/(?:MARCA\s*\/\s*MODELO(?:\s*\/\s*VERS[ÃA]O)?)[^A-Z0-9]*([A-Z0-9/ .\-]{6,})/]);
}

function findCRLVColor(lines: string[], text: string) {
  const colors = ["PRETA", "BRANCA", "PRATA", "CINZA", "VERMELHA", "AZUL", "VERDE", "AMARELA", "LARANJA", "ROXA", "MARROM"];
  const colorPattern = new RegExp(`\\b(${colors.join("|")})\\b`);

  const fromLabel = text.match(new RegExp(`COR(?:\\s+PREDOMINANTE)?[\\s\\S]{0,100}?\\b(${colors.join("|")})\\b`));
  if (fromLabel?.[1]) {
    return fromLabel[1];
  }

  const fromLine = findNextLineMatching(
    lines,
    /\bCOR(?:\s+PREDOMINANTE)?\b/,
    (line) => colorPattern.test(line),
    4,
  );
  return fromLine.match(colorPattern)?.[1] || "";
}

function parseCNHText(text: string): PartialFields {
  const normalized = normalizeDocumentText(text);
  const upper = normalized.toUpperCase();
  const lines = upper.split("\n").map((line) => line.trim()).filter(Boolean);

  const identityAnchorIndex = lines.findIndex((line) => /\b(?:DOC\.?\s*IDENTIDADE|IDENTIDADE|RG)\b/.test(line));
  const identityAnchorLine = identityAnchorIndex >= 0 ? lines[identityAnchorIndex] || "" : "";
  const identityBeforeLabel = identityAnchorLine.split(/\b(?:DOC\.?\s*IDENTIDADE|IDENTIDADE|RG)\b/)[0]?.trim() || "";
  const identityDataLine =
    identityAnchorIndex >= 0
      ? lines.slice(identityAnchorIndex + 1, identityAnchorIndex + 3).find((line) => /\d/.test(line)) || ""
      : "";
  const identityContext = [identityAnchorLine, identityDataLine].filter(Boolean).join(" ");

  const cpf = findFirstValidCpf(upper) || findFirstCpfCandidate(upper);
  const cnhFromLabel = findFirstGroup(
    extractValueAfterLabel(lines, /\b(?:N[ºO°]?\s*REGISTRO|REGISTRO|N[ºO°]?\s*REG)\b/) || upper,
    [
      /(?:N[ºO]? ?REGISTRO|REGISTRO)[^A-Z0-9]{0,8}([0-9OQDIL|!ZSBG]{9,11})/,
      /\bCNH[^A-Z0-9]{0,6}([0-9OQDIL|!ZSBG]{9,11})\b/,
    ],
  );

  let cnh = normalizeOcrDigits(cnhFromLabel).replace(/\D/g, "");
  if (!cnh) {
    const cpfDigits = cpf.replace(/\D/g, "");
    const elevenDigitMatches = upper.match(/\b([0-9OQDIL|!ZSBG]{11})\b/g) || [];
    cnh = elevenDigitMatches
      .map((value) => normalizeOcrDigits(value).replace(/\D/g, ""))
      .find((value) => value.length === 11 && value !== cpfDigits && !isValidCpf(value)) || "";
  }

  const identityParts = extractIdentityLineParts(identityContext);
  const rgCandidate = (identityParts.rg || findFirstGroup(identityDataLine || identityContext, [
    /(?:CPF[^0-9]{0,6}[0-9.\-]{11,14}\s+)([0-9][0-9.\-A-Z]{4,14})/,
    /\b([0-9][0-9.\-A-Z]{4,14})\b/,
  ])).trim();
  const cpfDigits = cpf.replace(/\D/g, "");
  const rg = rgCandidate.replace(/\D/g, "") === cpfDigits ? "" : rgCandidate;
  const orgaoEmissor = identityParts.orgaoEmissor || formatOrgaoEmissor(
    findFirstGroup(identityDataLine || identityContext, [
      /\b(SSP\/?[A-Z]{2}|SESP\/?[A-Z]{2}|DETRAN\/?[A-Z]{2}|IFP\/?[A-Z]{2}|PC\/?[A-Z]{2})\b/,
      /\b(SSP\s?[A-Z]{2}|SESP\s?[A-Z]{2}|DETRAN\s?[A-Z]{2}|IFP\s?[A-Z]{2}|PC\s?[A-Z]{2})\b/,
      /\b(SSP-[A-Z]{2}|SESP-[A-Z]{2}|DETRAN-[A-Z]{2}|IFP-[A-Z]{2}|PC-[A-Z]{2})\b/,
    ]),
  );
  const telefone = findFirstGroup(upper, [
    /(?:TELEFONE|CELULAR|FONE|TEL)[^0-9]{0,4}(\(?[0-9]{2}\)?[\s.-]?[0-9]{4,5}[\s.-]?[0-9]{4})/,
  ]);

  const nomeFromContext = pickCnhNameCandidate(identityBeforeLabel) || findCnhNameByContext(lines);
  const nomeFromLabel = findFirstGroup(
    extractValueAfterLabel(lines, /\b(?:NOME|NOME E SOBRENOME|NOME DO CONDUTOR)\b/) || upper,
    [/(?:NOME|NOME E SOBRENOME|NOME DO CONDUTOR)[^A-ZÀ-Ú]{0,4}([A-ZÀ-Ú][A-ZÀ-Ú ]{7,})/],
  );

  const nome =
    nomeFromContext ||
    pickCnhNameCandidate(nomeFromLabel) ||
    pickCnhNameCandidate(
      pickLikelyUppercaseLine(upper, [
        /REP[ÚU]BLICA/, /FEDERATIVA/, /CARTEIRA/, /HABILITA[ÇC][ÃA]O/,
        /VALIDADE/, /NACIONAL/, /DEPARTAMENTO/, /DETRAN/,
        /TR[ÂA]NSITO/, /PERMISS[ÃA]O/, /FILIA[ÇC][ÃA]O/, /DOC\.?\s*IDENTIDADE/,
        /LOCAL/, /EMISS[ÃA]O/, /NASCIMENTO/, /OBSERVA[ÇC][ÕO]ES/,
        /MINIST[ÉE]RIO/, /SECRETARIA/, /SENATRAN/, /QR-?CODE/, /GOV\.BR/,
        /\d{3}\.\d{3}\.\d{3}/,
      ]),
    );

  const estadoFromIssuer = (() => {
    const match = orgaoEmissor.match(/\/([A-Z]{2})$/);
    return match ? formatState(match[1]) : "";
  })();

  return {
    nome: looksLikeName(nome) && !isCnhInstitutionalLine(nome) ? nome : "",
    cpf: formatCpf(cpf),
    cnh,
    rg,
    orgaoEmissor,
    estado: estadoFromIssuer,
    telefone: formatPhone(telefone),
  };
}

function parseComprovanteText(text: string): PartialFields {
  const normalized = normalizeDocumentText(text);
  const upper = normalized.toUpperCase();
  const lines = upper.split("\n").map((line) => line.trim()).filter(Boolean);

  if (!looksLikeResidenceProofContext(lines, upper)) {
    return {};
  }

  const cpfLineIndex = findCpfLineIndex(lines);
  const nameFromCpfContext = findNameBeforeCpfLine(lines, cpfLineIndex);
  const addressBlock = findAddressBlockAfterCpf(lines, cpfLineIndex);
  const cepFromAddressBlock = extractCepFromLine(addressBlock.cepLine);
  const cidadeUfFromCepLine = extractCidadeUfFromCepLine(addressBlock.cepLine);

  const nomeLabelValue = extractValueAfterLabel(lines, /\b(?:NOME|CLIENTE|TITULAR|CONSUMIDOR(?:A)?|BENEFICI[ÁA]RIO)\b/);
  const nomeRaw =
    nameFromCpfContext ||
    findFirstGroup(nomeLabelValue || upper, [
      /(?:NOME|CLIENTE|TITULAR|CONSUMIDOR(?:A)?|BENEFICI[ÁA]RIO)[^A-ZÀ-Ú]{0,6}([A-ZÀ-Ú][A-ZÀ-Ú ]{7,})/,
    ]) ||
    pickLikelyUppercaseLine(upper, [
      /EQUATORIAL/, /ENERGIA/, /FATURA/, /CONTA/,
      /VENCIMENTO/, /REFERENTE/, /UNIDADE/, /ENEL/,
      /SANEAGO/, /CELPE/, /CPFL/, /CEMIG/, /SABESP/,
      /AG[ÊE]NCIA/, /ATENDIMENTO/, /DISTRIBUI[ÇC][AÃ]O/,
      /REPUBLICA/, /GOV\.BR/, /DETRAN/, /RENAVAM/, /CHASSI/, /PLACA/,
    ]);

  const nome = cleanExtractedName(nomeRaw);

  const enderecoFromLabel = cleanExtractedAddress(
    findFirstGroup(upper, [/(?:ENDERE[ÇC]O|LOGRADOURO|LOCAL DE CONSUMO)[^A-Z0-9]{0,6}([A-Z0-9À-Ú,./\- ]{12,})/]),
  );
  const enderecoLineIndex = addressBlock.addressLines.length > 0
    ? lines.findIndex((line) => line === addressBlock.addressLines[0])
    : lines.findIndex((line) => looksLikeAddressLine(line) && !isUtilityNoiseLine(line));
  const enderecoFromLine = enderecoLineIndex >= 0 ? lines[enderecoLineIndex] : "";
  const enderecoComplemento =
    addressBlock.addressLines.length > 1
      ? addressBlock.addressLines.slice(1).join(", ")
      : enderecoLineIndex >= 0
      ? (lines
          .slice(enderecoLineIndex + 1, enderecoLineIndex + 3)
          .find((line) => !isUtilityNoiseLine(line) && !/\b([A-ZÀ-Ú]{3,}(\s+[A-ZÀ-Ú]+)*)\s*[-\/]?\s*[A-Z]{2}\b/.test(line) && !/\bCEP\b/.test(line)) || "")
      : "";
  const endereco = cleanExtractedAddress([enderecoFromLabel, enderecoFromLine, enderecoComplemento].filter(Boolean).join(", "));

  const cep = cepFromAddressBlock || findFirstGroup(upper, [
    /(?:CEP)[^0-9]{0,4}([0-9]{5}-?[0-9]{3})/,
    /\b([0-9]{5}-[0-9]{3})\b/,
    /\b([0-9]{8})\b/,
  ]) || findFirstCepCandidate(upper);
  const cepDigits = normalizeOcrDigits(cep).replace(/\D/g, "");
  const validCep = cepDigits.length === 8 && !isValidCpf(`${cepDigits}000`) ? cep : "";

  const cidadeUfCandidate =
    cidadeUfFromCepLine.cidade && cidadeUfFromCepLine.uf
      ? { city: cidadeUfFromCepLine.cidade, uf: cidadeUfFromCepLine.uf }
      : findBestCidadeUfMatch(lines);
  const uf = cidadeUfCandidate?.uf || "";

  const cpf = findFirstValidCpf(upper);
  const telefone = findFirstGroup(upper, [
    /(?:TELEFONE|CELULAR|FONE|TEL)[^0-9]{0,4}(\(?[0-9]{2}\)?[\s.-]?[0-9]{4,5}[\s.-]?[0-9]{4})/,
  ]);

  return {
    nome: looksLikeName(nome) ? nome : "",
    endereco,
    cidade: cidadeUfCandidate?.city || "",
    estado: uf && ufPorSigla[uf] ? formatState(uf) : "",
    cep: formatCep(validCep),
    cpf: formatCpf(cpf),
    telefone: formatPhone(telefone),
  };
}

function parseCRLVText(text: string): PartialFields {
  const normalized = normalizeDocumentText(text);
  const upper = normalized.toUpperCase();
  const lines = upper.split("\n").map((line) => line.trim()).filter(Boolean);

  const placaFromLabel = extractValueAfterLabel(lines, /\bPLACA\b/);
  const placaFromLabelRaw = findFirstGroup(placaFromLabel, [
    /(?:PLACA|PLATE)[^A-Z0-9]{0,6}([A-Z]{3}[\s-]?[0-9][A-Z0-9][0-9]{2})/,
    /\b([A-Z]{3}[\s-]?[0-9][A-Z0-9][0-9]{2})\b/,
    /\b([A-Z]{3}[\s-]?[0-9]{4})\b/,
  ]);
  const placaRaw = placaFromLabelRaw || findFirstGroup(upper, [
    /(?:PLACA|PLATE)[^A-Z0-9]{0,40}([A-Z]{3}[\s-]?[0-9][A-Z0-9][0-9]{2})/,
    /\b([A-Z]{3}[\s-]?[0-9][A-Z0-9][0-9]{2})\b/,
    /\b([A-Z]{3}[\s-]?[0-9]{4})\b/,
  ]);
  const placa = placaRaw.replace(/[\s-]/g, "");

  const chassiFromLabel = extractValueAfterLabel(lines, /\bCHASSI\b/);
  const chassiFromLabelRaw = findFirstGroup(chassiFromLabel, [
    /(?:CHASSI|CHASI|CHASSIS)[^A-Z0-9]{0,6}([A-HJ-NPR-Z0-9]{17})/,
    /\b([A-HJ-NPR-Z0-9]{17})\b/,
  ]);
  const chassiRaw = chassiFromLabelRaw || findFirstGroup(upper, [
    /(?:CHASSI|CHASI|CHASSIS)[^A-Z0-9]{0,40}([A-HJ-NPR-Z0-9]{17})/,
    /\b([A-HJ-NPR-Z0-9]{17})\b/,
  ]);
  const chassi = isValidChassi(chassiRaw) ? chassiRaw : "";

  const renavamFromLabel = extractValueAfterLabel(lines, /\b(?:C[ÓO]DIGO\s+)?RENAVAM\b/);
  const renavamRaw = findFirstGroup(renavamFromLabel || upper, [/(?:RENAVAM)[^0-9]{0,6}([0-9]{9,11})/]);
  let renavam = isValidRenavam(renavamRaw) ? renavamRaw : "";
  if (!renavam) {
    const renavamFallback = findFirstGroup(upper, [/\b([0-9]{11})\b/]);
    if (isValidRenavam(renavamFallback)) renavam = renavamFallback;
  }

  const cor = findCRLVColor(lines, upper);
  const ano = findCRLVYearPair(lines, upper);

  const marcaModeloRaw = findCRLVMarcaModelo(lines, upper);
  const marcaModelo = marcaModeloRaw.replace(/\b(ASSINADO|DIGITALMENTE|DETRAN|ESP[ÉE]CIE|TIPO|PASSAGEIRO|MOTOCICLETA)\b.*$/g, "").trim();

  const [marca, ...modeloPartes] = marcaModelo.split("/");

  return {
    marca: marca?.trim() || "",
    modelo: (modeloPartes.join("/") || marcaModelo).trim(),
    ano,
    cor,
    placa: isValidPlaca(placa) ? placa : "",
    chassi,
    renavam,
  };
}

function parseLocadorDocumentText(text: string): PartialFields {
  const cnhData = parseCNHText(text);
  const comprovanteData = parseComprovanteText(text);

  return {
    nome: cnhData.nome || comprovanteData.nome || "",
    cpf: cnhData.cpf || comprovanteData.cpf || "",
    rg: cnhData.rg || "",
    orgaoEmissor: cnhData.orgaoEmissor || "",
    endereco: comprovanteData.endereco || "",
    cidade: comprovanteData.cidade || "",
    estado: comprovanteData.estado || "",
    cep: comprovanteData.cep || "",
    telefone: cnhData.telefone || comprovanteData.telefone || "",
  };
}

function hasRecognizedData(fields: PartialFields) {
  return Object.values(fields).some((value) => Boolean(value?.trim()));
}

function countRecognizedFields(fields: PartialFields) {
  return Object.values(fields).filter((value) => Boolean(value?.trim())).length;
}

function hasRequiredFieldsForKind(kind: DocumentImportInput["kind"], fields: PartialFields) {
  if (kind === "cnh") {
    return Boolean(fields.nome && (fields.cpf || fields.cnh));
  }

  if (kind === "comprovante") {
    return Boolean(fields.endereco && (fields.cidade || fields.cep || fields.nome));
  }

  if (kind === "locador") {
    return Boolean((fields.nome && fields.cpf) || (fields.endereco && fields.cidade));
  }

  return Boolean(fields.placa || fields.chassi || fields.renavam);
}

function mergeFields(primary: PartialFields, secondary: PartialFields): PartialFields {
  return {
    nome: primary.nome || secondary.nome || "",
    cpf: primary.cpf || secondary.cpf || "",
    rg: primary.rg || secondary.rg || "",
    orgaoEmissor: primary.orgaoEmissor || secondary.orgaoEmissor || "",
    endereco: primary.endereco || secondary.endereco || "",
    cidade: primary.cidade || secondary.cidade || "",
    estado: primary.estado || secondary.estado || "",
    cep: primary.cep || secondary.cep || "",
    telefone: primary.telefone || secondary.telefone || "",
    cnh: primary.cnh || secondary.cnh || "",
    marca: primary.marca || secondary.marca || "",
    modelo: primary.modelo || secondary.modelo || "",
    ano: primary.ano || secondary.ano || "",
    cor: primary.cor || secondary.cor || "",
    placa: primary.placa || secondary.placa || "",
    chassi: primary.chassi || secondary.chassi || "",
    renavam: primary.renavam || secondary.renavam || "",
  };
}

function validateAndNormalize(kind: DocumentImportInput["kind"], fields: PartialFields): PartialFields {
  const out = { ...fields };

  if (out.cpf) {
    const cpfDigits = normalizeOcrDigits(out.cpf).replace(/\D/g, "");
    if (cpfDigits.length === 11) {
      out.cpf = isValidCpf(cpfDigits) ? formatCpf(cpfDigits) : formatCpfCandidate(cpfDigits);
    } else {
      out.cpf = "";
    }
  }

  if (out.cep) {
    const cepDigits = out.cep.replace(/\D/g, "");
    out.cep = cepDigits.length === 8 ? formatCep(cepDigits) : "";
  }

  if (out.telefone) {
    const phoneDigits = out.telefone.replace(/\D/g, "");
    out.telefone = phoneDigits.length >= 10 && phoneDigits.length <= 11 ? formatPhone(phoneDigits) : "";
  }

  if (out.nome) {
    out.nome = cleanExtractedName(out.nome);
    if (!looksLikeName(out.nome)) out.nome = "";
  }

  if (out.endereco) {
    out.endereco = cleanExtractedAddress(out.endereco);
  }

  if (out.rg) {
    const rgCandidate = out.rg.toUpperCase().trim();
    const rgDigits = rgCandidate.replace(/\D/g, "");
    const hasVehicleNoise = /\b(CAPACIDADE|CATEGORIA|RENAVAM|PLACA|MODELO|COR|CHASSI|EXERCICIO|ANO)\b/.test(rgCandidate);
    out.rg = !hasVehicleNoise && rgDigits.length >= 5 && rgCandidate.length <= 18 ? rgCandidate : "";
  }

  if (out.orgaoEmissor) {
    out.orgaoEmissor = formatOrgaoEmissor(out.orgaoEmissor);
  }

  if (out.estado) {
    out.estado = formatState(out.estado);
  }

  if (kind === "cnh") {
    const cpfDigits = (out.cpf || "").replace(/\D/g, "");
    const cnhDigits = (out.cnh || "").replace(/\D/g, "");
    out.cnh = cnhDigits.length === 11 && cnhDigits !== cpfDigits && !isValidCpf(cnhDigits) ? cnhDigits : "";

    if (!out.estado && out.orgaoEmissor) {
      const issuerUf = out.orgaoEmissor.match(/\/([A-Z]{2})$/)?.[1] || "";
      out.estado = issuerUf ? formatState(issuerUf) : "";
    }
  }

  if (kind === "crlv") {
    const placa = (out.placa || "").replace(/[\s-]/g, "").toUpperCase();
    out.placa = placa && isValidPlaca(placa) ? placa : "";

    const chassi = (out.chassi || "").replace(/\s/g, "").toUpperCase();
    out.chassi = chassi && isValidChassi(chassi) ? chassi : "";

    const renavam = (out.renavam || "").replace(/\D/g, "");
    out.renavam = renavam && isValidRenavam(renavam) ? renavam : "";

    if (out.ano) {
      const normalizedYear = out.ano.replace(/\s/g, "");
      out.ano = /^\d{4}(\/\d{4})?$/.test(normalizedYear) ? normalizedYear : "";
    }

    if (out.cor) out.cor = out.cor.trim().toUpperCase();
    if (out.marca) out.marca = out.marca.trim().toUpperCase();
    if (out.modelo) out.modelo = out.modelo.trim().toUpperCase();
  }

  return out;
}

function parseByKind(kind: DocumentImportInput["kind"], text: string): PartialFields {
  if (kind === "locador") return parseLocadorDocumentText(text);
  if (kind === "cnh") return parseCNHText(text);
  if (kind === "comprovante") return parseComprovanteText(text);
  return parseCRLVText(text);
}

function toCompleteFields(fields: PartialFields): ExtractedDocumentFields {
  return {
    ...emptyFields(),
    ...fields,
  };
}

function ensureSupportedLocally(kind: DocumentImportInput["kind"], mimeType: string, availability: LocalExtractionAvailability) {
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  if (isPdf && availability.pdf) return;
  if (isImage && availability.image) return;

  const target = isPdf ? "PDF" : isImage ? "imagem" : "arquivo";
  const detail = isPdf
    ? "pdftotext não está disponível no servidor."
    : "OCR nativo não está disponível no servidor."
;

  throw new TRPCError({
    code: "PRECONDITION_FAILED",
    message: `Extração local para ${target} indisponível: ${detail}`,
  });
}

async function extractPdfTextWithPoppler(pdfPath: string) {
  return normalizeDocumentText(
    await runCommand("pdftotext", ["-layout", "-enc", "UTF-8", pdfPath, "-"]),
  );
}

async function renderPdfPagesToImages(pdfPath: string, outputDir: string, pageLimit = PDF_OCR_PAGE_LIMIT) {
  const imagePaths: string[] = [];

  for (let page = 1; page <= pageLimit; page += 1) {
    const outputBase = path.join(outputDir, `page-${page}`);
    try {
      await runCommand("pdftoppm", [
        "-png",
        "-f",
        String(page),
        "-l",
        String(page),
        "-singlefile",
        pdfPath,
        outputBase,
      ]);
      imagePaths.push(`${outputBase}.png`);
    } catch {
      break;
    }
  }

  return imagePaths;
}

async function runVisionOcr(imagePath: string, workDir: string) {
  const scriptPath = path.join(workDir, "ocr-vision.swift");
  await writeFile(scriptPath, VISION_OCR_SWIFT_SOURCE, "utf8");
  return normalizeDocumentText(await runCommand("swift", [scriptPath, imagePath], { cwd: workDir }));
}

function fileExtensionForMime(mimeType: string) {
  if (mimeType === "application/pdf") return ".pdf";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/jpeg") return ".jpg";
  return ".bin";
}

async function extractPdfViaOcr(pdfPath: string, workDir: string) {
  const imagePaths = await renderPdfPagesToImages(pdfPath, workDir);
  const pageTexts: string[] = [];

  for (const imagePath of imagePaths) {
    const text = await runVisionOcr(imagePath, workDir);
    if (text) {
      pageTexts.push(text);
    }
  }

  return normalizeDocumentText(pageTexts.join("\n\n"));
}

function parseAndNormalize(kind: DocumentImportInput["kind"], text: string) {
  return validateAndNormalize(kind, parseByKind(kind, text));
}

export async function extractDocumentLocally(
  input: DocumentImportInput,
  availability: LocalExtractionAvailability,
) {
  ensureSupportedLocally(input.kind, input.mimeType, availability);

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "aluguel-doc-"));
  const filePath = path.join(tempDir, `document${fileExtensionForMime(input.mimeType)}`);

  try {
    await writeFile(filePath, Buffer.from(input.base64Data, "base64"));

    const isPdf = input.mimeType === "application/pdf" || input.fileName.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      const embeddedText = await extractPdfTextWithPoppler(filePath);
      const embeddedFields = parseAndNormalize(input.kind, embeddedText);
      const shouldTryOcrForPdf =
        availability.ocr &&
        (input.kind === "cnh" || !hasRequiredFieldsForKind(input.kind, embeddedFields));

      if (!shouldTryOcrForPdf && hasRecognizedData(embeddedFields)) {
        return { fields: toCompleteFields(embeddedFields), source: "poppler" as const };
      }

      if (shouldTryOcrForPdf) {
        const ocrText = await extractPdfViaOcr(filePath, tempDir);
        const ocrFields = parseAndNormalize(input.kind, ocrText);
        const mergedFields = mergeFields(embeddedFields, ocrFields);
        const mergedFieldsWithOcrPriority = mergeFields(ocrFields, embeddedFields);

        if (hasRequiredFieldsForKind(input.kind, mergedFields) || hasRequiredFieldsForKind(input.kind, mergedFieldsWithOcrPriority)) {
          const preferredMerged =
            countRecognizedFields(mergedFieldsWithOcrPriority) > countRecognizedFields(mergedFields)
              ? mergedFieldsWithOcrPriority
              : mergedFields;
          return { fields: toCompleteFields(preferredMerged), source: "hybrid" as const };
        }

        if (countRecognizedFields(ocrFields) > countRecognizedFields(embeddedFields)) {
          return { fields: toCompleteFields(ocrFields), source: "ocr" as const };
        }

        const combinedFields = parseAndNormalize(input.kind, [embeddedText, ocrText].filter(Boolean).join("\n\n"));
        if (hasRecognizedData(combinedFields)) {
          return { fields: toCompleteFields(combinedFields), source: "hybrid" as const };
        }
      }

      return { fields: toCompleteFields(embeddedFields), source: "poppler" as const };
    }

    const ocrText = await runVisionOcr(filePath, tempDir);
    const fields = parseAndNormalize(input.kind, ocrText);
    return { fields: toCompleteFields(fields), source: "ocr" as const };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Falha ao extrair documento localmente.",
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function canExtractLocallyForMime(mimeType: string) {
  const availability = await getLocalDocumentExtractionAvailability();
  if (mimeType === "application/pdf") return availability.pdf;
  if (mimeType.startsWith("image/")) return availability.image;
  return false;
}
