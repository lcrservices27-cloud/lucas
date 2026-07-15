"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ShieldCheck, ArrowRight } from "lucide-react";
import { CARDS_BLOQUEADOS } from "@/lib/diagnostico";
import { cn } from "@/lib/utils";

export function AreaBloqueada({ whatsappUrl }: { whatsappUrl: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <section className="mt-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-blue">
          <Lock className="size-3.5" /> Conteúdo premium
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Análise Bancária Completa
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Estes são os pontos analisados na Consulta Completa. Desbloqueie para ver o que as
          instituições enxergam no seu CPF.
        </p>
      </div>

      <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
        {CARDS_BLOQUEADOS.map((c) => (
          <button
            key={c.titulo}
            onClick={() => setAberto(true)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-navy-900/10 bg-white p-5 text-left shadow-soft transition-all hover:border-navy-500/40 hover:shadow-glow active:scale-[0.99]"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">{c.titulo}</h3>
              <span className="flex size-8 items-center justify-center rounded-full bg-navy-900/5 text-ink-soft transition group-hover:bg-navy-500 group-hover:text-white">
                <Lock className="size-4" />
              </span>
            </div>
            {/* Conteúdo genuinamente oculto (borrado) — nenhum dado real é exibido */}
            <div className="mt-3 space-y-2" aria-hidden>
              <div className="h-2.5 w-4/5 rounded-full bg-navy-900/10 blur-[3px]" />
              <div className="h-2.5 w-3/5 rounded-full bg-navy-900/10 blur-[3px]" />
              <div className="h-2.5 w-2/3 rounded-full bg-navy-900/10 blur-[3px]" />
            </div>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="translate-y-2 rounded-full bg-navy-900/85 px-3 py-1 text-xs font-medium text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                Toque para desbloquear
              </span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {aberto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAberto(false)}
          >
            <motion.div
              className="glass relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setAberto(false)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-navy-900/5"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-600 to-navy-500 text-white shadow-glow">
                <ShieldCheck className="size-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold leading-snug tracking-tight text-ink">
                Descubra exatamente o que os bancos enxergam.
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                A Consulta Completa revela informações utilizadas pelas instituições financeiras
                durante análises de crédito e permite entender melhor sua situação antes de
                solicitar empréstimos, financiamentos ou cartões.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-base font-semibold text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.75)] active:scale-[0.98]"
              >
                QUERO MINHA CONSULTA COMPLETA
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </a>
              <p className="mt-3 text-center text-xs text-ink-soft">
                Você será direcionado ao WhatsApp para falar com um especialista.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
