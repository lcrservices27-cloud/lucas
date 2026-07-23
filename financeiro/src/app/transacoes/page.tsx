"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuickEntrySheet, type QuickPreset } from "@/components/QuickEntrySheet";
import {
  CATEGORIES,
  currentMonthKey,
  formatBRL,
  formatDateBR,
  monthKeyToLabel,
  paymentLabel,
  toMonthKey,
} from "@/lib/utils";

type Tx = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

function recentMonths(count = 12): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(toMonthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return keys;
}

export default function TransacoesPage() {
  const months = useMemo(() => recentMonths(), []);
  const [month, setMonth] = useState(currentMonthKey());
  const [category, setCategory] = useState("todas");
  const [type, setType] = useState("todos");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<QuickPreset | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ month });
    if (category !== "todas") params.set("category", category);
    if (type !== "todos") params.set("type", type);
    const res = await fetch(`/api/transactions?${params.toString()}`);
    if (res.ok) {
      const j = await res.json();
      setTxs(j.transactions);
    }
    setLoading(false);
  }, [month, category, type]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Excluir esta transação?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  const totalEntradas = txs.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
  const totalSaidas = txs.filter((t) => t.type === "saida").reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell title="Transações">
      {/* Filtros */}
      <div className="grid grid-cols-3 gap-2">
        <select className="input !py-2 text-sm" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>{monthKeyToLabel(m)}</option>
          ))}
        </select>
        <select className="input !py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="todas">Categoria</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input !py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="todos">Tipo</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card !p-3">
          <p className="text-xs text-gray-500 dark:text-neutral-400">Entradas</p>
          <p className="font-bold text-positive">{formatBRL(totalEntradas)}</p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-gray-500 dark:text-neutral-400">Saídas</p>
          <p className="font-bold text-negative">{formatBRL(totalSaidas)}</p>
        </div>
      </div>

      {/* Lista */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Carregando…</p>
        ) : txs.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Nenhuma transação neste filtro.
          </p>
        ) : (
          txs.map((t) => (
            <div key={t.id} className="card flex items-center justify-between !p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {t.description || t.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {t.category} · {paymentLabel(t.paymentMethod)} · {formatDateBR(t.date)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${t.type === "entrada" ? "text-positive" : "text-negative"}`}>
                  {t.type === "entrada" ? "+" : "−"}{formatBRL(t.amount)}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-gray-400 hover:text-negative"
                  aria-label="Excluir"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() =>
          setSheet({
            title: "Nova transação",
            type: "saida",
            category: "Outros",
            paymentMethod: "pix",
          })
        }
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-positive text-white shadow-lg transition active:scale-95"
        aria-label="Nova transação"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <QuickEntrySheet preset={sheet} onClose={() => setSheet(null)} onSaved={load} />
    </AppShell>
  );
}
