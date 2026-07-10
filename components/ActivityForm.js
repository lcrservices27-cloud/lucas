'use client';

import { useState } from 'react';
import { CONTACT_TYPES, STATUSES } from '@/lib/constants';

export default function ActivityForm({ onSubmit }) {
  const [contactType, setContactType] = useState(CONTACT_TYPES[0]);
  const [withWhom, setWithWhom] = useState('');
  const [result, setResult] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [nextStepDate, setNextStepDate] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!result.trim()) {
      setError('Resultado é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        contact_type: contactType,
        with_whom: withWhom || null,
        result: result.trim(),
        next_step: nextStep || null,
        next_step_date: nextStepDate || null,
        new_status: newStatus || null,
      });
      setWithWhom('');
      setResult('');
      setNextStep('');
      setNextStepDate('');
      setNewStatus('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label>Tipo de contato</label>
          <select value={contactType} onChange={(e) => setContactType(e.target.value)}>
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Com quem</label>
          <input value={withWhom} onChange={(e) => setWithWhom(e.target.value)} placeholder="Nome / recepção" />
        </div>
      </div>

      <div>
        <label>Resultado</label>
        <textarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          rows={2}
          placeholder="Agendou / Objeção X / Não atendeu..."
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label>Próximo passo</label>
          <input value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
        </div>
        <div>
          <label>Data do próximo passo</label>
          <input type="date" value={nextStepDate} onChange={(e) => setNextStepDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label>Avançar status para (opcional)</label>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="">Não alterar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Salvando...' : 'Registrar atividade'}
      </button>
    </form>
  );
}
