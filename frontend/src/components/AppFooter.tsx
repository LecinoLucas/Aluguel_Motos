export function AppFooter() {
  return (
    <footer className="border-t border-border/60 bg-[linear-gradient(90deg,var(--app-footer-from),var(--app-footer-via),var(--app-footer-to))] px-4 py-5 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground/70">
          Developer Signature
        </span>
        <p className="text-sm font-semibold text-foreground">
          @LecinoLucas Developer 2026
        </p>
      </div>
    </footer>
  );
}
