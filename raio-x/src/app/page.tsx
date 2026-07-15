"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock3,
  Zap,
  ArrowRight,
  Lock,
  Search,
  ClipboardCheck,
  Gauge as GaugeIcon,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Gauge } from "@/components/gauge";
import { capturarAtribuicaoDaUrl } from "@/lib/atribuicao";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function HomePage() {
  useEffect(() => {
    capturarAtribuicaoDaUrl();
  }, []);

  return (
    <main className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="bg-hero relative overflow-hidden text-white">
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo light />
          <span className="hidden items-center gap-1.5 text-sm text-white/70 sm:flex">
            <ShieldCheck className="size-4 text-green-400" /> Análise 100% gratuita
          </span>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-green-400" />
              Sem consulta que afeta seu score
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
            >
              Descubra em 2 minutos os fatores que podem estar dificultando sua aprovação de crédito.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-white/75"
            >
              Nosso Raio-X identifica possíveis riscos e mostra como está sua saúde financeira
              antes de você solicitar crédito.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8"
            >
              <Link
                href="/diagnostico"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-7 py-4 text-base font-semibold text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.75)] active:scale-[0.98]"
              >
                FAZER MEU RAIO-X GRATUITO
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80"
            >
              {[
                { icon: CheckCircle2, t: "Gratuito" },
                { icon: Clock3, t: "Leva menos de 2 minutos" },
                { icon: Zap, t: "Resultado imediato" },
              ].map((b) => (
                <li key={b.t} className="inline-flex items-center gap-2">
                  <b.icon className="size-4 text-green-400" />
                  {b.t}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Cartão flutuante com o velocímetro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="glass-dark rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">Índice de Saúde Financeira</span>
                <GaugeIcon className="size-4 text-green-400" />
              </div>
              <div className="rounded-2xl bg-white p-5">
                <Gauge valor={62} tamanho={260} legenda="Exemplo ilustrativo" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <span className="rounded-lg bg-white/5 py-2 text-rose-300">Baixo</span>
                <span className="rounded-lg bg-white/5 py-2 text-amber-300">Médio</span>
                <span className="rounded-lg bg-white/5 py-2 text-green-300">Alto</span>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-navy-500/20 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="bg-mist px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">Como funciona</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Um diagnóstico claro, em 3 passos
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ClipboardCheck,
                t: "Responda o Raio-X",
                d: "Um questionário rápido de menos de 2 minutos sobre a sua situação financeira atual.",
              },
              {
                icon: Search,
                t: "Analisamos seu perfil",
                d: "Cruzamos suas respostas com os fatores que as instituições costumam observar em uma análise.",
              },
              {
                icon: GaugeIcon,
                t: "Receba seu índice",
                d: "Um Índice de Saúde Financeira de 0 a 100 com pontos de atenção — na hora e sem custo.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.t}
                {...fade}
                transition={{ ...fade.transition, delay: i * 0.08 }}
                className="glass rounded-2xl p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-500 text-white shadow-glow">
                  <s.icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.d}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade} className="mt-14 text-center">
            <Link
              href="/diagnostico"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-navy-900 px-7 py-4 text-base font-semibold text-white shadow-soft transition-all hover:bg-navy-800 active:scale-[0.98]"
            >
              Fazer meu Raio-X agora
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== AUTORIDADE / CONFIANÇA ===== */}
      <section className="border-t border-navy-900/5 bg-white px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Seus dados protegidos", d: "Tratamos suas informações conforme a LGPD, com sigilo e segurança." },
            { icon: Lock, t: "Sem afetar seu score", d: "O Raio-X é uma autoavaliação — não é uma consulta que registra no seu CPF." },
            { icon: ClipboardCheck, t: "Feito por especialistas", d: "Metodologia baseada nos fatores que instituições financeiras costumam analisar." },
          ].map((c) => (
            <div key={c.t} className="flex gap-4">
              <c.icon className="size-6 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-ink">{c.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== RODAPÉ ===== */}
      <footer className="bg-navy-950 px-5 py-12 text-white/60">
        <div className="mx-auto max-w-6xl">
          <Logo light />
          <p className="mt-4 max-w-3xl text-xs leading-relaxed">
            O Raio-X do Crédito é uma ferramenta de autoavaliação e orientação. O Índice de Saúde
            Financeira é uma estimativa gerada a partir das respostas informadas pelo próprio
            usuário e não constitui uma consulta oficial a órgãos de proteção ao crédito, ao Banco
            Central ou a bureaus. Não garantimos aprovação de crédito, aumento de score ou obtenção
            de empréstimos. As informações têm caráter educativo.
          </p>
          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} Raio-X do Crédito. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
