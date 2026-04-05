import { useAuth } from "@/_core/hooks/useAuth";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppFooter } from "@/components/AppFooter";
import { DashboardMenuItem, menuItems } from "@/features/dashboard-layout/constants";
import { AuthRequiredScreen } from "@/features/dashboard-layout/components/AuthRequiredScreen";
import { DashboardMobileHeader } from "@/features/dashboard-layout/components/DashboardMobileHeader";
import { DashboardSidebar } from "@/features/dashboard-layout/components/DashboardSidebar";
import { usePersistentSidebarWidth } from "@/features/dashboard-layout/hooks/usePersistentSidebarWidth";
import { useSidebarResize } from "@/features/dashboard-layout/hooks/useSidebarResize";
import { useIsMobile } from "@/hooks/useMobile";
import { CSSProperties } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = usePersistentSidebarWidth();
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return <AuthRequiredScreen />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();
  const { isResizing, sidebarRef, startResizing } = useSidebarResize({
    isCollapsed,
    setSidebarWidth,
  });

  return (
    <>
      <DashboardSidebar
        isResizing={isResizing}
        location={location}
        onLogout={logout}
        onNavigate={setLocation}
        onStartResizing={startResizing}
        sidebarRef={sidebarRef}
        user={user}
      />

      <SidebarInset>
        {isMobile ? <DashboardMobileHeader title={getActiveMenuTitle(activeMenuItem)} /> : null}
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
        <AppFooter />
      </SidebarInset>
    </>
  );
}

function getActiveMenuTitle(activeMenuItem?: DashboardMenuItem) {
  return activeMenuItem?.label ?? "Menu";
}
