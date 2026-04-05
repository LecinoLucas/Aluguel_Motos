import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { extractErrorMessage, logClientError } from "./lib/errors";
import "./index.css";

const queryClient = new QueryClient();
const reportedQueryErrors = new Set<string>();
const PREVIEW_BANNER_PATTERNS = [
  "preview mode",
  "this page is not live",
  "cannot be shared directly",
  "please publish to get a public link",
] as const;

function hideInjectedPreviewBanner() {
  if (typeof document === "undefined") return;

  const selectors = ["body *", "iframe"];

  for (const selector of selectors) {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

    for (const element of elements) {
      const text = element.textContent?.trim().toLowerCase() ?? "";
      if (!text) continue;

      const matchesPreviewBanner = PREVIEW_BANNER_PATTERNS.every((pattern) => text.includes(pattern));
      if (!matchesPreviewBanner) continue;

      element.style.display = "none";
      element.setAttribute("aria-hidden", "true");
    }
  }
}

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);

    const errorKey = `${event.query.queryHash}:${event.query.state.errorUpdatedAt}`;
    logClientError(`API Query Error:${event.query.queryHash}`, error);

    if (event.query.state.data === undefined && !reportedQueryErrors.has(errorKey)) {
      reportedQueryErrors.add(errorKey);
      toast.error("Erro ao carregar dados", {
        description: extractErrorMessage(error, "Nao foi possível carregar os dados."),
      });
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    logClientError(`API Mutation Error:${event.mutation.options.mutationKey?.join(".") ?? "unknown"}`, error);
  }
});

if (typeof window !== "undefined") {
  hideInjectedPreviewBanner();

  const observer = new MutationObserver(() => {
    hideInjectedPreviewBanner();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("error", (event) => {
    logClientError("Window Error", event.error ?? event.message);
    toast.error("Erro inesperado na interface", {
      description: "O erro real foi registrado no console do navegador.",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logClientError("Unhandled Promise Rejection", event.reason);
    toast.error("Falha inesperada na aplicação", {
      description: extractErrorMessage(event.reason, "O erro real foi registrado no console do navegador."),
    });
  });
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
