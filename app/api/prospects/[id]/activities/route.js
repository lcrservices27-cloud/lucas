import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validateActivity, UUID_RE } from '@/lib/validation';

export async function GET(request, { params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const result = await getPool().query(
    'SELECT * FROM prospect_activities WHERE prospect_id = $1 ORDER BY contact_date DESC, created_at DESC',
    [id]
  );
  return NextResponse.json({ rows: result.rows });
}

export async function POST(request, { params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const error = validateActivity(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const prospectCheck = await client.query('SELECT id FROM prospects WHERE id = $1 FOR UPDATE', [id]);
    if (prospectCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Prospect não encontrado' }, { status: 404 });
    }

    const activityResult = await client.query(
      `INSERT INTO prospect_activities
         (prospect_id, contact_date, contact_type, with_whom, result, next_step, next_step_date)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        body.contact_date || null,
        body.contact_type,
        body.with_whom || null,
        body.result.trim(),
        body.next_step || null,
        body.next_step_date || null,
      ]
    );

    let prospectResult;
    if (body.new_status) {
      prospectResult = await client.query(
        `UPDATE prospects SET status = $1, next_step = $2, next_step_date = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [body.new_status, body.next_step || null, body.next_step_date || null, id]
      );
    } else {
      prospectResult = await client.query('SELECT * FROM prospects WHERE id = $1', [id]);
    }

    await client.query('COMMIT');
    return NextResponse.json(
      { activity: activityResult.rows[0], prospect: prospectResult.rows[0] },
      { status: 201 }
    );
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
