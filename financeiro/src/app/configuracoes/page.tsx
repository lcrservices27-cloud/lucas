"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui";
import { formatBRL } from "@/lib/utils";

type Goal = {
  id: string;
  monthlyTarget: number;
  totalTarget: number | null;
  months: number | null;
};
type Fixed = { id: string; name: string; amount: number };

export default function ConfiguracoesPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [monthly, setMonthly] = useState("");
  const [total, setTotal] = useState("");
  const [months, setMonths] = useState("");
  const [fixed, setFixed] = useState<Fixed[]>([]);
  const [feName, setFeName] = useState("");
  const [feAmount, setFeAmount] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [gRes, fRes] = await Promise.all([
      fetch("/api/goal"),
      fetch("/api/fixed-expenses"),
    ]);
    if (gRes.ok) {
      const j = await gRes.json();
      if (j.goal) {
        setGoal(j.goal);
        setMonthly(String(j.goal.monthlyTarget));
        setTotal(j.goal.totalTarget != null ? String(j.goal.totalTarget) : "");
        setMonths(j.goal.months != null ? String(j.goal.months) : "");
      }
    }
    if (fRes.ok) {
      const j = await fRes.json();
      setFixed(j.fixedExpenses);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/goal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyTarget: Number(monthly.replace(",", ".")),
        totalTarget: total ? Number(total.replace(",", ".")) : null,
        months: months ? Number(months) : null,
      }),
    });
    if (res.ok) {
      setMsg("Meta atualizada.");
      load();
    }
  }

  async function addFixed(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/fixed-expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: feName, amount: Number(feAmount.replace(",", ".")) }),
    });
    if (res.ok) {
      setFeName("");
      setFeAmount("");
      load();
    }
  }

  const totalFixed = fixed.reduce((s, f) => s + f.amount, 0);

  return (
    <AppShell title="Ajustes">
      <SectionTitle>Meta de economia</SectionTitle>
      <form onSubmit={saveGoal} className="card space-y-3">
        <div>
          <label className="label">Meta mensal (R$)</label>
          <input className="input" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Objetivo total (R$)</label>
            <input className="input" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
          <div>
            <label className="label">Em quantos meses</label>
            <input className="input" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
        </div>
        {goal && (
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            Atual: {formatBRL(goal.monthlyTarget)}/mês
            {goal.totalTarget ? ` · objetivo ${formatBRL(goal.totalTarget)} em ${goal.months ?? "?"} meses` : ""}
          </p>
        )}
        {msg && <p className="text-sm text-positive">{msg}</p>}
        <button className="btn-primary w-full py-2.5">Salvar meta</button>
      </form>

      <SectionTitle>Despesas fixas</SectionTitle>
      <div className="card divide-y divide-gray-100 dark:divide-neutral-800">
        {fixed.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-2.5 first:pt-0">
            <span className="text-sm">{f.name}</span>
            <span className="text-sm font-medium text-negative">{formatBRL(f.amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2.5 text-sm font-semibold">
          <span>Total mensal</span>
          <span>{formatBRL(totalFixed)}</span>
        </div>
      </div>

      <form onSubmit={addFixed} className="card mt-3 space-y-3">
        <p className="text-sm font-medium">Adicionar despesa fixa</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="Nome" value={feName} onChange={(e) => setFeName(e.target.value)} required />
          <input className="input" inputMode="decimal" placeholder="Valor/mês" value={feAmount} onChange={(e) => setFeAmount(e.target.value)} required />
        </div>
        <button className="btn-neutral w-full py-2.5">Adicionar</button>
      </form>

      <div className="mt-8 rounded-xl bg-gray-100 p-4 text-xs text-gray-500 dark:bg-neutral-900 dark:text-neutral-400">
        <p className="font-medium">Lucas Rufino Financeiro</p>
        <p>Controle financeiro pessoal · uso diário no celular.</p>
      </div>
    </AppShell>
  );
}
