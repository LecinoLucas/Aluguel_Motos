import type { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

import type {
  ExtractedDocumentFields,
  ImportKind,
  PendingImportReview,
} from "./types";
import { getImportPreviewEntries } from "./utils";

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

const OCR_TEXT_MIN_LENGTH = 80;
const PDF_OCR_PAGE_LIMIT = 3;
const OCR_ROTATIONS = [0, 90, 270, 180];

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  for (let t = 9; t <= 10; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) {
      sum += Number(digits[i]) * (t + 1 - i);
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
  for (let i = 0; i < 10; i++) {
    sum += Number(padded[i]) * weights[i];
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
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 2 && cleaned.length >= 6;
}

function cleanExtractedName(name: string): string {
  return name
    .replace(/\b(REPUBLICA|FEDERATIVA|BRASIL|CARTEIRA|HABILITACAO|VALIDADE|NACIONAL|DEPARTAMENTO|DETRAN|TRANSITO|EQUATORIAL|ENERGIA|FATURA|CONTA)\b/gi, "")
    .replace(/[0-9]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanExtractedAddress(address: string): string {
  return address
    .replace(/\b(ENDERE[ÇC]O|LOGRADOURO|LOCAL DE CONSUMO|END\.?)\b[:\s-]*/gi, "")
    .replace(/\b(CEP|CPF|CNPJ|FONE|TELEFONE|CELULAR)\b.*$/gi, "")
    .replace(/\b(BRASIL|GOV\.?BR)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .replace(/[.,;:-]\s*$/, "");
}

function normalizeDocumentText(text: string): string {
  return text
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findFirstGroup(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }
  return "";
}

function findFirstValidCpf(text: string): string {
  const patterns = [
    /CPF[^0-9]{0,10}([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2})/g,
    /\b([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2})\b/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const candidate = match[1];
      if (isValidCpf(candidate)) return candidate;
    }
  }
  return "";
}

function findFirstCpfCandidate(text: string): string {
  const patterns = [
    /CPF[^0-9]{0,10}([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2})/g,
    /([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2})/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match?.[1]) {
        return match[1];
      }
    }
  }

  return "";
}

function pickLikelyUppercaseLine(text: string, blacklist: RegExp[] = []): string {
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

function looksLikeAddressLine(line: string): boolean {
  return /\b(RUA|R\.|AV(?:ENIDA)?|AL(?:AMEDA)?|TRAV(?:ESSA)?|RESIDENCIAL|SETOR|QD\.?|QUADRA|LT\.?|LOTE|EST(?:RADA)?|ROD(?:OVIA)?|FAZENDA|CH[ÁA]CARA|CONDOM[ÍI]NIO|VILA|N[ÚU]MERO|NUMERO)\b/.test(line);
}

function looksLikeFieldLabelLine(line: string): boolean {
  const normalized = line.trim().toUpperCase();
  if (!normalized || /\d/.test(normalized)) {
    return false;
  }

  return /\b(NOME|SOBRENOME|CPF|RG|IDENTIDADE|DOC\.?|ORG[ÃA]O|EMISSOR|UF|REGISTRO|VALIDADE|NASCIMENTO|CATEGORIA|PLACA|MODELO|MARCA|COR|CHASSI|RENAVAM|ANO|LOGRADOURO|ENDERE[ÇC]O|CEP|CIDADE|ESTADO)\b/.test(normalized);
}

function isUtilityNoiseLine(line: string): boolean {
  return /\b(EQUATORIAL|ENERGIA|FATURA|CONTA|VENCIMENTO|REFERENTE|UNIDADE\s+CONSUMIDORA|INSTALA[ÇC][AÃ]O|MEDIDOR|ATENDIMENTO|AG[ÊE]NCIA|EMISS[ÃA]O|TARIFA|C[ÓO]DIGO\s+DE\s+BARRAS|TOTAL\s+A\s+PAGAR|SANEAGO|CELPE|CPFL|CEMIG|ENEL|SABESP|COMPANHIA|DISTRIBUI[ÇC][AÃ]O)\b/.test(line);
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  if (digits.length !== 11) return cpf.trim();
  if (!isValidCpf(digits)) return cpf.trim();
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) return cep.trim();
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

function formatPhone(phone: string): string {
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

function findFirstCepCandidate(text: string): string {
  const patterns = [
    /CEP[^A-Z0-9]{0,6}([0-9OQDIL|!ZSBG]{5}[\s.-]?[0-9OQDIL|!ZSBG]{3})/g,
    /\b([0-9OQDIL|!ZSBG]{5}[\s.-]?[0-9OQDIL|!ZSBG]{3})\b/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const candidate = normalizeOcrDigits(match[1]).replace(/\D/g, "");
      if (candidate.length === 8) {
        return candidate;
      }
    }
  }

  return "";
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

function formatState(ufOrState: string): string {
  const value = ufOrState.trim().toUpperCase();
  return siglaPorEstado[value] || (ufPorSigla[value] ? value : ufOrState.trim());
}

function formatOrgaoEmissor(value: string): string {
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

function hasUsableText(text: string): boolean {
  return text.replace(/\s+/g, " ").trim().length >= OCR_TEXT_MIN_LENGTH;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
}

function getCanvas2DContext(
  canvas: HTMLCanvasElement,
  options?: CanvasRenderingContext2DSettings,
) {
  return canvas.getContext("2d", options);
}

function cloneCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement("canvas");
  copy.width = canvas.width;
  copy.height = canvas.height;
  const context = getCanvas2DContext(copy, { willReadFrequently: true });
  if (context) {
    context.drawImage(canvas, 0, 0);
  }
  return copy;
}

function enhanceCanvasForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = getCanvas2DContext(canvas, { willReadFrequently: true });
  if (!context) {
    return canvas;
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const avg = (data[index] + data[index + 1] + data[index + 2]) / 3;
    const value = avg > 165 ? 255 : 0;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

function cropCanvasToContent(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = getCanvas2DContext(canvas, { willReadFrequently: true });
  if (!context) {
    return canvas;
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const isInk = data[index] < 245 || data[index + 1] < 245 || data[index + 2] < 245;
      if (isInk) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    return canvas;
  }

  const padding = Math.max(12, Math.round(Math.min(width, height) * 0.02));
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - cropX, maxX - minX + padding * 2 + 1);
  const cropHeight = Math.min(height - cropY, maxY - minY + padding * 2 + 1);

  const cropped = document.createElement("canvas");
  cropped.width = Math.max(1, cropWidth);
  cropped.height = Math.max(1, cropHeight);
  const croppedContext = getCanvas2DContext(cropped);
  if (!croppedContext) {
    return canvas;
  }

  croppedContext.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return cropped;
}

function rotateCanvas(canvas: HTMLCanvasElement, angle: number): HTMLCanvasElement {
  if (angle === 0) {
    return cloneCanvas(canvas);
  }

  const radians = (angle * Math.PI) / 180;
  const rotated = document.createElement("canvas");
  const swapSides = angle === 90 || angle === 270;
  rotated.width = swapSides ? canvas.height : canvas.width;
  rotated.height = swapSides ? canvas.width : canvas.height;
  const context = getCanvas2DContext(rotated, { willReadFrequently: true });

  if (!context) {
    return cloneCanvas(canvas);
  }

  context.translate(rotated.width / 2, rotated.height / 2);
  context.rotate(radians);
  context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return rotated;
}

function scoreRecognizedText(text: string): number {
  const normalized = normalizeDocumentText(text).toUpperCase();
  if (!normalized) {
    return 0;
  }

  const words = normalized.split(/\s+/).filter((word) => word.length > 1).length;
  const digits = (normalized.match(/\d/g) || []).length;
  const signals = [/CPF/, /CNH/, /REGISTRO/, /RENAVAM/, /PLACA/, /ENDERE/, /LOGRADOURO/, /MOTORISTA/, /MODELO/, /NOME/]
    .reduce((total, regex) => total + (regex.test(normalized) ? 30 : 0), 0);

  return normalized.length + words * 8 + digits * 2 + signals;
}

function getOcrCanvasVariants(canvas: HTMLCanvasElement): HTMLCanvasElement[] {
  return [
    cropCanvasToContent(cloneCanvas(canvas)),
    cropCanvasToContent(enhanceCanvasForOCR(cloneCanvas(canvas))),
  ];
}

async function recognizeCanvasText(canvas: HTMLCanvasElement): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("por+eng");

  try {
    let bestText = "";
    let bestScore = -1;

    for (const variant of getOcrCanvasVariants(canvas)) {
      for (const angle of OCR_ROTATIONS) {
        const candidate = cropCanvasToContent(rotateCanvas(variant, angle));
        const result = await worker.recognize(candidate);
        const text = normalizeDocumentText(result.data.text);
        const score = scoreRecognizedText(text);

        if (score > bestScore) {
          bestScore = score;
          bestText = text;
        }
      }
    }

    return bestText;
  } finally {
    await worker.terminate();
  }
}

async function renderPdfPageToCanvas(page: PDFPageProxy): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = getCanvas2DContext(canvas, { willReadFrequently: true });

  if (!context) {
    throw new Error("Não foi possível preparar a imagem para OCR.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Não foi possível abrir a imagem enviada."));
      img.src = objectUrl;
    });

    const largestDimension = Math.max(image.width, image.height);
    const scale = largestDimension < 1400 ? 2 : largestDimension > 2200 ? 2200 / largestDimension : 1;
    const canvas = document.createElement("canvas");
    const context = getCanvas2DContext(canvas, { willReadFrequently: true });

    if (!context) {
      throw new Error("Não foi possível preparar a imagem para OCR.");
    }

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  const embeddedPages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    embeddedPages.push(text);
  }

  const embeddedText = normalizeDocumentText(embeddedPages.join("\n"));
  if (hasUsableText(embeddedText)) {
    return embeddedText;
  }

  const ocrPages: string[] = [];
  const pagesToRead = Math.min(pdf.numPages, PDF_OCR_PAGE_LIMIT);

  for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber += 1) {
    try {
      const page = await pdf.getPage(pageNumber);
      const canvas = await renderPdfPageToCanvas(page);
      ocrPages.push(await recognizeCanvasText(canvas));
    } catch {
      // If OCR preparation fails for a page, continue and rely on remaining pages or embedded text.
    }
  }

  const ocrText = normalizeDocumentText(ocrPages.join("\n"));
  if (hasUsableText(ocrText)) {
    return ocrText;
  }

  return embeddedText;
}

