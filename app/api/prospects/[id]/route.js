import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validateProspect, pickProspectFields, UUID_RE } from '@/lib/validation';

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const pool = getPool();
  const prospectResult = await pool.query('SELECT * FROM prospects WHERE id = $1', [id]);
  if (prospectResult.rows.length === 0) {
    return NextResponse.json({ error: 'Prospect não encontrado' }, { status: 404 });
  }

  const activitiesResult = await pool.query(
    'SELECT * FROM prospect_activities WHERE prospect_id = $1 ORDER BY contact_date DESC, created_at DESC',
    [id]
  );

  return NextResponse.json({ ...prospectResult.rows[0], activities: activitiesResult.rows });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const pool = getPool();
  const current = await pool.query('SELECT * FROM prospects WHERE id = $1', [id]);
  if (current.rows.length === 0) {
    return NextResponse.json({ error: 'Prospect não encontrado' }, { status: 404 });
  }

  const patch = pickProspectFields(body);
  const merged = { ...current.rows[0], ...patch };
  const error = validateProspect(merged);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE prospects SET
         name = $1, neighborhood = $2, phone = $3, decision_maker = $4, status = $5,
         score = $6, confidence = $7, pain_evidence = $8, evidence_source = $9,
         evidence_date = $10, notes = $11, next_step = $12, next_step_date = $13,
         updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        merged.name,
        merged.neighborhood,
        merged.phone,
        merged.decision_maker,
        merged.status,
        merged.score,
        merged.confidence,
        merged.pain_evidence,
        merged.evidence_source,
        merged.evidence_date,
        merged.notes,
        merged.next_step,
        merged.next_step_date,
        id,
      ]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Já existe um prospect com esse telefone' }, { status: 409 });
    }
    throw err;
  }
}
