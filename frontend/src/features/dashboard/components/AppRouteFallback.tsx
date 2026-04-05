import { Loader2 } from "lucide-react";
import "@/features/public/public-shell.css";

export function AppRouteFallback() {
  return (
    <div className="public-shell">
      <div className="public-shell__body">
        <div className="public-shell__card text-center">
          <div className="public-shell__icon">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="public-shell__badge">Preparando interface</div>
          <h1 className="public-shell__title">Carregando página</h1>
          <p className="public-shell__subtitle">Aguarde um instante.</p>
        </div>
      </div>
    </div>
  );
}
