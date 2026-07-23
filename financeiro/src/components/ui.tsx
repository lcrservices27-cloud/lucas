"use client";

import { formatBRL } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
  large = false,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "positive" | "negative";
  large?: boolean;
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
      ? "text-negative"
      : "text-gray-900 dark:text-neutral-100";
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-400">
        {label}
      </p>
      <p className={`mt-1 font-bold ${large ? "text-2xl" : "text-xl"} ${toneClass}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{sub}</p>}
    </div>
  );
}

export function MoneyStat({
  label,
  amount,
  tone,
  sub,
  large,
}: {
  label: string;
  amount: number;
  tone?: "neutral" | "positive" | "negative";
  sub?: string;
  large?: boolean;
}) {
  const autoTone =
    tone ?? (amount > 0 ? "positive" : amount < 0 ? "negative" : "neutral");
  return (
    <StatCard label={label} value={formatBRL(amount)} tone={autoTone} sub={sub} large={large} />
  );
}

export function ProgressBar({
  percent,
  className = "",
}: {
  percent: number;
  className?: string;
}) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800 ${className}`}>
      <div
        className="h-full rounded-full bg-positive transition-all"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
      {children}
    </h2>
  );
}
