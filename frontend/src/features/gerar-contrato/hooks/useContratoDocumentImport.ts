import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  extractLocally,
  fileToBase64,
  getPendingImportPreviewEntries,
  hasRecognizedData,
  validateAndNormalize,
} from "../document-import";
import {
  defaultImportedFiles,
  defaultImportState,
  type ExtractedDocumentFields,
  type ImportKind,
  type PendingImportReview,
} from "../types";

type ExtractDocumentInput = {
  kind: ImportKind;
  fileName: string;
  mimeType: string;
  base64Data: string;
};

type ExtractDocumentResult = {
  fields: Partial<ExtractedDocumentFields>;
};

interface UseContratoDocumentImportOptions {
  backendAvailable?: boolean;
  extractDocument: (input: ExtractDocumentInput) => Promise<ExtractDocumentResult>;
  onApplyImportedFields: (kind: ImportKind, fields: Partial<ExtractedDocumentFields>) => void;
}

export function useContratoDocumentImport({
  backendAvailable,
  extractDocument,
  onApplyImportedFields,
}: UseContratoDocumentImportOptions) {
  const [isImporting, setIsImporting] = useState(defaultImportState);
  const [importedFiles, setImportedFiles] = useState(defaultImportedFiles);
  const [pendingImportReview, setPendingImportReview] = useState<PendingImportReview | null>(null);
  const backendUnavailableRef = useRef(false);

  const isAnyImporting = Object.values(isImporting).some(Boolean);
  const importPreviewEntries = useMemo(
    () => getPendingImportPreviewEntries(pendingImportReview),
    [pendingImportReview],
  );

  const setImportLoading = (kind: ImportKind, value: boolean) => {
    setIsImporting((prev) => ({ ...prev, [kind]: value }));
  };

  const canUseBackend = (file: File) => {
    if (backendUnavailableRef.current) return false;
    if (!backendAvailable) return false;
    if (file.type === "text/plain" || file.type === "") return false;
    return true;
  };

  const confirmImportReview = () => {
    if (!pendingImportReview) return;

    onApplyImportedFields(pendingImportReview.kind, pendingImportReview.fields);
    setImportedFiles((prev) => ({
      ...prev,
      [pendingImportReview.kind]: pendingImportReview.fileName,
    }));
    toast.success("Dados aplicados", {
      description: "Os campos revisados foram preenchidos no formulário.",
    });
    setPendingImportReview(null);
  };

  const cancelImportReview = () => {
    setPendingImportReview(null);
  };

  const updatePendingImportField = (field: keyof ExtractedDocumentFields, value: string) => {
    setPendingImportReview((prev) =>
      prev
        ? {
            ...prev,
            fields: {
              ...prev.fields,
              [field]: value,
            },
          }
        : prev,
    );
  };

  const handleImport = async (kind: ImportKind, file?: File) => {
    if (!file) return;

    setImportLoading(kind, true);

    try {
      let fields: Partial<ExtractedDocumentFields> | null = null;

      if (canUseBackend(file)) {
        try {
          const base64Data = await fileToBase64(file);
          const result = await extractDocument({
            kind,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            base64Data,
          });
          fields = result.fields;
        } catch {
          backendUnavailableRef.current = true;
          fields = await extractLocally(kind, file);
        }
      } else {
        fields = await extractLocally(kind, file);
      }

      if (fields) {
        fields = validateAndNormalize(kind, fields);
      }

      if (!fields || !hasRecognizedData(fields)) {
        throw new Error("Não consegui identificar dados úteis nesse documento. Tente uma imagem mais nítida ou um PDF legível.");
      }

      setPendingImportReview({
        kind,
        fileName: file.name,
        fields,
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Não foi possível processar o documento. Tente novamente com um arquivo mais nítido.";
      toast.error("Falha ao importar documento", { description });
    } finally {
      setImportLoading(kind, false);
    }
  };

  const handleFileChange =
    (kind: ImportKind) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      await handleImport(kind, file);
      event.target.value = "";
    };

  return {
    importedFiles,
    importPreviewEntries,
    isAnyImporting,
    isImporting,
    pendingImportReview,
    cancelImportReview,
    confirmImportReview,
    handleFileChange,
    setPendingImportReview,
    updatePendingImportField,
  };
}