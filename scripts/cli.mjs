import { getPool } from '../lib/db.js';
import { SCORE_EMOJI } from '../lib/constants.js';

const filter = process.argv[2] ? process.argv[2].toLowerCase() : null;
const scoreMap = { hot: 'Hot', warm: 'Warm', cold: 'Cold', skip: 'Skip' };

function formatDate(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

async function main() {
  const pool = getPool();
  const params = [];
  let where = '';
  if (filter && scoreMap[filter]) {
    where = 'WHERE score = $1';
    params.push(scoreMap[filter]);
  }

  const result = await pool.query(
    `SELECT * FROM prospects ${where}
     ORDER BY CASE score WHEN 'Hot' THEN 1 WHEN 'Warm' THEN 2 WHEN 'Cold' THEN 3 ELSE 4 END,
              next_step_date ASC NULLS LAST, name ASC`,
    params
  );

  if (result.rows.length === 0) {
    console.log('Nenhum prospect encontrado.');
  } else {
    console.log(`\n${result.rows.length} prospect(s):\n`);
    for (const p of result.rows) {
      const emoji = SCORE_EMOJI[p.score] || '';
      console.log(`${emoji} ${p.name} — ${p.status} — ${p.phone || 'sem telefone'}`);
      const nextDate = formatDate(p.next_step_date);
      console.log(`   Próximo passo: ${p.next_step || '-'}${nextDate ? ` (${nextDate})` : ''}`);
      if (p.pain_evidence) console.log(`   Evidência: "${p.pain_evidence}" — ${p.evidence_source || 'fonte não informada'}`);
      console.log('');
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
