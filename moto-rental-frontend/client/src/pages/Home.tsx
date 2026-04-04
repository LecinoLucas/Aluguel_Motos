import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-lg font-semibold">Abrindo o sistema</h1>
        <p className="text-sm text-muted-foreground">
          Voce sera redirecionado automaticamente.
        </p>
      </div>
    </div>
  );
}
