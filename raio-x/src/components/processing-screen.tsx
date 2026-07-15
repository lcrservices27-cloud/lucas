"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

const MENSAGENS = [
  "Analisando perfil...",
  "Consultando indicadores...",
  "Verificando padrões...",
  "Calculando índice...",
  "Gerando diagnóstico...",
];

const DURACAO_MS = 8000;

export function ProcessingScreen({ onConcluir }: { onConcluir: () => void }) {
  const [progresso, setProgresso] = useState(0);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const inicio = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - inicio) / DURACAO_MS);
      setProgresso(t);
      setIdx(Math.min(MENSAGENS.length - 1, Math.floor(t * MENSAGENS.length)));
      if (t >= 1) {
        clearInterval(timer);
        onConcluir();
      }
    }, 60);
    return () => clearInterval(timer);
  }, [onConcluir]);

  return (
    <div className="bg-hero flex min-h-screen flex-col items-center justify-center px-6 text-white">
      <Logo light className="mb-12" />

      <div className="relative mb-10 flex size-32 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-green-400/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-3 rounded-full border-2 border-navy-400/40"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <div className="glass-dark flex size-20 items-center justify-center rounded-full">
          <Loader2 className="size-8 animate-spin text-green-400" />
        </div>
      </div>

      <div className="h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="text-lg font-medium text-white/90"
          >
            {MENSAGENS[idx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
          style={{ width: `${progresso * 100}%` }}
        />
      </div>
      <p className="mt-3 text-sm tabular-nums text-white/50">{Math.round(progresso * 100)}%</p>
    </div>
  );
}
