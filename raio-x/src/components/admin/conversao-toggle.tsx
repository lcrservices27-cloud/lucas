"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { marcarConversao } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

export function ConversaoToggle({ id, inicial }: { id: string; inicial: boolean }) {
  const [ativo, setAtivo] = useState(inicial);
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        const novo = !ativo;
        setAtivo(novo);
        start(() => marcarConversao(id, novo));
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60",
        ativo ? "bg-emerald-100 text-emerald-700" : "bg-navy-900/5 text-ink-soft hover:bg-navy-900/10"
      )}
    >
      {ativo ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {ativo ? "Venda" : "Marcar venda"}
    </button>
  );
}
