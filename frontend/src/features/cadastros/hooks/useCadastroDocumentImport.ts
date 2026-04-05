import { useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useContratoDocumentImport } from "@/features/gerar-contrato/hooks/useContratoDocumentImport";
import type { ExtractedDocumentFields, ImportKind } from "@/features/gerar-contrato/types";

interface UseCadastroDocumentImportOptions {
  onApplyImportedFields: (kind: ImportKind, fields: Partial<ExtractedDocumentFields>) => void;
}

export function useCadastroDocumentImport({ onApplyImportedFields }: UseCadastroDocumentImportOptions) {
  const locadorInputRef = useRef<HTMLInputElement>(null);
  const cnhInputRef = useRef<HTMLInputElement>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);
  const crlvInputRef = useRef<HTMLInputElement>(null);

  const backendAvailability = trpc.documentos.available.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
  });
  const extractDocument = trpc.documentos.extrair.useMutation();

  const importState = useContratoDocumentImport({
    backendAvailable: backendAvailability.data?.available,
    extractDocument: (input) => extractDocument.mutateAsync(input),
    onApplyImportedFields,
  });

  const openImportPicker = (kind: ImportKind) => {
    if (kind === "locador") locadorInputRef.current?.click();
    if (kind === "cnh") cnhInputRef.current?.click();
    if (kind === "comprovante") comprovanteInputRef.current?.click();
    if (kind === "crlv") crlvInputRef.current?.click();
  };

  return {
    ...importState,
    backendAvailable: backendAvailability.data?.available,
    locadorInputRef,
    cnhInputRef,
    comprovanteInputRef,
    crlvInputRef,
    openImportPicker,
  };
}