'use client';

import { useState } from 'react';
import { STATUSES, SCORES, CONFIDENCES, SCORE_EMOJI } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import ActivityForm from './ActivityForm';

export default function ProspectPanel({ prospect, onClose, onSave, onAddActivity }) {
  if (!prospect) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      {/* key={prospect.id} força o React a remontar (e reinicializar o form) ao trocar de prospect,
          em vez de sincronizar via useEffect. */}
      <ProspectPanelContent
        key={prospect.id}
        prospect={prospect}
        onClose={onClose}
        onSave={onSave}
        onAddActivity={onAddActivity}
      />
    </div>
  );
}

function buildInitialForm(prospect) {
  return {
    name: prospect.name || '',
    neighborhood: prospect.neighborhood || '',
    phone: prospect.phone || '',
    decision_maker: prospect.decision_maker || '',
    status: prospect.status,
    score: prospect.score,
    confidence: prospect.confidence,
    pain_evidence: prospect.pain_evidence || '',
    evidence_source: prospect.evidence_source || '',
    evidence_date: formatDate(prospect.evidence_date) || '',
    notes: prospect.notes || '',
    next_step: prospect.next_step || '',
    next_step_date: formatDate(prospect.next_step_date) || '',
  };
}

function ProspectPanelContent({ prospect, onClose, onSave, onAddActivity }) {
  const [form, setForm] = useState(() => buildInitialForm(prospect));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {};
      for (const [key, value] of Object.entries(form)) {
        payload[key] = typeof value === 'string' && value.trim() === '' ? null : value;
      }
      await onSave(prospect.id, payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="card"
      style={{
        width: 'min(480px, 100%)',
        height: '100%',
        overflowY: 'auto',
        borderRadius: 0,
        padding: 24,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{prospect.name}</h2>
        <button className="btn btn-ghost" onClick={onClose} style={{ height: 32, padding: '0 12px' }}>
          Fechar
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <Field label="Nome">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Bairro">
            <input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
          </Field>
          <Field label="Telefone">
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
        </div>
        <Field label="Decisor">
          <input value={form.decision_maker} onChange={(e) => set('decision_maker', e.target.value)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Score">
            <select value={form.score} onChange={(e) => set('score', e.target.value)}>
              {SCORES.map((s) => (
                <option key={s} value={s}>
                  {SCORE_EMOJI[s]} {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Confiança">
            <select value={form.confidence} onChange={(e) => set('confidence', e.target.value)}>
              {CONFIDENCES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Citação literal da fonte — não parafrasear">
          <textarea value={form.pain_evidence} onChange={(e) => set('pain_evidence', e.target.value)} rows={2} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Fonte da evidência">
            <input value={form.evidence_source} onChange={(e) => set('evidence_source', e.target.value)} />
          </Field>
          <Field label="Data da evidência">
            <input type="date" value={form.evidence_date} onChange={(e) => set('evidence_date', e.target.value)} />
          </Field>
        </div>

        <Field label="Notas">
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Próximo passo">
            <input value={form.next_step} onChange={(e) => set('next_step', e.target.value)} />
          </Field>
          <Field label="Data do próximo passo">
            <input type="date" value={form.next_step_date} onChange={(e) => set('next_step_date', e.target.value)} />
          </Field>
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      <hr style={{ margin: '24px 0', borderColor: 'var(--border)' }} />

      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Histórico de atividades</h3>
      <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
        {(prospect.activities || []).length === 0 && (
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Nenhuma atividade registrada ainda.</p>
        )}
        {(prospect.activities || []).map((a) => (
          <div key={a.id} className="card" style={{ padding: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: 11 }}>
              <span>{a.contact_type}</span>
              <span>{formatDate(a.contact_date)}</span>
            </div>
            {a.with_whom && <p style={{ marginTop: 4 }}>Com: {a.with_whom}</p>}
            <p style={{ marginTop: 4 }}>{a.result}</p>
            {a.next_step && (
              <p style={{ marginTop: 4, color: 'var(--text-2)' }}>
                Próximo: {a.next_step} {a.next_step_date && `(${formatDate(a.next_step_date)})`}
              </p>
            )}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Nova atividade</h3>
      <ActivityForm onSubmit={(payload) => onAddActivity(prospect.id, payload)} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}
