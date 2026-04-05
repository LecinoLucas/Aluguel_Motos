function isNodeModule(id: string) {
  return id.includes("node_modules");
}

export function createFrontendManualChunks(id: string) {
  if (!isNodeModule(id)) {
    return undefined;
  }

  if (id.includes("pdfjs-dist") || id.includes("tesseract.js")) {
    return "vendor-pdf";
  }

  if (id.includes("recharts") || id.includes("embla-carousel-react")) {
    return "vendor-visual";
  }

  if (id.includes("@radix-ui")) {
    return "vendor-radix";
  }

  if (
    id.includes("@trpc") ||
    id.includes("@tanstack/react-query") ||
    id.includes("superjson") ||
    id.includes("zod")
  ) {
    return "vendor-data";
  }

  if (
    id.includes("react-hook-form") ||
    id.includes("@hookform/resolvers") ||
    id.includes("react-day-picker") ||
    id.includes("input-otp")
  ) {
    return "vendor-forms";
  }

  if (
    id.includes("react") ||
    id.includes("react-dom") ||
    id.includes("scheduler") ||
    id.includes("wouter") ||
    id.includes("next-themes")
  ) {
    return "vendor-react";
  }

  if (
    id.includes("lucide-react") ||
    id.includes("class-variance-authority") ||
    id.includes("clsx") ||
    id.includes("tailwind-merge") ||
    id.includes("sonner") ||
    id.includes("cmdk") ||
    id.includes("date-fns")
  ) {
    return "vendor-ui";
  }

  return "vendor-misc";
}