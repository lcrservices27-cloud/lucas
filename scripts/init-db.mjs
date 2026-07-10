import { getPool } from '../lib/db.js';

const TABLES = [
  `CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100),
    phone VARCHAR(20),
    decision_maker VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'A contatar'
      CHECK (status IN ('A contatar','Ligou','WhatsApp enviado','Diagnóstico agendado','Laudo entregue','Proposta','Fechado','Perdido')),
    score VARCHAR(10) NOT NULL CHECK (score IN ('Hot','Warm','Cold','Skip')),
    confidence VARCHAR(10) NOT NULL CHECK (confidence IN ('Alta','Média','Baixa')),
    pain_evidence TEXT,
    evidence_source VARCHAR(255),
    evidence_date DATE,
    notes TEXT,
    next_step TEXT,
    next_step_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS prospects_phone_unique_idx
    ON prospects (phone) WHERE phone IS NOT NULL AND phone <> '';`,
  `CREATE TABLE IF NOT EXISTS prospect_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id),
    contact_date DATE NOT NULL DEFAULT CURRENT_DATE,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('Ligação','WhatsApp','Call')),
    with_whom VARCHAR(255),
    result TEXT NOT NULL,
    next_step TEXT,
    next_step_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
  );`,
  `CREATE INDEX IF NOT EXISTS prospect_activities_prospect_id_idx ON prospect_activities (prospect_id);`,
];

async function main() {
  const pool = getPool();
  for (const sql of TABLES) {
    await pool.query(sql);
  }
  console.log('✅ Tabelas prospects e prospect_activities criadas/verificadas');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Falha ao inicializar schema:', err.message);
  process.exit(1);
});
