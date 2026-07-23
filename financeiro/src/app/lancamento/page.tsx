"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuickEntrySheet, type QuickPreset } from "@/components/QuickEntrySheet";

const PRESETS: (QuickPreset & { icon: string; color: string })[] = [
  {
    title: "Nova entrada",
    type: "entrada",
    category: "Renda extra",
    paymentMethod: "pix",
    icon: "＋",
    color: "bg-positive",
  },
  {
    title: "Alimentação",
    type: "saida",
    category: "Alimentação",
    paymentMethod: "pix",
    amount: 70,
    description: "Alimentação do dia",
    icon: "🍽️",
    color: "bg-amber-500",
  },
  {
    title: "Lazer",
    type: "saida",
    category: "Lazer",
    paymentMethod: "credito",
    icon: "🎉",
    color: "bg-purple-500",
  },
  {
    title: "Conta fixa",
    type: "saida",
    category: "Contas fixas",
    paymentMethod: "pix",
    icon: "🧾",
    color: "bg-blue-500",
  },
  {
    title: "Outras despesas",
    type: "saida",
    category: "Outros",
    paymentMethod: "pix",
    icon: "💸",
    color: "bg-gray-500",
  },
];

export default function LancamentoPage() {
  const [preset, setPreset] = useState<QuickPreset | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  return (
    <AppShell title="Lançamento diário">
      <p className="mb-4 text-sm text-gray-500 dark:text-neutral-400">
        Toque em um botão e registre em segundos.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.title}
            onClick={() => setPreset(p)}
            className={`flex h-28 flex-col items-center justify-center gap-2 rounded-2xl ${p.color} text-white shadow-sm transition active:scale-95 ${
              p.title === "Nova entrada" ? "col-span-2 h-24" : ""
            }`}
          >
            <span className="text-3xl">{p.icon}</span>
            <span className="text-sm font-semibold">{p.title}</span>
          </button>
        ))}
      </div>

      {savedCount > 0 && (
        <p className="mt-6 rounded-xl bg-positive/10 px-4 py-3 text-center text-sm font-medium text-positive">
          ✓ {savedCount} lançamento(s) registrado(s) nesta sessão.
        </p>
      )}

      <QuickEntrySheet
        preset={preset}
        onClose={() => setPreset(null)}
        onSaved={() => setSavedCount((c) => c + 1)}
      />
    </AppShell>
  );
}
