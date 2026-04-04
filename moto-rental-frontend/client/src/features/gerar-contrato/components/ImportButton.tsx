import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload } from "lucide-react";

interface ImportButtonProps {
  label: string;
  description: string;
  onClick: () => void;
  loading: boolean;
  fileName?: string;
}

export function ImportButton({
  label,
  description,
  onClick,
  loading,
  fileName,
}: ImportButtonProps) {
  return (
    <div className="contract-import-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">{label}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {fileName ? <p className="text-xs text-foreground">Arquivo: {fileName}</p> : null}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onClick} disabled={loading}>
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Importar
        </Button>
      </div>
    </div>
  );
}
