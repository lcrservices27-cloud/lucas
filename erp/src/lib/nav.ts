import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Wallet,
  CalendarDays,
  BarChart3,
  UserCog,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", href: "/crm", icon: Users },
  { title: "Kanban Comercial", href: "/comercial", icon: KanbanSquare },
  { title: "Financeiro", href: "/financeiro", icon: Wallet },
  { title: "Agenda", href: "/agenda", icon: CalendarDays },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { title: "Usuários", href: "/usuarios", icon: UserCog },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];
