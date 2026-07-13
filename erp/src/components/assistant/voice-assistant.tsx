"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { MessageBubble, type Mensagem } from "@/components/assistant/message-bubble";
import { HistoricoTab } from "@/components/assistant/historico-tab";
import type { AssistenteContexto, AssistenteResposta, AssistenteTurno, PendingAction, ClarifyAcao } from "@/lib/assistant/types";

const MENSAGEM_BOAS_VINDAS: Mensagem = {
  id: "boas-vindas",
  papel: "assistente",
  texto:
    'Oi! Sou o assistente da Lucas Limpa Nome. Você pode dizer, por exemplo: "cadastrar um novo cliente", "registrar pagamento", "mover João para processo protocolado" ou "mostrar clientes inadimplentes".',
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function VoiceAssistant() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [aba, setAba] = React.useState<"conversa" | "historico">("conversa");
  const [mensagens, setMensagens] = React.useState<Mensagem[]>([MENSAGEM_BOAS_VINDAS]);
  const [contexto, setContexto] = React.useState<AssistenteContexto>({ modo: "idle" });
  const [textoInput, setTextoInput] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [vozAtiva, setVozAtiva] = React.useState(true);
  const [configurado, setConfigurado] = React.useState<boolean | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { falar } = useSpeechSynthesis();

  React.useEffect(() => {
    fetch("/api/assistente/status")
      .then((r) => r.json())
      .then((d) => setConfigurado(Boolean(d.configurado)))
      .catch(() => setConfigurado(false));
  }, []);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensagens]);

  function addMensagem(papel: Mensagem["papel"], texto: string, ui?: AssistenteResposta["ui"]) {
    setMensagens((prev) => [...prev, { id: crypto.randomUUID(), papel, texto, ui }]);
  }

  function historicoParaApi(): AssistenteTurno[] {
    return mensagens
      .filter((m) => m.id !== "boas-vindas")
      .slice(-12)
      .map((m) => ({ papel: m.papel, texto: m.texto }));
  }

  async function enviarTexto(texto: string) {
    const limpo = texto.trim();
    if (!limpo || enviando) return;

    addMensagem("usuario", limpo);
    setTextoInput("");
    setEnviando(true);

    try {
      const resposta = await postJson<AssistenteResposta>("/api/assistente", {
        texto: limpo,
        contexto,
        historico: historicoParaApi(),
      });

      addMensagem("assistente", resposta.fala, resposta.ui);
      setContexto(resposta.contexto);
      if (vozAtiva) falar(resposta.fala);
      if (resposta.ui.kind === "navigate") {
        router.push(resposta.ui.href);
      }
    } catch {
      addMensagem("assistente", "Ocorreu um erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const { suportado: micSuportado, ouvindo, start, stop } = useSpeechRecognition(enviarTexto);

  function alternarMicrofone() {
    if (ouvindo) stop();
    else start();
  }

  async function handleConfirmar(pendingAction: PendingAction) {
    setEnviando(true);
    try {
      const resultado = await postJson<{ fala: string; href?: string }>("/api/assistente/confirmar", {
        pendingAction,
      });
      addMensagem("assistente", resultado.fala);
      setContexto({ modo: "idle" });
      if (vozAtiva) falar(resultado.fala);
      if (resultado.href) router.push(resultado.href);
    } finally {
      setEnviando(false);
    }
  }

  function handleEditar() {
    addMensagem("assistente", "Ok, o que você quer corrigir? Diga o campo novamente.");
  }

  function handleCancelarConfirmacao() {
    addMensagem("assistente", "Cadastro cancelado.");
    setContexto({ modo: "idle" });
  }

  async function handleEscolherClarificacao(
    acao: ClarifyAcao,
    extra: { valor?: number; statusAlvo?: string } | undefined,
    clienteId: string
  ) {
    setEnviando(true);
    try {
      const resultado = await postJson<{ fala: string; href?: string }>("/api/assistente/resolver", {
        acao,
        clienteId,
        extra,
      });
      addMensagem("assistente", resultado.fala);
      if (vozAtiva) falar(resultado.fala);
      if (resultado.href) router.push(resultado.href);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg"
        aria-label="Abrir assistente de voz"
      >
        <Sparkles className="size-6" />
      </Button>

      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) stop();
        }}
      >
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle>Assistente de voz</SheetTitle>
              {configurado !== null && (
                <Badge variant={configurado ? "success" : "outline"} className="text-[10px]">
                  {configurado ? "IA conectada" : "Modo básico"}
                </Badge>
              )}
            </div>
            <SheetDescription>
              {configurado
                ? "Fale ou digite naturalmente para operar o sistema."
                : "Sem ANTHROPIC_API_KEY configurada — respondendo com comandos básicos por regras."}
            </SheetDescription>
          </SheetHeader>

          <Tabs value={aba} onValueChange={(v) => setAba(v as "conversa" | "historico")} className="flex min-h-0 flex-1 flex-col px-4">
            <TabsList className="w-full">
              <TabsTrigger value="conversa" className="flex-1">
                Conversa
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex-1">
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversa" className="flex min-h-0 flex-1 flex-col gap-3">
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-2">
                {mensagens.map((m) => (
                  <MessageBubble
                    key={m.id}
                    mensagem={m}
                    onConfirmar={() => m.ui?.kind === "confirm" && handleConfirmar(m.ui.pendingAction)}
                    onEditar={handleEditar}
                    onCancelarConfirmacao={handleCancelarConfirmacao}
                    onEscolherClarificacao={(valor) =>
                      m.ui?.kind === "clarify" && handleEscolherClarificacao(m.ui.acao, m.ui.extra, valor)
                    }
                  />
                ))}
                {enviando && <p className="text-xs text-muted-foreground">Pensando...</p>}
              </div>

              <div className="space-y-2 border-t pt-3 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant={ouvindo ? "destructive" : "outline"}
                    className={cn("size-10 shrink-0 rounded-full", ouvindo && "animate-pulse")}
                    onClick={alternarMicrofone}
                    disabled={!micSuportado}
                    aria-label={ouvindo ? "Parar de ouvir" : "Falar"}
                  >
                    {ouvindo ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </Button>
                  <Input
                    value={textoInput}
                    onChange={(e) => setTextoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") enviarTexto(textoInput);
                    }}
                    placeholder={micSuportado ? "Fale ou digite um comando..." : "Digite um comando..."}
                    disabled={enviando}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => enviarTexto(textoInput)}
                    disabled={enviando || !textoInput.trim()}
                  >
                    <Send className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => setVozAtiva((v) => !v)}
                    aria-label={vozAtiva ? "Desativar voz" : "Ativar voz"}
                  >
                    {vozAtiva ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  </Button>
                </div>
                {!micSuportado && (
                  <p className="text-xs text-muted-foreground">
                    Reconhecimento de voz não é suportado neste navegador. Use Chrome ou Edge, ou digite seu comando.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historico" className="min-h-0 flex-1 overflow-y-auto">
              <HistoricoTab ativo={aba === "historico"} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
