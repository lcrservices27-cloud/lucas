"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function Sidebar({ className, isAdmin = true }: { className?: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.href !== "/usuarios");

  return (
    <nav className={cn("flex h-full w-64 flex-col gap-1 border-r bg-sidebar p-3 text-sidebar-foreground", className)}>
      <div className="flex items-center gap-2 px-2 py-3">
        <Image
          src="/marca/logo-icone.png"
          alt=""
          width={512}
          height={512}
          className="size-8 shrink-0 dark:invert"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Lucas Limpa Nome</p>
          <p className="text-xs text-muted-foreground">ERP</p>
        </div>
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => {
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
