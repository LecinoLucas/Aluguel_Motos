import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import type { RefObject } from "react";
import { menuItems } from "../constants";
import { DashboardUserMenu } from "./DashboardUserMenu";

interface DashboardSidebarProps {
  isResizing: boolean;
  location: string;
  onLogout: () => void | Promise<void>;
  onNavigate: (path: string) => void;
  onStartResizing: () => void;
  sidebarRef: RefObject<HTMLDivElement | null>;
  user: {
    email?: string | null;
    name?: string | null;
  } | null;
}

export function DashboardSidebar({
  isResizing,
  location,
  onLogout,
  onNavigate,
  onStartResizing,
  sidebarRef,
  user,
}: DashboardSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="relative" ref={sidebarRef}>
      <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
        <SidebarHeader className="h-16 justify-center">
          <div className="flex w-full items-center gap-3 px-2 transition-all">
            <button
              onClick={toggleSidebar}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Toggle navigation"
            >
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            {!isCollapsed ? (
              <div className="min-w-0 items-center gap-2">
                <span className="truncate font-semibold tracking-tight">Aluguel de Motos</span>
              </div>
            ) : null}
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0">
          <SidebarMenu className="px-2 py-1">
            {menuItems.map((item) => {
              const isActive = location === item.path;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => onNavigate(item.path)}
                    tooltip={item.label}
                    className="h-10 font-normal transition-all"
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <DashboardUserMenu
            email={user?.email}
            isCollapsed={isCollapsed}
            name={user?.name}
            onLogout={onLogout}
          />
        </SidebarFooter>
      </Sidebar>

      <div
        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`}
        onMouseDown={onStartResizing}
        style={{ zIndex: 50 }}
      />
    </div>
  );
}