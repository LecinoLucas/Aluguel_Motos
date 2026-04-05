import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload } from "lucide-react";

interface CadastroImportButtonProps {
  title: string;
  description: string;
  fileName?: string;
  isImporting: boolean;
  onClick: () => void;
}

export function CadastroImportButton({
  title,
  description,
  fileName,
  isImporting,
  onClick,
}: CadastroImportButtonProps) {
  return (
    <div className="cadastro-import-card">
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {fileName ? <p className="text-xs text-foreground">Arquivo: {fileName}</p> : null}
      </div>
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onClick} disabled={isImporting}>
        {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Importar
      </Button>
    </div>
  );
}