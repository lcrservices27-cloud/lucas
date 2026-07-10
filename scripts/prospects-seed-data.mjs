// Transcrição manual, célula a célula, de comercial/alvos-25-reclassificados.md
// (fonte: imobiliarias_fortaleza_v1.csv, reclassificação 2026-07-07 via skill qualificar-alvo).
// Este arquivo supersede comercial/pipeline.md e comercial/pipeline-reclassificado.md — os
// 5 alvos originais do pipeline.md já estão inclusos aqui (Triunfo, C.Mendes, Antônio Neto,
// Adriano Freire, APSA Aldeota), com a classificação final e corrigida da reclassificação
// dos 25 alvos. Nenhum texto foi parafraseado — citações copiadas literalmente da fonte.
//
// Conflito resolvido com o usuário em 2026-07-10: APSA Aldeota é SKIP (foco Locação/Adm,
// viola ICP), não HOT como constava em pipeline-reclassificado.md (versão anterior, incorreta).

const SOURCE = 'imobiliarias_fortaleza_v1.csv (alvos-25-reclassificados.md)';
const EVIDENCE_DATE = '2026-07-07';
const FIT_ICP_NOTE = 'Fit ICP: Parcial — nº corretores: VERIFICAR. Sinal de compra ativo: sim.';

function hot(name, neighborhood, phone, pain) {
  return {
    name,
    neighborhood,
    phone,
    decision_maker: null,
    score: 'Hot',
    confidence: 'Média',
    pain_evidence: pain,
    evidence_source: SOURCE,
    evidence_date: EVIDENCE_DATE,
    notes: FIT_ICP_NOTE,
    next_step: 'Ligar',
    next_step_date: null,
  };
}

function warm(name, neighborhood, phone, pain) {
  return { ...hot(name, neighborhood, phone, pain), score: 'Warm' };
}

function cold(name, neighborhood, phone, pain, razao) {
  return {
    name,
    neighborhood,
    phone,
    decision_maker: null,
    score: 'Cold',
    confidence: 'Baixa',
    pain_evidence: pain,
    evidence_source: SOURCE,
    evidence_date: EVIDENCE_DATE,
    notes: `Razão: ${razao}`,
    next_step: 'Ligar em 2+ semanas',
    next_step_date: null,
  };
}

function skip(name, neighborhood, phone, desqualificador) {
  return {
    name,
    neighborhood,
    phone,
    decision_maker: null,
    score: 'Skip',
    confidence: 'Baixa',
    pain_evidence: null,
    evidence_source: SOURCE,
    evidence_date: EVIDENCE_DATE,
    notes: `Desqualificador: ${desqualificador}`,
    next_step: 'Não contatar',
    next_step_date: null,
  };
}

export const prospects = [
  // HOT — 4 (Ligar Hoje)
  hot('Triunfo Imóveis', 'Aldeota', '(85) 3016-3300', 'Recepcionista desligando ligações 3x seguidas'),
  hot('C.Mendes Imóveis', 'Parque Manibura', '(85) 3038-7063', 'Visita agendada sem ligação de confirmação e sem retorno'),
  hot('Antônio Neto Imóveis', 'Cambeba', '(85) 98678-8269', 'Visita cancelada sem aviso; cliente só soube ao cobrar confirmação'),
  hot('Adriano Freire Imóveis', 'Cocó', '(85) 98113-3290', 'Corretora parou de responder após confirmar visita'),

  // WARM — 4 (Ligar Próxima Semana)
  warm('Alessandro Belchior', 'Meireles', '(85) 3466-4343', 'Problemas no atendimento via WhatsApp'),
  warm('Inov9 Imóveis', 'Mondubim/Jardim Cearense', '(85) 3291-2555', 'Múltiplas ligações sem gestão pós-recusa; WhatsApp com problema; demora 48h'),
  warm('MCX Imóveis', 'Cocó', '(85) 3250-5050', 'E-mails sem resposta; atendimento telefônico ruim'),
  warm('Lopes Immobilis', 'Meireles', '(85) 3198-6648', 'Pós-venda sem retorno do corretor'),

  // COLD — 14 (Ligar em 2+ Semanas)
  cold('Fz Imóveis', 'Meireles', '(85) 3462-2000', 'Atendimento e retorno ruins (nota 3.5)', 'Sinal documentado mas nota baixa = risco de cliente ruim'),
  cold('Imobiliária Magno Muniz', 'Papicu', '(85) 3265-6969', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('Torres de Melo Neto', 'Meireles', '(85) 4011-0800', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('César Rêgo Imóveis', 'Aldeota', '(85) 3305-3000', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('Mega Imóveis', 'Aldeota', '(85) 3055-1111', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('Sol Nascente', 'Edson Queiroz', '(85) 3444-4810', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('SJ Property Management', 'Aldeota', '(85) 3255-8888', 'Sem dor documentada (2.480 reviews = grande)', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('Fiducial Imobiliária', 'Aldeota', '(85) 3131-2000', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('Seta Imóveis', 'Fátima', '(85) 3454-1111', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais públicos'),
  cold('Nova Era Imóveis', 'Cocó', '(85) 4101-8585', 'Reviews elogiam atendimento WhatsApp', 'Fit parcial — n° corretores: VERIFICAR; dor improvável (sinal negativo)'),
  cold('WF Imóveis CE', 'Edson Queiroz', '(85) 3023-8743', 'Sem dor documentada (5.0 nota)', 'Fit parcial — n° corretores: VERIFICAR; zero sinais'),
  cold('Fernando Freitas', 'Aldeota', '(85) 3491-1444', 'Sem dor documentada', 'Fit parcial — n° corretores: VERIFICAR; zero sinais'),
  cold('RE/MAX Elegante', 'Edson Queiroz', '(85) 99865-4447', 'Problema não resolvido; franquia', 'Sinal documentado mas risco franquia = autonomia questionável'),
  cold('Novo Conceito', 'Aldeota', '(85) 98103-3535', 'Sem dor documentada; porte pequeno (26 reviews)', 'Fit parcial, zero sinais'),

  // SKIP — 3 (Não Contatar)
  skip('APSA Aldeota', 'Aldeota', '(85) 4005-0505', 'Foco "Locação/Adm" (violação ICP: não é venda). SKIP por modelo de negócio'),
  skip('Imobiliária Ciro Paiva', 'Edson Queiroz', '(85) 98956-6313', 'Nota 3.5 + "atendimento grosseiro" (risco de cliente ruim)'),
  skip('Paulo Ximenes Negócios', 'Meireles', '(85) 3264-9556', 'Porte muito pequeno (48 reviews), sinal documentado mas fit parcial'),
];
