import { TRPCError } from "@trpc/server";
import { ENV } from "../../_core/env";
import { invokeLLM } from "../../_core/llm";
import { storagePut } from "../../storage";
import { documentImportInputSchema, extractedFieldsSchema, type DocumentImportInput } from "./documentos.schemas";

function getDocumentExtractionPrompt(kind: DocumentImportInput["kind"]) {
  const common = [
    "Extraia os dados do documento brasileiro com alta precisão.",
    "Retorne SOMENTE os campos pedidos no schema JSON.",
    "Quando um campo não existir ou não for legível, retorne string vazia \"\".",
    "CPF deve ter 11 dígitos no formato 000.000.000-00.",
    "CEP deve ter 8 dígitos no formato 00000-000.",
    "Telefone deve incluir DDD, formato (00) 00000-0000.",
    "Placa de veículo pode estar no formato antigo ABC-1234 ou Mercosul ABC1D23.",
    "Chassi (VIN) tem exatamente 17 caracteres alfanuméricos, sem letras I, O ou Q.",
    "RENAVAM tem 9 a 11 dígitos.",
    "NÃO invente valores. Se estiver ilegível ou ausente, retorne \"\".",
    "NÃO confunda números: CPF tem 11 dígitos com checksum, CNH tem 11 dígitos sem formatação, RENAVAM tem 9-11 dígitos.",
  ].join(" ");

  if (kind === "locador") {
    return `${common} O documento pertence ao LOCADOR (proprietário da moto). Extraia: nome completo, CPF (validar 11 dígitos), RG, órgão emissor (ex: SSP/GO, DETRAN/SP), telefone com DDD, endereço completo, cidade, estado (por extenso, não sigla), CEP. Se for CNH + comprovante juntos, extraia de ambos.`;
  }

  if (kind === "cnh") {
    return `${common} O documento é uma CNH (Carteira Nacional de Habilitação) do LOCATÁRIO. Extraia: nome completo do condutor, CPF, RG, órgão emissor com UF (ex: SSP/GO), estado por extenso quando puder ser inferido do órgão emissor/UF, nº de registro da CNH (campo \"Nº REGISTRO\" com 11 dígitos), telefone se existir. ATENÇÃO: o número de registro da CNH é diferente do CPF, não confunda com datas, validade, emissão, código de segurança ou números soltos do documento.`;
  }

  if (kind === "comprovante") {
    return `${common} O documento é um comprovante de residência (conta de luz, água, telefone, etc.) do LOCATÁRIO. Extraia: nome do titular, CPF se aparecer, endereço completo (logradouro, número, complemento, bairro), cidade, estado (por extenso), CEP, telefone se aparecer. Priorize dados do titular/cliente e do local de consumo. Ignore dados da concessionária, agência, unidade consumidora, medidor, código de barras, valores e datas de vencimento.`;
  }

  return `${common} O documento é um CRLV/CRV (Certificado de Registro e Licenciamento de Veículo) de uma motocicleta. Extraia: marca (fabricante), modelo (nome do modelo), ano fabricação/modelo no formato AAAA/AAAA, cor predominante, placa, chassi (exatos 17 caracteres), RENAVAM (9-11 dígitos).`;
}

function buildDocumentContent(url: string, mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return {
      type: "image_url" as const,
      image_url: {
        url,
        detail: "high" as const,
      },
    };
  }

  return {
    type: "file_url" as const,
    file_url: {
      url,
      mime_type: mimeType === "application/pdf" ? "application/pdf" as const : undefined,
    },
  };
}

function sanitizeExtractedFields(value: unknown) {
  const empty = {
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
  };

  if (!value || typeof value !== "object") {
    return empty;
  }

  const source = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(empty).map((key) => [key, typeof source[key] === "string" ? source[key].trim() : ""]),
  ) as typeof empty;
}

async function extractWithOpenAI(input: DocumentImportInput) {
  if (!ENV.openaiApiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "OPENAI_API_KEY não configurada no backend local.",
    });
  }

  const isPdf = input.mimeType === "application/pdf" || input.fileName.toLowerCase().endsWith(".pdf");
  const isImage = input.mimeType.startsWith("image/");
  if (!isPdf && !isImage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Formato não suportado na extração avançada local. Use PDF ou imagem (JPG/PNG/WEBP).",
    });
  }

  const userContent = isPdf
    ? [
        {
          type: "input_file",
          filename: input.fileName || "documento.pdf",
          file_data: input.base64Data,
        },
        {
          type: "input_text",
          text: getDocumentExtractionPrompt(input.kind),
        },
      ]
    : [
        {
          type: "input_image",
          image_url: `data:${input.mimeType};base64,${input.base64Data}`,
          detail: "high",
        },
        {
          type: "input_text",
          text: getDocumentExtractionPrompt(input.kind),
        },
      ];

  const payload = {
    model: ENV.openaiModel,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "Você é um extrator especializado em documentos brasileiros. Responda estritamente em JSON válido seguindo o schema.",
          },
        ],
      },
      {
        role: "user",
        content: userContent,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "document_extraction",
        strict: true,
        schema: extractedFieldsSchema,
      },
    },
    temperature: 0,
    max_output_tokens: 2000,
  };

  const response = await fetch(`${ENV.openaiBaseUrl.replace(/\/$/, "")}/responses`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.openaiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Falha na extração OpenAI (${response.status}): ${detail}`,
    });
  }

  const data = (await response.json()) as any;
  const content =
    data?.output_text ||
    data?.output?.flatMap((item: any) => item?.content || []).find((part: any) => part?.type === "output_text")?.text ||
    "{}";

  let parsed: unknown = {};
  try {
    parsed = JSON.parse(typeof content === "string" ? content : "{}");
  } catch {
    parsed = {};
  }

  return {
    fields: sanitizeExtractedFields(parsed),
  };
}

export function isDocumentExtractionAvailable() {
  return Boolean((ENV.forgeApiUrl && ENV.forgeApiKey) || ENV.openaiApiKey);
}

export async function extractDocument(input: DocumentImportInput) {
  const parsedInput = documentImportInputSchema.parse(input);

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    return extractWithOpenAI(parsedInput);
  }

  const buffer = Buffer.from(parsedInput.base64Data, "base64");
  const storageKey = `document-imports/${Date.now()}-${parsedInput.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploaded = await storagePut(storageKey, buffer, parsedInput.mimeType);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um extrator especializado em documentos brasileiros (CNH, CRLV, comprovantes de residência, RG). Analise a imagem ou PDF com extrema precisão. Retorne TODOS os campos no schema JSON. Use string vazia quando o dado não existir ou estiver ilegível. NUNCA invente dados. Valide CPF (11 dígitos com checksum), diferencie CPF de número de CNH (ambos 11 dígitos). Formate: CPF como 000.000.000-00, CEP como 00000-000, telefone como (00) 00000-0000.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: getDocumentExtractionPrompt(parsedInput.kind) },
          buildDocumentContent(uploaded.url, parsedInput.mimeType),
        ],
      },
    ],
    outputSchema: {
      name: "document_extraction",
      strict: true,
      schema: extractedFieldsSchema,
    },
  });

  const message = response.choices[0]?.message?.content;
  const textContent = typeof message === "string"
    ? message
    : Array.isArray(message)
      ? message.find((part) => part.type === "text")?.text || "{}"
      : "{}";

  let parsed: unknown = {};
  try {
    parsed = JSON.parse(textContent);
  } catch {
    parsed = {};
  }

  return {
    fields: sanitizeExtractedFields(parsed),
  };
}