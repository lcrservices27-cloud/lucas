"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  todayInputValue,
} from "@/lib/utils";

export type QuickPreset = {
  title: string;
  type: "entrada" | "saida";
  category: string;
  paymentMethod?: string;
  amount?: number;
  description?: string;
};

export function QuickEntrySheet({
  preset,
  onClose,
  onSaved,
}: {
  preset: QuickPreset | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (preset) {
      setType(preset.type);
      setCategory(preset.category);
      setPaymentMethod(preset.paymentMethod ?? "pix");
      setAmount(preset.amount ? String(preset.amount) : "");
      setDescription(preset.description ?? "");
      setDate(todayInputValue());
      setError("");
    }
  }, [preset]);

  if (!preset) return null;

  async function save() {
    setError("");
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: value,
        category,
        description,
        paymentMethod,
        date: new Date(date + "T12:00:00").toISOString(),
      }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Erro ao salvar.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-3xl bg-white p-5 pb-8 shadow-xl dark:bg-neutral-900 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-neutral-700 sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{preset.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType("entrada")}
              className={`btn py-2 ${type === "entrada" ? "bg-positive text-white" : "border border-gray-300 dark:border-neutral-700"}`}
            >
              Entrada
            </button>
            <button
              onClick={() => setType("saida")}
              className={`btn py-2 ${type === "saida" ? "bg-negative text-white" : "border border-gray-300 dark:border-neutral-700"}`}
            >
              Saída
            </button>
          </div>

          <div>
            <label className="label">Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0,00"
              className="input text-2xl font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Pagamento</label>
              <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Descrição (opcional)</label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Data</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <button onClick={save} className="btn-primary w-full py-3 text-base" disabled={saving}>
            {saving ? "Salvando…" : "Salvar lançamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