async function readDocumentText(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return extractPdfText(file);
  }

  if (isImageFile(file)) {
    const canvas = await imageFileToCanvas(file);
    return recognizeCanvasText(canvas);
  }

  return normalizeDocumentText(await file.text());
}

function looksLikeVehicleLabelLine(line: string): boolean {
  return /\b(CAPACIDADE|CATEGORIA|RENAVAM|PLACA|EXERC[ÍI]CIO|ANO|MOTOR|EIXOS|LOTA[ÇC][AÃ]O|CARROCERIA|NOME|CPF|LOCAL|DATA|MARCA|MODELO|ESP[ÉE]CIE|TIPO|CHASSI|COR|COMBUST[ÍI]VEL|QRCODE|CRV)\b/.test(line);
}

function extractValueAfterLabel(lines: string[], labelPattern: RegExp): string {
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
): string {
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

function findCRLVYearPair(lines: string[], text: string): string {
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

function findCRLVMarcaModelo(lines: string[], text: string): string {
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

function findCRLVColor(lines: string[], text: string): string {
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

function parseCNHText(text: string): Partial<ExtractedDocumentFields> {
  const normalized = normalizeDocumentText(text);
  const upper = normalized.toUpperCase();
  const lines = upper.split("\n").map((line) => line.trim()).filter(Boolean);

  const cpf = findFirstValidCpf(upper) || findFirstCpfCandidate(upper);
  const cnhFromLabel = findFirstGroup(
    extractValueAfterLabel(lines, /\b(?:N[ºO°]?\s*REGISTRO|REGISTRO|N[ºO°]?\s*REG)\b/) || upper,
    [
      /(?:N[ºO]? ?REGISTRO|REGISTRO)[^0-9]{0,8}([0-9]{9,11})/,
      /\bCNH[^0-9]{0,6}([0-9]{9,11})\b/,
    ],
  );

  let cnh = cnhFromLabel;
  if (!cnh) {
    const cpfDigits = cpf.replace(/\D/g, "");
    const elevenDigitMatches = upper.match(/\b([0-9]{11})\b/g) || [];
    cnh = elevenDigitMatches.find((m) => m !== cpfDigits && !isValidCpf(m)) || "";
  }

  const rgLine = extractValueAfterLabel(lines, /\b(?:IDENTIDADE|DOC\.?\s*IDENTIDADE|RG)\b/);
  const identityParts = extractIdentityLineParts(rgLine);
  const rg = identityParts.rg || findFirstGroup(rgLine || upper, [
    /(?:IDENTIDADE|DOC\.? ?IDENTIDADE|RG)[^A-Z0-9]{0,6}([0-9][0-9.\-A-Z]{3,14})/,
    /\b([0-9][0-9.\-A-Z]{4,14})\b/,
  ]);
  const orgaoEmissor = identityParts.orgaoEmissor || formatOrgaoEmissor(
    findFirstGroup(rgLine || upper, [
      /\b(SSP\/?[A-Z]{2}|SESP\/?[A-Z]{2}|DETRAN\/?[A-Z]{2}|IFP\/?[A-Z]{2}|PC\/?[A-Z]{2})\b/,
      /\b(SSP\s?[A-Z]{2}|SESP\s?[A-Z]{2}|DETRAN\s?[A-Z]{2}|IFP\s?[A-Z]{2}|PC\s?[A-Z]{2})\b/,
      /\b(SSP-[A-Z]{2}|SESP-[A-Z]{2}|DETRAN-[A-Z]{2}|IFP-[A-Z]{2}|PC-[A-Z]{2})\b/,
    ]),
  );
  const telefone = findFirstGroup(upper, [
    /(?:TELEFONE|CELULAR|FONE|TEL)[^0-9]{0,4}(\(?[0-9]{2}\)?[\s.-]?[0-9]{4,5}[\s.-]?[0-9]{4})/,
  ]);

  const nomeFromLabel = findFirstGroup(
    extractValueAfterLabel(lines, /\b(?:NOME|NOME E SOBRENOME|NOME DO CONDUTOR)\b/) || upper,
    [/(?:NOME|NOME E SOBRENOME|NOME DO CONDUTOR)[^A-ZÀ-Ú]{0,4}([A-ZÀ-Ú][A-ZÀ-Ú ]{7,})/],
  );

  const nome = cleanExtractedName(
    nomeFromLabel ||
      pickLikelyUppercaseLine(upper, [
        /REPUBLICA/, /FEDERATIVA/, /CARTEIRA/, /HABILITACAO/,
        /VALIDADE/, /NACIONAL/, /DEPARTAMENTO/, /DETRAN/,
        /TRANSITO/, /PERMISSAO/, /FILIACAO/, /DOC IDENTIDADE/,
        /LOCAL/, /EMISSAO/, /NASCIMENTO/, /OBSERVACOES/,
        /\d{3}\.\d{3}\.\d{3}/,
      ]),
  );

  const estadoFromIssuer = (() => {
    const match = orgaoEmissor.match(/\/([A-Z]{2})$/);
    return match ? formatState(match[1]) : "";
  })();

  return {
    nome: looksLikeName(nome) ? nome : "",
    cpf: formatCpf(cpf),
    cnh,
    rg,
    orgaoEmissor,
    estado: estadoFromIssuer,
    telefone: formatPhone(telefone),
  };
}

function parseComprovanteText(text: string): Partial<ExtractedDocumentFields> {
  const normalized = normalizeDocumentText(text);
  const upper = normalized.toUpperCase();
  const lines = upper.split("\n").map((line) => line.trim()).filter(Boolean);

  const nomeLabelValue = extractValueAfterLabel(lines, /\b(?:NOME|CLIENTE|TITULAR|CONSUMIDOR(?:A)?|BENEFICI[ÁA]RIO)\b/);
  const nomeRaw =
    findFirstGroup(nomeLabelValue || upper, [
      /(?:NOME|CLIENTE|TITULAR|CONSUMIDOR(?:A)?|BENEFICI[ÁA]RIO)[^A-ZÀ-Ú]{0,6}([A-ZÀ-Ú][A-ZÀ-Ú ]{7,})/,
    ]) ||
    pickLikelyUppercaseLine(upper, [
      /EQUATORIAL/, /ENERGIA/, /FATURA/, /CONTA/,
      /VENCIMENTO/, /REFERENTE/, /UNIDADE/, /ENEL/,
      /SANEAGO/, /CELPE/, /CPFL/, /CEMIG/, /SABESP/,
      /AG[ÊE]NCIA/, /ATENDIMENTO/, /DISTRIBUI[ÇC][AÃ]O/,
    ]);

  const nome = cleanExtractedName(nomeRaw);

  const enderecoFromLabel = cleanExtractedAddress(
    findFirstGroup(upper, [/(?:ENDERE[ÇC]O|LOGRADOURO|LOCAL DE CONSUMO)[^A-Z0-9]{0,6}([A-Z0-9À-Ú,./\- ]{12,})/]),
  );
  const enderecoLineIndex = lines.findIndex((line) => looksLikeAddressLine(line) && !isUtilityNoiseLine(line));
  const enderecoFromLine = enderecoLineIndex >= 0 ? lines[enderecoLineIndex] : "";
  const enderecoComplemento =
    enderecoLineIndex >= 0
      ? (lines
          .slice(enderecoLineIndex + 1, enderecoLineIndex + 3)
          .find((line) => !isUtilityNoiseLine(line) && !/\b([A-ZÀ-Ú]{3,}(\s+[A-ZÀ-Ú]+)*)\s*[-\/]?\s*[A-Z]{2}\b/.test(line) && !/\bCEP\b/.test(line)) || "")
      : "";
  const endereco = cleanExtractedAddress([enderecoFromLabel, enderecoFromLine, enderecoComplemento].filter(Boolean).join(", "));

  const cep = findFirstGroup(upper, [
    /(?:CEP)[^0-9]{0,4}([0-9]{5}-?[0-9]{3})/,
    /\b([0-9]{5}-[0-9]{3})\b/,
    /\b([0-9]{8})\b/,
  ]) || findFirstCepCandidate(upper);
  const cepDigits = normalizeOcrDigits(cep).replace(/\D/g, "");
  const validCep = cepDigits.length === 8 && !isValidCpf(`${cepDigits}000`) ? cep : "";

  const cidadeUfCandidate = findBestCidadeUfMatch(lines);
  const cidadeUfMatch = cidadeUfCandidate?.match || null;
  const uf = cidadeUfCandidate?.uf || "";

  const cpf = findFirstValidCpf(upper);
  const telefone = findFirstGroup(upper, [
    /(?:TELEFONE|CELULAR|FONE|TEL)[^0-9]{0,4}(\(?[0-9]{2}\)?[\s.-]?[0-9]{4,5}[\s.-]?[0-9]{4})/,
    /\b(\(?[0-9]{2}\)?[\s.-]?[0-9]{4,5}[\s.-]?[0-9]{4})\b/,
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

function parseCRLVText(text: string): Partial<ExtractedDocumentFields> {
  const normalized = normalizeDocumentText(text);
  const upper = normalized.toUpperCase();
  const lines = upper.split("\n").map((line) => line.trim()).filter(Boolean);

  const placaFromLabel = extractValueAfterLabel(lines, /\bPLACA\b/);
  const placaRaw = findFirstGroup(placaFromLabel || upper, [
    /(?:PLACA|PLATE)[^A-Z0-9]{0,6}([A-Z]{3}[\s-]?[0-9][A-Z0-9][0-9]{2})/,
    /\b([A-Z]{3}[\s-]?[0-9][A-Z0-9][0-9]{2})\b/,
    /\b([A-Z]{3}[\s-]?[0-9]{4})\b/,
  ]);
  const placa = placaRaw.replace(/[\s-]/g, "");

  const chassiFromLabel = extractValueAfterLabel(lines, /\bCHASSI\b/);
  const chassiRaw = findFirstGroup(chassiFromLabel || upper, [
    /(?:CHASSI|CHASI|CHASSIS)[^A-Z0-9]{0,6}([A-HJ-NPR-Z0-9]{17})/,
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

function parseLocadorDocumentText(text: string): Partial<ExtractedDocumentFields> {
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

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const slice = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...Array.from(slice));
  }

  return btoa(binary);
}

export async function extractLocally(kind: ImportKind, file: File) {
  const text = await readDocumentText(file);
  if (!text) {
    throw new Error("Não foi possível extrair texto do arquivo.");
  }

  if (kind === "locador") {
    return parseLocadorDocumentText(text);
  }
  if (kind === "cnh") {
    return parseCNHText(text);
  }
  if (kind === "comprovante") {
    return parseComprovanteText(text);
  }
  return parseCRLVText(text);
}

export function hasRecognizedData(fields: Partial<ExtractedDocumentFields>) {
  return Object.values(fields).some((value) => Boolean(value?.trim()));
}

export function validateAndNormalize(
  kind: ImportKind,
  fields: Partial<ExtractedDocumentFields>,
): Partial<ExtractedDocumentFields> {
  const out = { ...fields };

  if (out.cpf) {
    const cpfDigits = out.cpf.replace(/\D/g, "");
    out.cpf = cpfDigits.length === 11 && isValidCpf(cpfDigits) ? formatCpf(cpfDigits) : "";
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

    if (out.cor) {
      out.cor = out.cor.trim().toUpperCase();
    }
    if (out.marca) {
      out.marca = out.marca.trim().toUpperCase();
    }
    if (out.modelo) {
      out.modelo = out.modelo.trim().toUpperCase();
    }
  }

  return out;
}

export function getPendingImportPreviewEntries(review: PendingImportReview | null) {
  return getImportPreviewEntries(review);
}