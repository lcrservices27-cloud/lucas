'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUSES, SCORES, SCORE_EMOJI } from '@/lib/constants';
import { api } from '@/lib/api-client';
import ProspectTable from '@/components/ProspectTable';
import ProspectPanel from '@/components/ProspectPanel';

export default function DashboardPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState([]);
  const [scoreFilter, setScoreFilter] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listProspects({ status: statusFilter, score: scoreFilter, q: search });
      setProspects(data.rows);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, scoreFilter, search]);

  useEffect(() => {
    // Busca ao montar e sempre que os filtros mudam — o padrão padrão de fetch-on-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const counts = useMemo(() => {
    const byScore = {};
    for (const s of SCORES) byScore[s] = 0;
    for (const p of prospects) byScore[p.score] = (byScore[p.score] || 0) + 1;
    return byScore;
  }, [prospects]);

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function openProspect(id) {
    const data = await api.getProspect(id);
    setSelected(data);
  }

  async function handleSave(id, patch) {
    await api.updateProspect(id, patch);
    await Promise.all([load(), openProspect(id)]);
  }

  async function handleAddActivity(id, payload) {
    await api.addActivity(id, payload);
    await Promise.all([load(), openProspect(id)]);
  }

  async function handleLogout() {
    await api.logout();
    router.push('/login');
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>
          Pipeline <span style={{ color: 'var(--blue)' }}>Lucas AI</span>
        </h1>
        <button className="btn btn-ghost" onClick={handleLogout}>
          Sair
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {SCORES.map((s) => (
          <div key={s} className="card" style={{ padding: '10px 16px', fontSize: 13 }}>
            {SCORE_EMOJI[s]} {s}: <strong>{counts[s] || 0}</strong>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Buscar</label>
          <input
            placeholder="Nome, telefone, bairro, decisor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Score</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SCORES.map((s) => (
              <button
                key={s}
                type="button"
                className="btn"
                style={{
                  height: 32,
                  padding: '0 12px',
                  background: scoreFilter.includes(s) ? 'var(--blue)' : 'rgba(30,41,59,0.5)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-strong)',
                }}
                onClick={() => toggle(scoreFilter, setScoreFilter, s)}
              >
                {SCORE_EMOJI[s]} {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Status</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className="btn"
                style={{
                  height: 32,
                  padding: '0 12px',
                  fontSize: 12,
                  background: statusFilter.includes(s) ? 'var(--blue)' : 'rgba(30,41,59,0.5)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-strong)',
                }}
                onClick={() => toggle(statusFilter, setStatusFilter, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <ProspectTable prospects={prospects} onSelect={openProspect} loading={loading} />
      </div>

      <ProspectPanel
        prospect={selected}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
}
