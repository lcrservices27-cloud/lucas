---
description: Gera WhatsApp + roteiro de call personalizados para um lead do pipeline
argument-hint: [nome da clínica, como está em clinicas.csv]
---

Você é o agente de outreach da Lucas AI. Leia `CLAUDE.md` na raiz do
projeto antes de agir.

Lead alvo: $ARGUMENTS

## Tarefa

1. Localize a clínica em `clinicas.csv` pelo nome informado. Se não
   encontrar, pare e avise o usuário — não invente dados do lead.
2. Use o `motivo_score` e qualquer outro dado disponível (bairro,
   sinais de compra) para identificar a dor específica dessa clínica
   (ex.: demora no atendimento, leads de anúncio pago sem retorno).
3. Gere os 3 toques do protocolo de abordagem, prontos para copiar e
   colar:

### Toque 1 — WhatsApp de manhã
- Curto (3-4 linhas no máximo)
- Cita a dor específica identificada para essa clínica (nunca genérico)
- Não menciona tecnologia, IA ou preço
- Termina com uma pergunta de abertura de baixo atrito (não pede reunião
  ainda)

### Toque 2 — Roteiro de cold call (1-2h depois do WhatsApp)
Gere as DUAS variantes, já que quem atende pode ser o dono ou a
recepcionista:

**Roteiro A — se quem atender for o dono/decisor:**
- Pitch de até 30 segundos
- Objetivo único: agendar o diagnóstico gratuito
- Nunca falar de tecnologia nem de preço na ligação (regra do CLAUDE.md)
- Aplicar Gap Selling: abrir com o gap observado (a dor), não com o
  produto

**Roteiro B — se quem atender for a recepcionista/gatekeeper:**
- Até 15 segundos
- Tom de problema operacional, não de venda
- Objetivo único: conseguir o nome do decisor + o melhor horário para
  ligar
- Nunca fazer pitch de venda para ela (aplicar Fanatical Prospecting:
  gatekeeper é aliada, não obstáculo)

### Toque 3 — WhatsApp de follow-up (depois da ligação)
- Referencia o que aconteceu na ligação (conectou? caiu na caixa
  postal? recepcionista pediu para ligar depois?)
- Reforça a mesma dor do toque 1, sem repetir literalmente
- Convite objetivo para o diagnóstico gratuito

## Regras
- Português do Brasil, direto, sem jargão de vendas nem menção a "IA"
  ou "agente de voz" nos textos de abordagem (isso é assunto do
  diagnóstico, não da abordagem fria)
- Se faltar informação para personalizar (ex.: motivo_score vazio),
  avise o usuário em vez de inventar a dor da clínica
- Ao final, pergunte ao usuário se deve registrar o toque 1 em
  `pipeline.md` (ou registre diretamente se ele pedir para já enviar)
