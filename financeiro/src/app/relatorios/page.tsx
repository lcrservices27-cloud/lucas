"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  CategoriaChart,
  EntradasSaidasChart,
  GuardadoChart,
  SaldoLineChart,
} from "@/components/Charts";
import { SectionTitle } from "@/components/ui";
import type { ReportData } from "@/lib/finance";
import { formatBRL, monthKeyToLabel, monthKeyToLong } from "@/lib/utils";

export default function RelatoriosPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/reports?months=6");
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell title="Relatórios">
      {loading || !data ? (
        <p className="py-10 text-center text-gray-400">Carregando…</p>
      ) : (
        <>
          <SectionTitle>Entradas e saídas por mês</SectionTitle>
          <div className="card">
            <EntradasSaidasChart entradas={data.monthlyEntradas} saidas={data.monthlySaidas} />
          </div>

          <SectionTitle>Evolução do saldo</SectionTitle>
          <div className="card">
            <SaldoLineChart data={data.saldoEvolution} />
          </div>

          <SectionTitle>Quanto foi guardado por mês</SectionTitle>
          <div className="card">
            <GuardadoChart data={data.monthlyGuardado} />
          </div>

          <SectionTitle>Saídas por categoria</SectionTitle>
          <div className="card">
            <CategoriaChart data={data.saidasPorCategoria} />
          </div>

          <SectionTitle>Comparação entre meses</SectionTitle>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-neutral-400">
                  <th className="pb-2 pr-2 font-medium">Mês</th>
                  <th className="pb-2 pr-2 text-right font-medium">Entradas</th>
                  <th className="pb-2 pr-2 text-right font-medium">Saídas</th>
                  <th className="pb-2 text-right font-medium">Guardado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {data.monthlyEntradas.map((e, i) => (
                  <tr key={e.month}>
                    <td className="py-2 pr-2">{monthKeyToLabel(e.month)}</td>
                    <td className="py-2 pr-2 text-right text-positive">{formatBRL(e.value)}</td>
                    <td className="py-2 pr-2 text-right text-negative">{formatBRL(data.monthlySaidas[i]?.value ?? 0)}</td>
                    <td className="py-2 text-right font-medium">{formatBRL(data.monthlyGuardado[i]?.value ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionTitle>Projeção — R$ {data.projection.totalTarget.toLocaleString("pt-BR")}</SectionTitle>
          <div className="card space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-neutral-400">Já acumulado</span>
              <span className="font-semibold text-positive">{formatBRL(data.projection.accumulated)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-neutral-400">Média guardada/mês</span>
              <span className="font-semibold">{formatBRL(data.projection.mediaMensal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-neutral-400">Meses restantes</span>
              <span className="font-semibold">
                {data.projection.mesesRestantes ?? "—"}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-sm dark:border-neutral-800">
              <span className="text-gray-500 dark:text-neutral-400">Previsão de atingir a meta</span>
              <span className="font-semibold text-positive">
                {data.projection.dataProjetada ? monthKeyToLong(data.projection.dataProjetada) : "Registre economias"}
              </span>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
