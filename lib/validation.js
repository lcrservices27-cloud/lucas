import { STATUSES, SCORES, CONFIDENCES, CONTACT_TYPES } from './constants.js';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PROSPECT_FIELDS = [
  'name',
  'neighborhood',
  'phone',
  'decision_maker',
  'status',
  'score',
  'confidence',
  'pain_evidence',
  'evidence_source',
  'evidence_date',
  'notes',
  'next_step',
  'next_step_date',
];

export function pickProspectFields(body) {
  const out = {};
  for (const key of PROSPECT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) out[key] = body[key];
  }
  return out;
}

// Valida um prospect já mesclado (dados atuais + patch, ou payload completo de criação).
// Retorna string de erro ou null.
export function validateProspect(row) {
  if (typeof row.name !== 'string' || !row.name.trim()) {
    return 'name é obrigatório';
  }
  if (!STATUSES.includes(row.status)) {
    return `status inválido: deve ser um de ${STATUSES.join(', ')}`;
  }
  if (!SCORES.includes(row.score)) {
    return `score inválido: deve ser um de ${SCORES.join(', ')}`;
  }
  if (!CONFIDENCES.includes(row.confidence)) {
    return `confidence inválido: deve ser um de ${CONFIDENCES.join(', ')}`;
  }
  if (row.score === 'Hot' || row.score === 'Warm') {
    if (!row.pain_evidence || !String(row.pain_evidence).trim()) {
      return 'Hot/Warm exige pain_evidence (citação literal da fonte)';
    }
    if (!row.evidence_source || !String(row.evidence_source).trim()) {
      return 'Hot/Warm exige evidence_source (de onde veio a evidência)';
    }
  }
  return null;
}

export function validateActivity(body) {
  if (!CONTACT_TYPES.includes(body.contact_type)) {
    return `contact_type inválido: deve ser um de ${CONTACT_TYPES.join(', ')}`;
  }
  if (!body.result || !String(body.result).trim()) {
    return 'result é obrigatório';
  }
  if (body.new_status !== undefined && body.new_status !== null && !STATUSES.includes(body.new_status)) {
    return `new_status inválido: deve ser um de ${STATUSES.join(', ')}`;
  }
  return null;
}
