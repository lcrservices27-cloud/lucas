"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL, monthKeyToLabel } from "@/lib/utils";

const AXIS_COLOR = "#9ca3af";

function money(v: number) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

function TooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
}

/** Barras agrupadas: entradas x saídas por mês. */
export function EntradasSaidasChart({
  entradas,
  saidas,
}: {
  entradas: { month: string; value: number }[];
  saidas: { month: string; value: number }[];
}) {
  const data = entradas.map((e, i) => ({
    month: monthKeyToLabel(e.month),
    Entradas: e.value,
    Saídas: saidas[i]?.value ?? 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={money} tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
        <Bar dataKey="Entradas" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Saídas" fill="#dc2626" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Linha: evolução do saldo. */
export function SaldoLineChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const rows = data.map((d) => ({ month: monthKeyToLabel(d.month), Saldo: d.value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={money} tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipBox />} />
        <Line type="monotone" dataKey="Saldo" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Barras: guardado por mês. */
export function GuardadoChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const rows = data.map((d) => ({ month: monthKeyToLabel(d.month), Guardado: d.value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={money} tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
        <Bar dataKey="Guardado" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const CAT_COLORS = [
  "#16a34a", "#dc2626", "#2563eb", "#d97706", "#7c3aed",
  "#0891b2", "#db2777", "#65a30d", "#4b5563",
];

/** Barras horizontais: saídas por categoria. */
export function CategoriaChart({
  data,
}: {
  data: { category: string; value: number }[];
}) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-gray-400">Sem saídas registradas.</p>;
  }
  const height = Math.max(140, data.length * 40);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
        <XAxis type="number" tickFormatter={money} tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={88} />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
        <Bar dataKey="value" name="Total" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
