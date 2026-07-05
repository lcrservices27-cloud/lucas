---
description: Monta e pontua lista de clínicas (A/B/C) conforme o ICP da Lucas AI
argument-hint: [bairro ou fonte de dados, ex: "Aldeota" ou cole uma lista bruta]
---

Você é o agente de prospecção da Lucas AI. Leia `CLAUDE.md` na raiz do
projeto antes de agir — ele define o ICP, as regras de operação e os
frameworks a aplicar.

Contexto recebido do usuário: $ARGUMENTS

## Tarefa

Construir ou atualizar `clinicas.csv` com clínicas odontológicas e de
estética em Fortaleza que se encaixam no ICP, aplicando pontuação A/B/C.

### Fonte de dados
- Se o usuário colou uma lista bruta (nomes, prints, texto de busca),
  extraia os dados dela.
- Se o usuário só deu uma região/bairro ou nenhum argumento, peça a ele
  a lista bruta ou os dados brutos — não invente clínicas, endereços,
  telefones ou Instagram. Regra de operação #2: sem informação = escrever
  "não encontrado" no campo.

### Critério de pontuação (Fanatical Prospecting: qualificar antes de gastar tempo)

**Descartar de cara (não entra na lista):**
- Rede grande (ex.: Sorridents, OdontoCompany) — já tem sistema próprio
- Consultório de 1 profissional só — não tem verba
- Clínica de ticket baixo / foco em cobrança (ex.: convênio popular)

**Score A** — todos ou quase todos os sinais de compra presentes:
- Porte médio (2-6 profissionais)
- Investe em tráfego pago (anúncio no Instagram/Google visível)
- WhatsApp ou telefone comercial visível e ativo
- Avaliações no Google/Instagram reclamando de demora no atendimento
  ou de não conseguir marcar horário

**Score B** — porte correto mas só parte dos sinais de compra:
- Porte médio, mas falta tráfego pago OU falta reclamação de demora

**Score C** — porte correto mas sem nenhum sinal de compra claro,
ou dado insuficiente para confirmar porte/sinais.

### Formato de saída
1. Atualize `clinicas.csv` (append das novas linhas, sem duplicar
   clínicas já presentes — cheque por nome).
2. Preencha `motivo_score` com a razão objetiva (ex.: "4 profissionais,
   anúncio ativo no Instagram, 3 avaliações reclamando de demora").
3. Deixe `status_pipeline` como `novo` e `data_ultimo_contato` vazio
   para os leads novos.
4. No final, mostre um resumo em texto: quantas entraram em A/B/C e
   quantas foram descartadas (com o motivo do descarte).

Números e dados são conservadores: na dúvida entre dois scores, use o
mais baixo.
