import { z } from "zod";

export const documentImportInputSchema = z.object({
  kind: z.enum(["locador", "cnh", "comprovante", "crlv"]),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  base64Data: z.string().min(1),
});

export const extractedFieldsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    nome: { type: "string" },
    cpf: { type: "string" },
    rg: { type: "string" },
    orgaoEmissor: { type: "string" },
    endereco: { type: "string" },
    cidade: { type: "string" },
    estado: { type: "string" },
    cep: { type: "string" },
    telefone: { type: "string" },
    cnh: { type: "string" },
    marca: { type: "string" },
    modelo: { type: "string" },
    ano: { type: "string" },
    cor: { type: "string" },
    placa: { type: "string" },
    chassi: { type: "string" },
    renavam: { type: "string" },
  },
  required: [
    "nome",
    "cpf",
    "rg",
    "orgaoEmissor",
    "endereco",
    "cidade",
    "estado",
    "cep",
    "telefone",
    "cnh",
    "marca",
    "modelo",
    "ano",
    "cor",
    "placa",
    "chassi",
    "renavam",
  ],
} as const;

export type DocumentImportInput = z.infer<typeof documentImportInputSchema>;