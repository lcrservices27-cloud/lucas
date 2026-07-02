require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '001_schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Migrations executadas com sucesso.');
  } catch (err) {
    console.error('❌ Erro na migration:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
