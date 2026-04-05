import type { LucideIcon } from "lucide-react";
import { FileText, FolderPlus, LayoutDashboard, Wrench } from "lucide-react";

export interface DashboardMenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const menuItems: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderPlus, label: "Cadastros", path: "/cadastros" },
  { icon: Wrench, label: "Manutenções", path: "/manutencoes" },
  { icon: FileText, label: "Gerar Contrato", path: "/gerar-contrato" },
];

export const SIDEBAR_WIDTH_KEY = "sidebar-width";
export const DEFAULT_WIDTH = 280;
export const MIN_WIDTH = 200;
export const MAX_WIDTH = 480;
