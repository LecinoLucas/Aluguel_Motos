import { useAuth } from "@/_core/hooks/useAuth";
import { AppFooter } from "@/components/AppFooter";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import "@/features/public/public-shell.css";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (user) {
      setLocation("/dashboard");
      return;
    }

    window.location.href = getLoginUrl();
  }, [loading, setLocation, user]);

  return (
    <div className="public-shell">
      <div className="public-shell__body">
        <div className="public-shell__card text-center">
          <div className="public-shell__icon">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="public-shell__badge">Acesso ao sistema</div>
          <h1 className="public-shell__title">Abrindo o sistema</h1>
          <p className="public-shell__subtitle">
            Voce sera redirecionado automaticamente.
          </p>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
