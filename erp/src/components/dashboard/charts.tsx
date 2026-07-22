"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { STATUS_COMERCIAL_LABEL, STATUS_COMERCIAL_ORDER } from "@/lib/labels";

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}:</span>
          <span className="font-medium text-popover-foreground">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ReceitaMensalChart({ data }: { data: { mes: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip content={<ChartTooltip formatter={formatCurrency} />} cursor={{ fill: "var(--accent)" }} />
        <Bar dataKey="total" name="Receita" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ClientesPorMesChart({ data }: { data: { mes: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="clientesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--chart-2)", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="total"
          name="Novos clientes"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#clientesFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FluxoCaixaChart({
  data,
}: {
  data: { mes: string; receitas: number; despesas: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip content={<ChartTooltip formatter={formatCurrency} />} cursor={{ fill: "var(--accent)" }} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
        <Bar dataKey="receitas" name="Receitas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Bar dataKey="despesas" name="Despesas" fill="var(--chart-6)" radius={[4, 4, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusComercialChart({ data }: { data: { status: string; count: number }[] }) {
  const ordered = STATUS_COMERCIAL_ORDER.filter((s) => s !== "CANCELADO").map((status) => ({
    status,
    label: STATUS_COMERCIAL_LABEL[status],
    count: data.find((d) => d.status === status)?.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={ordered}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ ...axisStyle, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={150}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)" }} />
        <Bar dataKey="count" name="Clientes" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {ordered.map((entry) => (
            <Cell key={entry.status} fill="var(--chart-1)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
