import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validateProspect, pickProspectFields } from '@/lib/validation';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const scoreFilter = searchParams.get('score');
  const q = searchParams.get('q');

  const conditions = [];
  const params = [];

  if (statusFilter) {
    const statuses = statusFilter.split(',').map((s) => s.trim()).filter(Boolean);
    params.push(statuses);
    conditions.push(`status = ANY($${params.length})`);
  }
  if (scoreFilter) {
    const scores = scoreFilter.split(',').map((s) => s.trim()).filter(Boolean);
    params.push(scores);
    conditions.push(`score = ANY($${params.length})`);
  }
  if (q) {
    params.push(`%${q}%`);
    const idx = params.length;
    conditions.push(
      `(name ILIKE $${idx} OR phone ILIKE $${idx} OR neighborhood ILIKE $${idx} OR decision_maker ILIKE $${idx})`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT * FROM prospects
    ${where}
    ORDER BY CASE score WHEN 'Hot' THEN 1 WHEN 'Warm' THEN 2 WHEN 'Cold' THEN 3 ELSE 4 END,
             next_step_date ASC NULLS LAST,
             name ASC
  `;

  const result = await getPool().query(sql, params);
  return NextResponse.json({ rows: result.rows, count: result.rows.length });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const row = { status: 'A contatar', ...pickProspectFields(body) };
  const error = validateProspect(row);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const result = await getPool().query(
      `INSERT INTO prospects
         (name, neighborhood, phone, decision_maker, status, score, confidence,
          pain_evidence, evidence_source, evidence_date, notes, next_step, next_step_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        row.name.trim(),
        row.neighborhood || null,
        row.phone || null,
        row.decision_maker || null,
        row.status,
        row.score,
        row.confidence,
        row.pain_evidence || null,
        row.evidence_source || null,
        row.evidence_date || null,
        row.notes || null,
        row.next_step || null,
        row.next_step_date || null,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Já existe um prospect com esse telefone' }, { status: 409 });
    }
    throw err;
  }
}
