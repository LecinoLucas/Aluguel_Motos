import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardMobileHeaderProps {
  title: string;
}

export function DashboardMobileHeader({ title }: DashboardMobileHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="tracking-tight text-foreground">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}