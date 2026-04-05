import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IMPORT_KIND_LABELS, type ExtractedDocumentFields, type PendingImportReview } from "../types";
import { LabeledInput } from "./LabeledInput";

interface ImportPreviewEntry {
  key: keyof ExtractedDocumentFields;
  label: string;
  value: string;
}

interface ImportReviewDialogProps {
  open: boolean;
  review: PendingImportReview | null;
  previewEntries: ImportPreviewEntry[];
  onClose: () => void;
  onConfirm: () => void;
  onUpdateField: (field: keyof ExtractedDocumentFields, value: string) => void;
}

export function ImportReviewDialog({
  open,
  review,
  previewEntries,
  onClose,
  onConfirm,
  onUpdateField,
}: ImportReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Revisar dados importados</DialogTitle>
          <DialogDescription>
            {review
              ? `${IMPORT_KIND_LABELS[review.kind]}: ${review.fileName}`
              : "Confira os dados reconhecidos antes de preencher o formulário."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {review?.kind === "cnh" ? (
            <Alert>
              <AlertTitle>CNH preenche identificação</AlertTitle>
              <AlertDescription>
                Para endereço completo, cidade, estado e CEP, continue usando a importação do comprovante.
              </AlertDescription>
            </Alert>
          ) : null}

          {review?.kind === "comprovante" ? (
            <Alert>
              <AlertTitle>Comprovante preenche endereço</AlertTitle>
              <AlertDescription>
                O comprovante complementa os dados da CNH e não deve substituir informações boas de identidade.
              </AlertDescription>
            </Alert>
          ) : null}

          {previewEntries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {previewEntries.map((entry) => (
                <LabeledInput
                  key={entry.key}
                  label={entry.label}
                  value={entry.value}
                  onChange={(value) => onUpdateField(entry.key, value)}
                  className="rounded-lg border p-3"
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTitle>Nenhum dado revisável</AlertTitle>
              <AlertDescription>
                O documento foi lido, mas não encontramos campos com confiança suficiente para mostrar nesta prévia.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirm} disabled={!review}>
              Aplicar ao formulário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
