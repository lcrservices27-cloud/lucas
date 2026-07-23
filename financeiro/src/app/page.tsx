"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EntradasSaidasChart } from "@/components/Charts";
import { MoneyStat, ProgressBar, SectionTitle, StatCard } from "@/components/ui";
import type { MonthSummary } from "@/lib/finance";
import {
  currentMonthKey,
  formatBRL,
  monthKeyToLong,
} from "@/lib/utils";

export default function DashboardPage() {
  const [month] = useState(currentMonthKey());
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [chart, setChart] = useState<{
    entradas: { month: string; value: number }[];
    saidas: { month: string; value: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [sRes, rRes] = await Promise.all([
      fetch(`/api/summary?month=${month}`),
      fetch(`/api/reports?months=6`),
    ]);
    if (sRes.ok) setSummary(await sRes.json());
    if (rRes.ok) {
      const r = await rRes.json();
      setChart({ entradas: r.monthlyEntradas, saidas: r.monthlySaidas });
    }
    setLoading(false);
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell title="Início">
      <p className="mb-4 text-sm capitalize text-gray-500 dark:text-neutral-400">
        {monthKeyToLong(month)}
      </p>

      {loading || !summary ? (
        <p className="py-10 text-center text-gray-400">Carregando…</p>
      ) : (
        <>
          {/* Saldo atual em destaque */}
          <div className="card bg-positive text-white dark:bg-positive-dark">
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">
              Saldo atual
            </p>
            <p className="mt-1 text-3xl font-bold">{formatBRL(summary.saldoAtual)}</p>
            <p className="mt-1 text-xs opacity-90">
              Disponível para guardar: {formatBRL(summary.disponivelParaGuardar)}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <MoneyStat label="Entradas do mês" amount={summary.totalEntradas} tone="positive" />
            <MoneyStat label="Saídas do mês" amount={summary.totalSaidas} tone="negative" />
            <MoneyStat
              label="Saldo líquido"
              amount={summary.saldoLiquido}
              sub={summary.saldoLiquido >= 0 ? "Sobrou este mês" : "No vermelho"}
            />
            <MoneyStat
              label="Despesas fixas"
              amount={summary.totalDespesasFixas}
              tone="negative"
              sub="Estimativa/mês"
            />
          </div>

          {/* Meta de economia */}
          <SectionTitle>Meta de economia</SectionTitle>
          <div className="card">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">Meta mensal</p>
                <p className="text-xl font-bold">{formatBRL(summary.metaMensal)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-neutral-400">Atingido</p>
                <p className="text-xl font-bold text-positive">
                  {summary.percentualMeta.toFixed(0)}%
                </p>
              </div>
            </div>
            <ProgressBar percent={summary.percentualMeta} className="mt-3" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">Guardado</p>
                <p className="text-sm font-semibold text-positive">{formatBRL(summary.jaGuardado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">Falta</p>
                <p className="text-sm font-semibold">{formatBRL(summary.faltaParaMeta)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {summary.diasRestantes} dia(s)
                </p>
                <p className="text-sm font-semibold">{formatBRL(summary.precisaGuardarPorDia)}/dia</p>
              </div>
            </div>
          </div>

          {/* Lazer */}
          <SectionTitle>Lazer</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <MoneyStat label="Gasto no mês" amount={summary.lazer.gasto} tone="negative" />
            <StatCard label="Saídas" value={String(summary.lazer.quantidade)} />
            <MoneyStat label="Pode gastar" amount={summary.lazer.podeGastar} tone="positive" />
          </div>

          {/* Gráfico */}
          <SectionTitle>Entradas x Saídas</SectionTitle>
          <div className="card">
            {chart ? (
              <EntradasSaidasChart entradas={chart.entradas} saidas={chart.saidas} />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Sem dados.</p>
            )}
          </div>

          {/* Despesas fixas */}
          <SectionTitle>Despesas fixas</SectionTitle>
          <div className="card divide-y divide-gray-100 dark:divide-neutral-800">
            {summary.fixedExpenses.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">Nenhuma cadastrada.</p>
            )}
            {summary.fixedExpenses.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm">{f.name}</span>
                <span className="text-sm font-medium text-negative">{formatBRL(f.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2.5 text-sm font-semibold">
              <span>Total</span>
              <span>{formatBRL(summary.totalDespesasFixas)}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/lancamento" className="btn-primary py-3">
              Lançar agora
            </Link>
            <Link href="/relatorios" className="btn-neutral py-3">
              Ver relatórios
            </Link>
          </div>
        </>
      )}
    </AppShell>
  );
}
