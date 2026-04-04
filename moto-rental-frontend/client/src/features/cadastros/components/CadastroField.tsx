import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useId, type ComponentProps } from "react";

interface CadastroFieldProps extends ComponentProps<typeof Input> {
  label: string;
  error?: string;
  hint?: string;
}

export function CadastroField({ label, error, hint, className, ...props }: CadastroFieldProps) {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
