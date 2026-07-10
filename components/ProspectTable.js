'use client';

import { SCORE_EMOJI } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const STATUS_COLOR = {
  'A contatar': 'var(--text-2)',
  Ligou: 'var(--blue)',
  'WhatsApp enviado': 'var(--blue)',
  'Diagnóstico agendado': 'var(--yellow)',
  'Laudo entregue': 'var(--yellow)',
  Proposta: 'var(--yellow)',
  Fechado: 'var(--green)',
  Perdido: 'var(--red)',
};

export default function ProspectTable({ prospects, onSelect, loading }) {
  if (loading) {
    return <p style={{ color: 'var(--text-2)', padding: 24 }}>Carregando...</p>;
  }

  if (prospects.length === 0) {
    return <p style={{ color: 'var(--text-2)', padding: 24 }}>Nenhum prospect encontrado com esses filtros.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase' }}>
            <th style={cellStyle}>Imobiliária</th>
            <th style={cellStyle}>Bairro</th>
            <th style={cellStyle}>Telefone</th>
            <th style={cellStyle}>Decisor</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Score</th>
            <th style={cellStyle}>Confiança</th>
            <th style={cellStyle}>Próximo Passo</th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((p) => (
            <tr
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(30,41,59,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ ...cellStyle, fontWeight: 600 }}>{p.name}</td>
              <td style={cellStyle}>{p.neighborhood || '-'}</td>
              <td style={cellStyle}>{p.phone || '-'}</td>
              <td style={cellStyle}>{p.decision_maker || '-'}</td>
              <td style={cellStyle}>
                <span className="badge" style={{ color: STATUS_COLOR[p.status] || 'var(--text)' }}>
                  {p.status}
                </span>
              </td>
              <td style={cellStyle}>
                {SCORE_EMOJI[p.score]} {p.score}
              </td>
              <td style={cellStyle}>{p.confidence}</td>
              <td style={cellStyle}>
                {p.next_step || '-'}
                {p.next_step_date && (
                  <span style={{ color: 'var(--text-2)' }}> ({formatDate(p.next_step_date)})</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = { padding: '10px 12px', whiteSpace: 'nowrap' };
