import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppFooter } from "@/components/AppFooter";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import "@/features/public/public-shell.css";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="public-shell">
      <div className="public-shell__body">
        <Card className="public-shell__card">
          <CardContent className="text-center">
            <div className="public-shell__icon">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-red-100" />
                <AlertCircle className="relative h-16 w-16 text-red-500" />
              </div>
            </div>
            <div className="public-shell__badge">Erro de navegação</div>
            <h1 className="public-shell__title">404</h1>
            <h2 className="mt-4 text-xl font-semibold text-slate-700">Page Not Found</h2>
            <p className="public-shell__subtitle">
              Sorry, the page you are looking for doesn't exist.
              <br />
              It may have been moved or deleted.
            </p>
            <div id="not-found-button-group" className="public-shell__actions">
              <Button
                onClick={handleGoHome}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <AppFooter />
    </div>
  );
}
