"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex h-full w-64 flex-col gap-1 border-r bg-sidebar p-3 text-sidebar-foreground", className)}>
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground">
          L
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Lucas Limpa Nome</p>
          <p className="text-xs text-muted-foreground">ERP</p>
        </div>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
