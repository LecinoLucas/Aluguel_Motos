import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggleButton } from "./ThemeToggleButton";

interface DashboardMobileHeaderProps {
  title: string;
}

export function DashboardMobileHeader({ title }: DashboardMobileHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/88 px-2 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 rounded-2xl border border-border/70 bg-card/70" />
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Painel</span>
            <span className="tracking-tight text-foreground">{title}</span>
          </div>
        </div>
      </div>
      <ThemeToggleButton compact />
    </div>
  );
}
