import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

export function AuthRequiredScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-8 p-8">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-center text-2xl font-semibold tracking-tight">Entrar para continuar</h1>
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            O acesso ao sistema exige autenticacao. Continue para iniciar o login.
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.href = getLoginUrl();
          }}
          size="lg"
          className="w-full shadow-lg transition-all hover:shadow-xl"
        >
          Entrar
        </Button>
      </div>
    </div>
  );
}