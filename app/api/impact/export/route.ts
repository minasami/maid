import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureImpactTables } from '@/lib/impact';
import { resolveImpactScope } from '@/lib/impactScope';

export const dynamic = 'force-dynamic';

function csvCell(v: unknown) {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  try {
    await ensureImpactTables();
    const period = req.nextUrl.searchParams.get('period') || '';
    const scope = await resolveImpactScope();
    const params: unknown[] = [];
    const where: string[] = [];
    if (period) {
      params.push(period);
      where.push(`period = $${params.length}`);
    }
    if (!scope.all && scope.companies.length) {
      params.push(scope.companies.map((c) => c.toLowerCase()));
      where.push(`lower(trim(company)) = ANY($${params.length}::text[])`);
    }
    const sql = `SELECT period, company, emp_id, emp_name, helped, depth, life, note, created_at::text
                 FROM impact_checkins
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY created_at DESC`;
    const rows = await query<Record<string, unknown>>(sql, params);
    const header = ['period', 'company', 'emp_id', 'emp_name', 'helped', 'depth', 'life', 'note', 'created_at'];
    const lines = [header.join(',')].concat(
      rows.rows.map((r) => header.map((h) => csvCell(r[h])).join(','))
    );
    const filename = `impact-${period || 'all'}.csv`;
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Export failed' },
      { status: 500 }
    );
  }
}
