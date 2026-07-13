"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { User, LayoutDashboard, KanbanSquare, Scale, Wallet, CalendarDays, ListChecks } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { searchClientes } from "@/lib/actions/search";

const ATALHOS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Kanban Comercial", href: "/comercial", icon: KanbanSquare },
  { title: "Kanban Jurídico", href: "/juridico", icon: Scale },
  { title: "Financeiro", href: "/financeiro", icon: Wallet },
  { title: "Agenda", href: "/agenda", icon: CalendarDays },
  { title: "Tarefas", href: "/tarefas", icon: ListChecks },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const { data: clientes = [] } = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => searchClientes(query),
    enabled: query.trim().length >= 2,
  });

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground shadow-xs hover:bg-accent/50 transition-colors"
      >
        <span className="flex-1 text-left">Pesquisar clientes, CPF, telefone...</span>
        <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span>⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Pesquisa global" description="Pesquise clientes ou navegue pelo sistema">
        <CommandInput placeholder="Digite um nome, CPF, telefone ou vá para uma página..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {clientes.length > 0 ? (
            <CommandGroup heading="Clientes">
              {clientes.map((c) => (
                <CommandItem key={c.id} value={`cliente-${c.id}-${c.nome}`} onSelect={() => go(`/crm/${c.id}`)}>
                  <User />
                  <div className="flex flex-col">
                    <span>{c.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {[c.cpf, c.telefone, c.cidade].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          <CommandSeparator />
          <CommandGroup heading="Navegar">
            {ATALHOS.map((a) => (
              <CommandItem key={a.href} value={a.title} onSelect={() => go(a.href)}>
                <a.icon />
                {a.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
