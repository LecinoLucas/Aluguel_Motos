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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Locatário</DialogTitle>
          <DialogDescription>Atualize os dados do locatário selecionado</DialogDescription>
        </DialogHeader>
        <CadastroErrorAlert title="Revise os dados do locatário" messages={getValidationMessages(errors)} />
        <LocatarioFormFields form={form} errors={errors} onChange={onFormChange} disableImmutable />
        <Button onClick={onSave} disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </DialogContent>
    </Dialog>
  );
}
