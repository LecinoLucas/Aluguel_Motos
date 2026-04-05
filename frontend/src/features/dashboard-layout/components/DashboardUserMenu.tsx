import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface DashboardUserMenuProps {
  email?: string | null;
  isCollapsed: boolean;
  name?: string | null;
  onLogout: () => void | Promise<void>;
}

export function DashboardUserMenu({ email, isCollapsed, name, onLogout }: DashboardUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9 shrink-0 border">
            <AvatarFallback className="text-xs font-medium">{name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-none">{name || "-"}</p>
              <p className="mt-1.5 truncate text-xs text-muted-foreground">{email || "-"}</p>
            </div>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}