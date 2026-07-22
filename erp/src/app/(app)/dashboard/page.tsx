import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Banknote,
  Hourglass,
  Percent,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  ReceitaMensalChart,
  ClientesPorMesChart,
  FluxoCaixaChart,
  StatusComercialChart,
} from "@/components/dashboard/charts";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { TIPO_TIMELINE_LABEL } from "@/lib/labels";
import Link from "next/link";

export default async function DashboardPage() {
  const { cards, charts, timelineRecente, alertas } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da operação em tempo real.</p>
      </div>

      {(alertas.clientesParados > 0 || alertas.parcelasAtrasadas > 0) && (
        <div className="flex flex-wrap gap-2">
          {alertas.parcelasAtrasadas > 0 && (
            <Badge variant="destructive" className="gap-1.5 py-1">
              <AlertTriangle className="size-3" /> {alertas.parcelasAtrasadas} parcela(s) atrasada(s)
            </Badge>
          )}
          {alertas.clientesParados > 0 && (
            <Badge variant="warning" className="gap-1.5 py-1">
              <AlertTriangle className="size-3" /> {alertas.clientesParados} cliente(s) parado(s) há +30 dias
            </Badge>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clientes cadastrados" value={String(cards.totalClientes)} icon={Users} />
        <KpiCard label="Clientes ativos" value={String(cards.clientesAtivos)} icon={UserCheck} tone="success" />
        <KpiCard label="Vendas fechadas" value={String(cards.vendasFechadas)} icon={CheckCircle2} tone="success" />
        <KpiCard
          label="Aguardando pagamento"
          value={String(cards.clientesAguardandoPagamento)}
          icon={Clock}
          tone="warning"
        />
        <KpiCard
          label="Clientes inadimplentes"
          value={String(cards.clientesInadimplentes)}
          icon={UserX}
          tone="destructive"
        />
        <KpiCard label="Receita do mês" value={formatCurrency(cards.receitaMes)} icon={TrendingUp} tone="success" />
        <KpiCard label="Receita do ano" value={formatCurrency(cards.receitaAno)} icon={Wallet} />
        <KpiCard label="Valor recebido" value={formatCurrency(cards.valorRecebido)} icon={Banknote} tone="success" />
        <KpiCard label="Valor pendente" value={formatCurrency(cards.valorPendente)} icon={Hourglass} tone="warning" />
        <KpiCard label="Ticket médio" value={formatCurrency(cards.ticketMedio)} icon={Wallet} />
        <KpiCard label="Conversão de vendas" value={`${cards.conversaoVendas.toFixed(1)}%`} icon={Percent} />
        <KpiCard
          label="Tempo médio de fechamento"
          value={`${Math.round(cards.tempoMedioFechamento)} dias`}
          icon={Timer}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receita mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceitaMensalChart data={charts.receitaMensal} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Clientes por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientesPorMesChart data={charts.clientesPorMes} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusComercialChart data={charts.statusComercial} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Fluxo de caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <FluxoCaixaChart data={charts.fluxoCaixa} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Últimas atividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timelineRecente.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          )}
          {timelineRecente.map((t) => (
            <Link
              key={t.id}
              href={`/crm/${t.clienteId}`}
              className="flex items-start justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="truncate">
                  <span className="font-medium">{t.cliente.nome}</span>{" "}
                  <span className="text-muted-foreground">— {t.descricao}</span>
                </p>
                <p className="text-xs text-muted-foreground">{TIPO_TIMELINE_LABEL[t.tipo] ?? t.tipo}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(t.criadoEm)}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
