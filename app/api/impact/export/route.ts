import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureImpactTables, getImpactSummary, getOrgImpactCards } from '@/lib/impact';
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
    const org = req.nextUrl.searchParams.get('org') || '';
    const kind = req.nextUrl.searchParams.get('kind') || 'voices';
    const scope = await resolveImpactScope(org || undefined);

    if (kind === 'board') {
      const summary = await getImpactSummary(period || undefined, scope);
      const cards = scope.all ? await getOrgImpactCards(summary.period) : [];
      const lines = [
        ['section', 'period', 'org', 'metric', 'value'].join(','),
        ['summary', summary.period, scope.label, 'people_reached', summary.reach.unique_patients].map(csvCell).join(','),
        ['summary', summary.period, scope.label, 'active_programs', summary.reach.active_programs].map(csvCell).join(','),
        ['summary', summary.period, scope.label, 'avg_months', summary.continuity.avg_months_on_program].map(csvCell).join(','),
        ['summary', summary.period, scope.label, 'delivery_rate', summary.delivery.delivery_rate ?? ''].map(csvCell).join(','),
        ['summary', summary.period, scope.label, 'helped_rate', summary.voice.helped_rate ?? ''].map(csvCell).join(','),
        ['summary', summary.period, scope.label, 'checkins', summary.voice.checkins].map(csvCell).join(','),
        ...cards.map((c) =>
          ['org', summary.period, c.name, 'people_programs_delivered_helped_answers', `${c.unique_patients}|${c.active_programs}|${c.delivery_rate ?? ''}|${c.helped_rate ?? ''}|${c.checkins}`]
            .map(csvCell)
            .join(',')
        ),
      ];
      const filename = `impact-board-${org || 'all'}-${summary.period}.csv`;
      return new NextResponse(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

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
    const filename = `impact-${org || 'all'}-${period || 'all'}.csv`;
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
