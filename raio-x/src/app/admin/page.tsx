import { Users, TrendingUp, Percent, CalendarDays, Download, LogOut, Search } from "lucide-react";
import { exigirAdmin } from "@/lib/admin-session";
import { logoutAdmin } from "@/lib/admin-actions";
import { getAdminDashboard, buscarPorCpf, ultimosDiagnosticos } from "@/lib/admin-queries";
import { Logo } from "@/components/logo";
import { ConversaoToggle } from "@/components/admin/conversao-toggle";
import { STATUS_META } from "@/lib/diagnostico";
import { formatarCpf, formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Dashboard", robots: { index: false } };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ cpf?: string }>;
}) {
  await exigirAdmin();
  const { cpf } = await searchParams;
  const busca = (cpf ?? "").trim();

  const [dados, linhas] = await Promise.all([
    getAdminDashboard(),
    busca ? buscarPorCpf(busca) : ultimosDiagnosticos(20),
  ]);

  const maxSerie = Math.max(1, ...dados.serie.map((s) => s.diagnosticos));

  const kpis = [
    { label: "Diagnósticos", valor: String(dados.total), icon: Users },
    { label: "Vendas (Consultas)", valor: String(dados.conversoes), icon: TrendingUp },
    { label: "Taxa de conversão", valor: `${dados.taxaConversao.toFixed(1)}%`, icon: Percent },
    { label: "Diagnósticos hoje", valor: String(dados.hoje), icon: CalendarDays },
  ];

  return (
    <div className="bg-mist min-h-screen">
      <header className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-navy-900/5 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/export"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-900/10 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-navy-900/[0.03]"
            >
              <Download className="size-4" /> Exportar CSV
            </a>
            <form action={logoutAdmin}>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink">
                <LogOut className="size-4" /> Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-soft">{k.label}</p>
                  <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink">{k.valor}</p>
                </div>
                <span className="flex size-9 items-center justify-center rounded-lg bg-navy-500/10 text-navy-600">
                  <k.icon className="size-4.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Gráfico de conversão 14 dias */}
          <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Diagnósticos e vendas — últimos 14 dias</h2>
            <div className="mt-6 flex h-48 items-end gap-1.5">
              {dados.serie.map((s) => (
                <div key={s.label} className="group flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-7 rounded-t-md bg-navy-500/20"
                      style={{ height: `${(s.diagnosticos / maxSerie) * 100}%` }}
                    >
                      <div
                        className="w-full rounded-t-md bg-green-500"
                        style={{
                          height: s.diagnosticos > 0 ? `${(s.conversoes / s.diagnosticos) * 100}%` : "0%",
                        }}
                      />
                    </div>
                    <span className="pointer-events-none absolute -top-6 rounded bg-navy-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                      {s.diagnosticos}· {s.conversoes}v
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-soft">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-navy-500/20" /> Diagnósticos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-green-500" /> Vendas
              </span>
            </div>
          </div>

          {/* Origem do tráfego */}
          <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Origem do tráfego</h2>
            <ul className="mt-4 space-y-2.5">
              {dados.origem.length === 0 && (
                <li className="text-sm text-ink-soft">Nenhum registro ainda.</li>
              )}
              {dados.origem.slice(0, 6).map((o) => (
                <li key={o.fonte} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink">{o.fonte}</span>
                  <span className="font-semibold tabular-nums text-ink">{o.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Busca + tabela */}
        <div className="rounded-2xl border border-navy-900/10 bg-white shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/10 p-5">
            <h2 className="text-sm font-semibold text-ink">
              {busca ? `Resultados para "${busca}"` : "Diagnósticos recentes"}
            </h2>
            <form method="get" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                name="cpf"
                defaultValue={busca}
                inputMode="numeric"
                placeholder="Pesquisar CPF..."
                className="w-56 rounded-lg border border-navy-900/10 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-left text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">CPF</th>
                  <th className="px-5 py-3 font-medium">Índice</th>
                  <th className="px-5 py-3 font-medium">Objetivo</th>
                  <th className="px-5 py-3 font-medium">Origem</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {linhas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-ink-soft">
                      Nenhum diagnóstico encontrado.
                    </td>
                  </tr>
                )}
                {linhas.map((d) => (
                  <tr key={d.id} className="border-b border-navy-900/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{d.nome}</td>
                    <td className="px-5 py-3 tabular-nums text-ink-soft">{formatarCpf(d.cpf)}</td>
                    <td className="px-5 py-3">
                      <span className="font-semibold" style={{ color: STATUS_META[d.status].corHex }}>
                        {d.indice}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{d.objetivo}</td>
                    <td className="px-5 py-3 text-ink-soft">{d.utmSource ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-soft">{formatarData(d.criadoEm)}</td>
                    <td className="px-5 py-3">
                      <ConversaoToggle id={d.id} inicial={d.converteu} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
