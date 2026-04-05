import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getValidationMessages } from "@/features/cadastros/validation";
import { Loader2 } from "lucide-react";
import { CadastroErrorAlert } from "./CadastroErrorAlert";
import { LocatarioFormFields } from "./LocatarioFormFields";
import type { LocatarioField, LocatarioFormData, LocatarioFormErrors } from "../types";

interface EditLocatarioDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: LocatarioFormData;
  errors?: LocatarioFormErrors;
  onFormChange: (field: LocatarioField, value: string) => void;
  isSubmitting: boolean;
  onSave: () => void;
}

export function EditLocatarioDialog({
  open,
  onOpenChange,
  form,
  errors = {},
  onFormChange,
  isSubmitting,
  onSave,
}: EditLocatarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="cadastros-dialog-overlay"
        className="cadastros-dialog sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Editar Locatário</DialogTitle>
          <DialogDescription>Atualize os dados do locatário selecionado</DialogDescription>
        </DialogHeader>
        <div className="cadastros-dialog__body">
          <CadastroErrorAlert title="Revise os dados do locatário" messages={getValidationMessages(errors)} />
          <LocatarioFormFields form={form} errors={errors} onChange={onFormChange} disableImmutable />
        </div>
        <div className="cadastros-dialog__footer">
          <Button onClick={onSave} disabled={isSubmitting} className="cadastros-primary-button w-full sm:w-auto">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
