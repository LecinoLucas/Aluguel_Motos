import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppRouteFallback } from "./features/dashboard/components/AppRouteFallback";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Cadastros = lazy(() => import("./pages/Cadastros"));
const Contratos = lazy(() => import("./pages/Contratos"));
const Manutencoes = lazy(() => import("./pages/Manutencoes"));
const Pagamentos = lazy(() => import("./pages/Pagamentos"));
const Multas = lazy(() => import("./pages/Multas"));
const GerarContrato = lazy(() => import("./pages/GerarContrato"));

function Router() {
  return (
    <Suspense fallback={<AppRouteFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/cadastros"} component={Cadastros} />
        <Route path={"/contratos"} component={Contratos} />
        <Route path={"/manutencoes"} component={Manutencoes} />
        <Route path={"/pagamentos"} component={Pagamentos} />
        <Route path={"/multas"} component={Multas} />
        <Route path={"/gerar-contrato"} component={GerarContrato} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
