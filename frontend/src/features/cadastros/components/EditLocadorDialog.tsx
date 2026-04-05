import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getValidationMessages } from "@/features/cadastros/validation";
import { Loader2 } from "lucide-react";
import { CadastroErrorAlert } from "./CadastroErrorAlert";
import { LocadorFormFields } from "./LocadorFormFields";
import type { LocadorField, LocadorFormData, LocadorFormErrors } from "../types";

interface EditLocadorDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: LocadorFormData;
  errors?: LocadorFormErrors;
  onFormChange: (field: LocadorField, value: string) => void;
  isSubmitting: boolean;
  onSave: () => void;
}

export function EditLocadorDialog({
  open,
  onOpenChange,
  form,
  errors = {},
  onFormChange,
  isSubmitting,
  onSave,
}: EditLocadorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Locador</DialogTitle>
          <DialogDescription>Atualize os dados do locador selecionado</DialogDescription>
        </DialogHeader>
        <CadastroErrorAlert title="Revise os dados do locador" messages={getValidationMessages(errors)} />
        <LocadorFormFields form={form} errors={errors} onChange={onFormChange} disableCpf />
        <Button onClick={onSave} disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </DialogContent>
    </Dialog>
  );
}
