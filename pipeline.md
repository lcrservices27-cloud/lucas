# Pipeline de Contatos — Lucas AI

Registro de cada toque feito com cada clínica. Uma linha por contato.
Fonte de leads: `clinicas.csv`.

## Status possíveis
- `novo` — ainda sem nenhum toque
- `toque_1_wpp` — WhatsApp inicial enviado
- `toque_2_call` — cold call feita
- `toque_3_followup` — WhatsApp de follow-up enviado
- `diagnostico_agendado` — reunião de diagnóstico marcada
- `diagnostico_feito` — diagnóstico entregue, aguardando proposta
- `proposta_enviada` — proposta enviada
- `fechado` — contrato assinado
- `perdido` — sem resposta após os 3 toques ou recusa explícita

## Log de contatos

| Data | Clínica | Toque | Canal | Resultado | Próximo passo | Data agendada |
|------|---------|-------|-------|-----------|----------------|----------------|
