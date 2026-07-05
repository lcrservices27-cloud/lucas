---
description: Gera relatório de perda mensal (1 página, marca Lucas AI) a partir dos números do cliente
argument-hint: [nome da clínica + números fornecidos pelo cliente]
---

Você é o agente de diagnóstico da Lucas AI. Leia `CLAUDE.md` na raiz do
projeto antes de agir.

Dados recebidos: $ARGUMENTS

## Tarefa

Gerar um relatório de UMA página, com a marca Lucas AI, que quantifica
quanto a clínica perde por mês por não atender ligações/leads a tempo.
Este relatório é a alavanca de conversão do funil — precisa ser
concreto e usar os números do próprio cliente (Gap Selling: quantificar
o gap, não vender tecnologia).

### Dados necessários (pergunte o que faltar, não invente)
- Número médio de ligações/leads recebidos por mês
- Quantos desses NÃO são atendidos a tempo (perdidos, caixa postal,
  fora do horário, ocupado)
- Taxa de conversão de lead atendido → agendamento
- Taxa de conversão de agendamento → comparecimento (se souber)
- Ticket médio do procedimento/consulta

Se qualquer um desses números não for fornecido, escreva explicitamente
"não encontrado" ou peça ao usuário antes de calcular — nunca estime um
número que o cliente não deu.

### Cálculo (sempre conservador — regra de operação #3)
1. Leads perdidos/mês = leads recebidos × % não atendido a tempo
2. Ao converter leads perdidos em agendamentos, use a taxa de
   conversão MAIS BAIXA que o cliente informou (ou a mais conservadora
   entre as fornecidas)
3. Agendamentos perdidos/mês = leads perdidos × taxa de conversão
4. Se houver taxa de comparecimento, aplique-a também
5. Perda estimada em R$/mês = agendamentos perdidos × ticket médio
6. Arredonde sempre para baixo, nunca para cima
7. Deixe explícito no relatório: "estimativa conservadora, baseada nos
   números informados pela própria clínica"

### Estrutura do relatório (1 página)
1. Cabeçalho: nome da clínica + "Diagnóstico Lucas AI — Perda de Receita
   por Atendimento"
2. Os números base usados (transparência total, para gerar confiança)
3. O cálculo passo a passo (curto, sem jargão técnico)
4. O número final em destaque: "Você está perdendo aproximadamente
   R$ X/mês"
5. Uma frase de fechamento ligando a perda à solução, sem ainda falar
   de preço ou detalhes técnicos da IA (isso é papel da proposta,
   $100M Offers vem depois)
6. Rodapé com a marca Lucas AI

### Regras
- Português do Brasil, direto, sem exagero nem promessa vazia
- Não mencionar preço da Lucas AI neste documento
- Ao final, pergunte se deve atualizar o status do lead em
  `pipeline.md` para `diagnostico_feito`
