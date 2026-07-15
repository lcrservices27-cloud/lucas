"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { ProcessingScreen } from "@/components/processing-screen";
import { criarDiagnostico } from "@/lib/actions";
import { lerAtribuicao } from "@/lib/atribuicao";
import { formatarCpf, cpfValido, cn } from "@/lib/utils";
import {
  OBJETIVOS,
  OPCOES_RECUSADO,
  OPCOES_TRIPLO,
  OPCOES_FAIXA_SCORE,
  type Objetivo,
  type RespostaRecusado,
  type RespostaTriplo,
  type FaixaScore,
} from "@/lib/diagnostico";

const TOTAL = 8;

type Estado = {
  nome: string;
  cpf: string;
  objetivo?: Objetivo;
  recusado?: RespostaRecusado;
  dividas?: RespostaTriplo;
  negativado?: RespostaTriplo;
  faixaScore?: FaixaScore;
};

function QuizInterno() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [etapa, setEtapa] = useState(1);
  const [estado, setEstado] = useState<Estado>({ nome: "", cpf: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const idRef = useRef<string | null>(null);

  // UTM da própria URL do quiz têm prioridade; senão, cai no que foi
  // capturado na landing (sessionStorage).
  const utm = useMemo(() => {
    const guardada = lerAtribuicao();
    return {
      utmSource: searchParams.get("utm_source") ?? guardada.utmSource,
      utmMedium: searchParams.get("utm_medium") ?? guardada.utmMedium,
      utmCampaign: searchParams.get("utm_campaign") ?? guardada.utmCampaign,
      referrer: guardada.referrer,
    };
  }, [searchParams]);

  const avancar = useCallback(() => {
    setErro(null);
    setEtapa((e) => Math.min(TOTAL, e + 1));
  }, []);

  const voltar = () => {
    setErro(null);
    setEtapa((e) => Math.max(1, e - 1));
  };

  // Seleção de opção com auto-avanço suave.
  function escolher<K extends keyof Estado>(campo: K, valor: Estado[K]) {
    setEstado((s) => ({ ...s, [campo]: valor }));
    setErro(null);
    window.setTimeout(() => setEtapa((e) => Math.min(TOTAL, e + 1)), 260);
  }

  async function finalizar() {
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    const res = await criarDiagnostico({
      nome: estado.nome,
      cpf: estado.cpf,
      objetivo: estado.objetivo!,
      recusado: estado.recusado!,
      dividas: estado.dividas!,
      negativado: estado.negativado!,
      faixaScore: estado.faixaScore!,
      consentimento: true,
      ...utm,
      referrer:
        utm.referrer ?? (typeof document !== "undefined" ? document.referrer || undefined : undefined),
    });
    if (!res.ok) {
      setErro(res.erro);
      setEnviando(false);
      return;
    }
    idRef.current = res.id;
    setProcessando(true);
  }

  if (processando) {
    return (
      <ProcessingScreen
        onConcluir={() => {
          if (idRef.current) router.push(`/resultado/${idRef.current}`);
        }}
      />
    );
  }

  const progresso = (etapa / TOTAL) * 100;

  return (
    <div className="bg-mist flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-5">
        <Logo />
        <span className="text-sm font-medium tabular-nums text-ink-soft">
          {etapa}/{TOTAL}
        </span>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-900/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-navy-500 to-green-500"
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-5 py-8">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={etapa}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {etapa === 1 && (
                <Pergunta titulo="Para começar, qual é o seu nome?">
                  <input
                    autoFocus
                    value={estado.nome}
                    onChange={(e) => setEstado((s) => ({ ...s, nome: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && estado.nome.trim().length >= 2 && avancar()}
                    placeholder="Nome completo"
                    className="w-full rounded-2xl border border-navy-900/10 bg-white px-5 py-4 text-lg shadow-soft outline-none transition focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10"
                  />
                  <Continuar
                    onClick={() => (estado.nome.trim().length >= 2 ? avancar() : setErro("Informe seu nome."))}
                    disabled={estado.nome.trim().length < 2}
                  />
                </Pergunta>
              )}

              {etapa === 2 && (
                <Pergunta titulo="Qual é o seu CPF?" sub="Usamos para identificar o seu diagnóstico com segurança.">
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={estado.cpf}
                    onChange={(e) => setEstado((s) => ({ ...s, cpf: formatarCpf(e.target.value) }))}
                    onKeyDown={(e) => e.key === "Enter" && cpfValido(estado.cpf) && avancar()}
                    placeholder="000.000.000-00"
                    className="w-full rounded-2xl border border-navy-900/10 bg-white px-5 py-4 text-lg tracking-wide shadow-soft outline-none transition focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10"
                  />
                  <Continuar
                    onClick={() => (cpfValido(estado.cpf) ? avancar() : setErro("Digite um CPF válido."))}
                    disabled={!cpfValido(estado.cpf)}
                  />
                </Pergunta>
              )}

              {etapa === 3 && (
                <Pergunta titulo="Qual é o seu objetivo?">
                  <Opcoes
                    opcoes={OBJETIVOS}
                    selecionado={estado.objetivo}
                    onSelect={(v) => escolher("objetivo", v)}
                  />
                </Pergunta>
              )}

              {etapa === 4 && (
                <Pergunta titulo="Seu crédito já foi recusado?">
                  <Opcoes
                    opcoes={OPCOES_RECUSADO}
                    selecionado={estado.recusado}
                    onSelect={(v) => escolher("recusado", v)}
                  />
                </Pergunta>
              )}

              {etapa === 5 && (
                <Pergunta titulo="Você possui dívidas atualmente?">
                  <Opcoes
                    opcoes={OPCOES_TRIPLO}
                    selecionado={estado.dividas}
                    onSelect={(v) => escolher("dividas", v)}
                  />
                </Pergunta>
              )}

              {etapa === 6 && (
                <Pergunta titulo="Seu nome está negativado?">
                  <Opcoes
                    opcoes={OPCOES_TRIPLO}
                    selecionado={estado.negativado}
                    onSelect={(v) => escolher("negativado", v)}
                  />
                </Pergunta>
              )}

              {etapa === 7 && (
                <Pergunta titulo="Você sabe qual é o seu Score?">
                  <Opcoes
                    opcoes={OPCOES_FAIXA_SCORE}
                    selecionado={estado.faixaScore}
                    onSelect={(v) => escolher("faixaScore", v)}
                  />
                </Pergunta>
              )}

              {etapa === 8 && (
                <Pergunta
                  titulo="Tudo pronto! Podemos gerar o seu diagnóstico?"
                  sub="Ao continuar, você autoriza o uso das informações fornecidas para gerar sua análise, conforme a LGPD."
                >
                  <button
                    onClick={finalizar}
                    disabled={enviando}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-7 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.75)] active:scale-[0.98] disabled:opacity-70"
                  >
                    {enviando ? "Gerando..." : "SIM, GERAR MEU DIAGNÓSTICO"}
                    {!enviando && <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />}
                  </button>
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
                    <ShieldCheck className="size-3.5 text-green-600" /> Seus dados são tratados com sigilo e segurança.
                  </p>
                </Pergunta>
              )}
            </motion.div>
          </AnimatePresence>

          {erro && <p className="mt-4 text-center text-sm font-medium text-rose-600">{erro}</p>}

          {etapa > 1 && !enviando && (
            <button
              onClick={voltar}
              className="mx-auto mt-8 flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pergunta({
  titulo,
  sub,
  children,
}: {
  titulo: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">{titulo}</h1>
      {sub && <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">{sub}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Opcoes<T extends string>({
  opcoes,
  selecionado,
  onSelect,
}: {
  opcoes: { valor: T; label: string }[];
  selecionado?: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="grid gap-3">
      {opcoes.map((o) => {
        const ativo = selecionado === o.valor;
        return (
          <button
            key={o.valor}
            onClick={() => onSelect(o.valor)}
            className={cn(
              "flex items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left text-[17px] font-medium shadow-soft transition-all active:scale-[0.99]",
              ativo
                ? "border-navy-500 ring-4 ring-navy-500/10"
                : "border-navy-900/10 hover:border-navy-500/40"
            )}
          >
            {o.label}
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border transition",
                ativo ? "border-green-600 bg-green-600 text-white" : "border-navy-900/20"
              )}
            >
              {ativo && <Check className="size-4" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Continuar({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 px-7 py-4 text-base font-semibold text-white shadow-soft transition-all hover:bg-navy-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Continuar
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<div className="bg-mist min-h-screen" />}>
      <QuizInterno />
    </Suspense>
  );
}
