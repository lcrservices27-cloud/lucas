import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";
import { Gauge } from "@/components/gauge";
import { AreaBloqueada } from "@/components/area-bloqueada";
import { STATUS_META } from "@/lib/diagnostico";
import { linkWhatsappConsulta } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const diag = await prisma.diagnostico.findUnique({ where: { id } });
  if (!diag) notFound();

  const meta = STATUS_META[diag.status];
  const primeiroNome = diag.nome.trim().split(/\s+/)[0] ?? diag.nome;
  const whatsappUrl = linkWhatsappConsulta({
    id: diag.id,
    nome: diag.nome,
    cpf: diag.cpf,
    indice: diag.indice,
  });

  return (
    <main className="bg-mist min-h-screen">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-5">
        <Logo />
        <span className="text-sm font-medium text-ink-soft">Diagnóstico concluído</span>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 pb-16">
        <p className="text-[15px] text-ink-soft">
          {primeiroNome}, aqui está o seu resultado:
        </p>

        {/* Card principal do índice */}
        <div className="mt-3 overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-soft">
          <div className="bg-hero px-6 pb-2 pt-7 text-center text-white">
            <p className="text-sm font-medium text-white/70">Índice de Saúde Financeira</p>
          </div>
          <div className="-mt-2 flex flex-col items-center px-6 pb-7">
            <div className="rounded-3xl bg-white px-4 pt-4">
              <Gauge valor={diag.indice} tamanho={300} />
            </div>
            <div
              className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
              style={{ color: meta.corHex, backgroundColor: `${meta.corHex}14` }}
            >
              {diag.status === "SAUDAVEL" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertTriangle className="size-4" />
              )}
              STATUS: {meta.rotulo}
            </div>
            <p className="mt-4 max-w-md text-center text-[15px] leading-relaxed text-ink-soft">
              {meta.descricao}
            </p>

            {/* Escala Baixo/Médio/Alto */}
            <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2 text-center text-xs font-medium">
              <span className="rounded-lg bg-rose-50 py-2 text-rose-600">Baixo</span>
              <span className="rounded-lg bg-amber-50 py-2 text-amber-600">Médio</span>
              <span className="rounded-lg bg-emerald-50 py-2 text-emerald-600">Alto</span>
            </div>
          </div>
        </div>

        {/* Insights parciais */}
        <div className="mt-5 rounded-3xl border border-navy-900/10 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">O que identificamos no seu perfil</h2>
          <ul className="mt-4 space-y-3">
            {meta.insights.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span className="text-[15px] leading-relaxed text-ink">{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-navy-900/[0.03] px-4 py-3 text-xs leading-relaxed text-ink-soft">
            Este índice é uma estimativa baseada nas suas respostas e tem caráter orientativo. Não
            representa uma consulta oficial a bureaus ou ao Banco Central.
          </p>
        </div>

        {/* Área bloqueada + modal */}
        <AreaBloqueada whatsappUrl={whatsappUrl} />

        {/* CTA secundário */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-7 py-4 text-base font-semibold text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,0.6)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.75)] active:scale-[0.98]"
          >
            QUERO MINHA CONSULTA COMPLETA
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </a>
          <Link href="/" className="text-sm font-medium text-ink-soft transition hover:text-ink">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
