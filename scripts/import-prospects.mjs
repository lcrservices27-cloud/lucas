import { getPool } from '../lib/db.js';
import { prospects } from './prospects-seed-data.mjs';
import { validateProspect } from '../lib/validation.js';

function validateSeedData(rows) {
  const seenPhones = new Map();
  for (const row of rows) {
    if (row.phone) {
      const prev = seenPhones.get(row.phone);
      if (prev) {
        throw new Error(`Telefone duplicado: "${row.phone}" em "${prev}" e "${row.name}"`);
      }
      seenPhones.set(row.phone, row.name);
    }

    const error = validateProspect({ status: 'A contatar', ...row });
    if (error) {
      throw new Error(`Registro inválido para "${row.name}": ${error}`);
    }
  }
}

async function main() {
  validateSeedData(prospects);
  console.log(`✅ Validação ok — ${prospects.length} registros prontos para importar\n`);

  const pool = getPool();
  let inserted = 0;
  let skipped = 0;

  for (const p of prospects) {
    const result = await pool.query(
      `INSERT INTO prospects
         (name, neighborhood, phone, decision_maker, score, confidence,
          pain_evidence, evidence_source, evidence_date, notes, next_step, next_step_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (phone) DO NOTHING
       RETURNING id`,
      [
        p.name,
        p.neighborhood,
        p.phone,
        p.decision_maker,
        p.score,
        p.confidence,
        p.pain_evidence,
        p.evidence_source,
        p.evidence_date,
        p.notes,
        p.next_step,
        p.next_step_date,
      ]
    );
    if (result.rows.length > 0) {
      inserted += 1;
      console.log(`  + ${p.name}`);
    } else {
      skipped += 1;
      console.log(`  · ${p.name} (já existe, mantido como está)`);
    }
  }

  console.log(`\n✅ Importação concluída: ${inserted} inseridos, ${skipped} já existentes/ignorados`);
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Falha na importação:', err.message);
  process.exit(1);
});
