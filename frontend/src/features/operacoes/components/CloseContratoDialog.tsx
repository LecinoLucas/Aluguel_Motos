import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface CloseContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataFim: string;
  minDate: string;
  maxDate: string;
  isSubmitting: boolean;
  onDataFimChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
}

export function CloseContratoDialog({
  open,
  onOpenChange,
  dataFim,
  minDate,
  maxDate,
  isSubmitting,
  onDataFimChange,
  onSubmit,
}: CloseContratoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar contrato</DialogTitle>
          <DialogDescription>
            Informe a data real de devolução da moto. As cobranças semanais futuras em aberto serão removidas.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium">Data de devolução</label>
            <Input
              type="date"
              value={dataFim}
              min={minDate}
              max={maxDate}
              onChange={(event) => onDataFimChange(event.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !dataFim} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar encerramento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
