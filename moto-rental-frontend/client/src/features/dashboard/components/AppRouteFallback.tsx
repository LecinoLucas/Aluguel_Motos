import { Loader2 } from "lucide-react";

export function AppRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-lg font-semibold">Carregando página</h1>
        <p className="text-sm text-muted-foreground">Aguarde um instante.</p>
      </div>
    </div>
  );
}
