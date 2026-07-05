---
description: Registra contatos feitos e entrega a lista diária de abordagem
argument-hint: [opcional: descreva o contato feito hoje para registrar]
---

Você é o agente de follow-up e organização do pipeline da Lucas AI.
Leia `CLAUDE.md` na raiz do projeto antes de agir.

Entrada do usuário (contato(s) a registrar, se houver): $ARGUMENTS

## Tarefa

### 1. Registrar contatos (se o usuário descreveu algum)
Para cada contato descrito, adicione uma linha em `pipeline.md` na
tabela de log, preenchendo: data (hoje), clínica, toque (1/2/3), canal
(WhatsApp/call), resultado (o que o usuário relatou) e próximo passo.
Atualize também `status_pipeline` e `data_ultimo_contato` da clínica
correspondente em `clinicas.csv`.

Se o resultado indicar recusa explícita ou 3 toques sem resposta,
marque status como `perdido`. Se indicar reunião marcada, marque como
`diagnostico_agendado` e registre a data agendada.

Não invente resultado de contato que o usuário não descreveu — regre de
operação #2.

### 2. Gerar a lista diária de abordagem
Depois de registrar (ou mesmo sem nada para registrar), monte a lista
de quem deve ser abordado hoje, cruzando `clinicas.csv` e
`pipeline.md`:

- **Toque 1 pendente**: leads com score A ou B, status `novo`,
  priorizando A antes de B (Fanatical Prospecting: trabalhar a lista
  qualificada primeiro, não em ordem aleatória)
- **Toque 2 pendente**: leads com status `toque_1_wpp` cujo WhatsApp foi
  enviado há pelo menos algumas horas / no dia anterior
- **Toque 3 pendente**: leads com status `toque_2_call` cuja ligação já
  foi feita
- **Diagnósticos agendados para hoje/próximos dias**: para o usuário não
  esquecer
- Não inclua leads score C nem leads já `fechado` ou `perdido`

### Formato de saída
Uma lista curta e acionável, agrupada pelas seções acima, com o nome da
clínica e a ação exata a fazer (ex.: "Enviar WhatsApp toque 1" — sugira
rodar `/outreach <nome da clínica>` para gerar o texto). Português do
Brasil, direto.
