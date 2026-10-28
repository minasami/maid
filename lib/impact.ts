import { query } from '@/lib/db';
import { lookupEmployeeProfile } from '@/lib/employeePortal';

export type Helped = 'yes' | 'somewhat' | 'no';

export type ImpactCheckin = {
  id: string;
  company: string;
  emp_id: string;
  emp_name: string | null;
  period: string;
  helped: Helped;
  depth: number;
  life: number;
  note: string | null;
  created_at: string;
};

export async function ensureImpactTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS impact_checkins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company TEXT NOT NULL,
      emp_id TEXT NOT NULL,
      emp_name TEXT,
      period TEXT NOT NULL,
      helped TEXT NOT NULL CHECK (helped IN ('yes', 'somewhat', 'no')),
      depth SMALLINT NOT NULL CHECK (depth BETWEEN 1 AND 5),
      life SMALLINT NOT NULL CHECK (life BETWEEN 1 AND 5),
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (company, emp_id, period)
    )`);
  await query(
    `CREATE INDEX IF NOT EXISTS idx_impact_checkins_period ON impact_checkins(period)`
  );
}

export function currentPeriod(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function previousPeriod(period: string) {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function saveImpactCheckin(input: {
  company: string;
  emp_id: string;
  phone: string;
  helped: Helped;
  depth: number;
  life: number;
  note?: string;
  period?: string;
}): Promise<ImpactCheckin> {
  const profile = await lookupEmployeeProfile({
    company: input.company,
    emp_id: input.emp_id,
    phone: input.phone,
  });
  if (!profile) {
    throw new Error('No match. Check company, employee ID, and phone.');
  }

  const helped = input.helped;
  if (!['yes', 'somewhat', 'no'].includes(helped)) {
    throw new Error('helped must be yes, somewhat, or no');
  }
  const depth = Math.round(Number(input.depth));
  const life = Math.round(Number(input.life));
  if (depth < 1 || depth > 5 || life < 1 || life > 5) {
    throw new Error('depth and life must be 1–5');
  }

  await ensureImpactTables();
  const period = input.period || currentPeriod();
  const company = input.company.trim();
  const empId = input.emp_id.trim();
  const note = (input.note || '').trim().slice(0, 500) || null;

  const res = await query<ImpactCheckin>(
    `INSERT INTO impact_checkins (company, emp_id, emp_name, period, helped, depth, life, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (company, emp_id, period)
     DO UPDATE SET
       emp_name = EXCLUDED.emp_name,
       helped = EXCLUDED.helped,
       depth = EXCLUDED.depth,
       life = EXCLUDED.life,
       note = EXCLUDED.note,
       created_at = now()
     RETURNING id::text, company, emp_id, emp_name, period, helped, depth, life, note, created_at::text`,
    [company, empId, profile.emp_name, period, helped, depth, life, note]
  );
  return res.rows[0];
}

export async function getImpactCheckin(input: {
  company: string;
  emp_id: string;
  phone: string;
  period?: string;
}): Promise<ImpactCheckin | null> {
  const profile = await lookupEmployeeProfile(input);
  if (!profile) return null;
  await ensureImpactTables();
  const period = input.period || currentPeriod();
  const res = await query<ImpactCheckin>(
    `SELECT id::text, company, emp_id, emp_name, period, helped, depth, life, note, created_at::text
     FROM impact_checkins
     WHERE lower(trim(company)) = lower(trim($1))
       AND trim(emp_id) = trim($2)
       AND period = $3`,
    [input.company, input.emp_id, period]
  );
  return res.rows[0] || null;
}

export type ImpactSummary = {
  period: string;
  org_label: string;
  reach: {
    active_programs: number;
    unique_patients: number;
    unique_employees: number;
  };
  continuity: {
    avg_months_on_program: number;
    dropouts: number;
  };
  delivery: {
    cycles: number;
    dispensed: number;
    delivery_rate: number | null;
  };
  voice: {
    checkins: number;
    helped_yes: number;
    helped_somewhat: number;
    helped_no: number;
    response_rate: number | null;
    helped_rate: number | null;
    avg_depth: number | null;
    avg_life: number | null;
  };
  recent: Array<{
    emp_name: string | null;
    company: string;
    helped: string;
    depth: number;
    life: number;
    note: string | null;
    created_at: string;
  }>;
  trend: Array<{
    period: string;
    checkins: number;
    helped_rate: number | null;
    avg_depth: number | null;
    avg_life: number | null;
  }>;
  prior: {
    period: string;
    delivery_rate: number | null;
    dispensed: number;
    cycles: number;
    helped_rate: number | null;
    checkins: number;
  } | null;
};

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export type ImpactScope = {
  all: boolean;
  org_ids: string[];
  companies: string[];
  label: string;
  logo_url?: string | null;
};

export async function getImpactSummary(
  period = currentPeriod(),
  scope: ImpactScope = { all: true, org_ids: [], companies: [], label: 'All organizations', logo_url: null }
): Promise<ImpactSummary> {
  await ensureImpactTables();

  const programFilter = scope.all || !scope.org_ids.length
    ? 'TRUE'
    : 'org_id = ANY($2::uuid[])';
  const cycleFilter = scope.all || !scope.org_ids.length
    ? 'period = $1'
    : 'period = $1 AND program_id IN (SELECT id FROM chronic_programs WHERE org_id = ANY($2::uuid[]))';
  const params: unknown[] = [period];
  if (!scope.all && scope.org_ids.length) params.push(scope.org_ids);

  const ops = await query<{
    active_programs: string;
    unique_patients: string;
    unique_employees: string;
    avg_months: string;
    dropouts: string;
    cycles: string;
    dispensed: string;
  }>(
    `SELECT
       (SELECT count(*)::text FROM chronic_programs WHERE status = 'active' AND ${programFilter}) AS active_programs,
       (SELECT count(DISTINCT dependent_id)::text FROM chronic_programs WHERE status = 'active' AND ${programFilter}) AS unique_patients,
       (SELECT count(DISTINCT employee_id)::text FROM chronic_programs WHERE status = 'active' AND ${programFilter}) AS unique_employees,
       (SELECT coalesce(round(avg(EXTRACT(EPOCH FROM (now() - created_at)) / 2592000)::numeric, 1), 0)::text
          FROM chronic_programs WHERE status = 'active' AND ${programFilter}) AS avg_months,
       (SELECT count(*)::text FROM chronic_programs WHERE dropout_at IS NOT NULL AND ${programFilter}) AS dropouts,
       (SELECT count(*)::text FROM refill_cycles WHERE ${cycleFilter}) AS cycles,
       (SELECT count(*)::text FROM refill_cycles WHERE ${cycleFilter} AND status = 'dispensed') AS dispensed`,
    params
  );
  const o = ops.rows[0] || ({} as Record<string, string>);

  const voiceParams: unknown[] = [period];
  let voiceWhere = 'period = $1';
  if (!scope.all && scope.companies.length) {
    voiceParams.push(scope.companies.map((c) => c.toLowerCase()));
    voiceWhere += ` AND lower(trim(company)) = ANY($${voiceParams.length}::text[])`;
  }
  const voice = await query<{
    checkins: string;
    helped_yes: string;
    helped_somewhat: string;
    helped_no: string;
    avg_depth: string;
    avg_life: string;
  }>(
    `SELECT
       count(*)::text AS checkins,
       count(*) FILTER (WHERE helped = 'yes')::text AS helped_yes,
       count(*) FILTER (WHERE helped = 'somewhat')::text AS helped_somewhat,
       count(*) FILTER (WHERE helped = 'no')::text AS helped_no,
       coalesce(round(avg(depth)::numeric, 1), 0)::text AS avg_depth,
       coalesce(round(avg(life)::numeric, 1), 0)::text AS avg_life
     FROM impact_checkins
     WHERE ${voiceWhere}`,
    voiceParams
  );
  const v = voice.rows[0] || ({} as Record<string, string>);

  const recent = await query<{
    emp_name: string | null;
    company: string;
    helped: string;
    depth: number;
    life: number;
    note: string | null;
    created_at: string;
  }>(
    `SELECT emp_name, company, helped, depth, life, note, created_at::text
     FROM impact_checkins
     WHERE ${voiceWhere}
     ORDER BY created_at DESC
     LIMIT 12`,
    voiceParams
  );

  const employees = n(o.unique_employees);
  const checkins = n(v.checkins);
  const cycles = n(o.cycles);
  const dispensed = n(o.dispensed);
  const helpedYes = n(v.helped_yes);
  const helpedSome = n(v.helped_somewhat);

  const trendRes = await query<{
    period: string;
    checkins: string;
    helped_yes: string;
    helped_somewhat: string;
    avg_depth: string;
    avg_life: string;
  }>(
    `SELECT period,
            count(*)::text AS checkins,
            count(*) FILTER (WHERE helped = 'yes')::text AS helped_yes,
            count(*) FILTER (WHERE helped = 'somewhat')::text AS helped_somewhat,
            coalesce(round(avg(depth)::numeric, 1), 0)::text AS avg_depth,
            coalesce(round(avg(life)::numeric, 1), 0)::text AS avg_life
     FROM impact_checkins
     WHERE ${voiceWhere.replace('period = $1', 'period <= $1')}
     GROUP BY period
     ORDER BY period DESC
     LIMIT 3`,
    voiceParams
  );
  const trend = trendRes.rows
    .map((row) => {
      const c = n(row.checkins);
      const helped = n(row.helped_yes) + n(row.helped_somewhat);
      return {
        period: row.period,
        checkins: c,
        helped_rate: c ? Math.round((helped / c) * 100) : null,
        avg_depth: c ? n(row.avg_depth) : null,
        avg_life: c ? n(row.avg_life) : null,
      };
    })
    .reverse();

  const priorPeriod = previousPeriod(period);
  let prior: ImpactSummary['prior'] = null;
  if (priorPeriod !== period) {
    const priorParams: unknown[] = [priorPeriod];
    let priorCycle = 'period = $1';
    if (!scope.all && scope.org_ids.length) {
      priorParams.push(scope.org_ids);
      priorCycle += ' AND program_id IN (SELECT id FROM chronic_programs WHERE org_id = ANY($2::uuid[]))';
    }
    const priorOps = await query<{ cycles: string; dispensed: string }>(
      `SELECT
         (SELECT count(*)::text FROM refill_cycles WHERE ${priorCycle}) AS cycles,
         (SELECT count(*)::text FROM refill_cycles WHERE ${priorCycle} AND status = 'dispensed') AS dispensed`,
      priorParams
    );
    const priorVoiceParams: unknown[] = [priorPeriod];
    let priorVoiceWhere = 'period = $1';
    if (!scope.all && scope.companies.length) {
      priorVoiceParams.push(scope.companies.map((c) => c.toLowerCase()));
      priorVoiceWhere += ` AND lower(trim(company)) = ANY($${priorVoiceParams.length}::text[])`;
    }
    const priorVoice = await query<{ checkins: string; helped_yes: string; helped_somewhat: string }>(
      `SELECT
         count(*)::text AS checkins,
         count(*) FILTER (WHERE helped = 'yes')::text AS helped_yes,
         count(*) FILTER (WHERE helped = 'somewhat')::text AS helped_somewhat
       FROM impact_checkins
       WHERE ${priorVoiceWhere}`,
      priorVoiceParams
    );
    const pc = n(priorOps.rows[0]?.cycles);
    const pd = n(priorOps.rows[0]?.dispensed);
    const pvc = n(priorVoice.rows[0]?.checkins);
    const pHelped = n(priorVoice.rows[0]?.helped_yes) + n(priorVoice.rows[0]?.helped_somewhat);
    prior = {
      period: priorPeriod,
      cycles: pc,
      dispensed: pd,
      delivery_rate: pc ? Math.round((pd / pc) * 100) : null,
      checkins: pvc,
      helped_rate: pvc ? Math.round((pHelped / pvc) * 100) : null,
    };
  }

  return {
    period,
    org_label: scope.label,
    reach: {
      active_programs: n(o.active_programs),
      unique_patients: n(o.unique_patients),
      unique_employees: employees,
    },
    continuity: {
      avg_months_on_program: n(o.avg_months),
      dropouts: n(o.dropouts),
    },
    delivery: {
      cycles,
      dispensed,
      delivery_rate: cycles ? Math.round((dispensed / cycles) * 100) : null,
    },
    voice: {
      checkins,
      helped_yes: helpedYes,
      helped_somewhat: helpedSome,
      helped_no: n(v.helped_no),
      response_rate: employees ? Math.round((checkins / employees) * 100) : null,
      helped_rate: checkins
        ? Math.round(((helpedYes + helpedSome) / checkins) * 100)
        : null,
      avg_depth: checkins ? n(v.avg_depth) : null,
      avg_life: checkins ? n(v.avg_life) : null,
    },
    recent: recent.rows,
    trend,
    prior,
  };
}


export type OrgImpactCard = {
  code: string;
  name: string;
  logo_url: string | null;
  active_programs: number;
  unique_patients: number;
  checkins: number;
};

/** One card per active organization, for the platform view. */
export async function getOrgImpactCards(period = currentPeriod()): Promise<OrgImpactCard[]> {
  await ensureImpactTables();
  const rows = await query<{
    code: string;
    name: string;
    logo_url: string | null;
    active_programs: string;
    unique_patients: string;
    checkins: string;
  }>(
    `SELECT o.code, o.name, o.logo_url,
            (SELECT count(*)::text FROM chronic_programs p
              WHERE p.org_id = o.id AND p.status = 'active') AS active_programs,
            (SELECT count(DISTINCT p.dependent_id)::text FROM chronic_programs p
              WHERE p.org_id = o.id AND p.status = 'active') AS unique_patients,
            (SELECT count(*)::text FROM impact_checkins c
              WHERE c.period = $1
                AND (lower(trim(c.company)) = lower(o.code)
                  OR lower(trim(c.company)) = lower(o.name))) AS checkins
     FROM organizations o
     WHERE coalesce(o.status, 'active') = 'active'
     ORDER BY o.name`,
    [period]
  );
  return rows.rows.map((r) => ({
    code: r.code,
    name: r.name,
    logo_url: r.logo_url,
    active_programs: n(r.active_programs),
    unique_patients: n(r.unique_patients),
    checkins: n(r.checkins),
  }));
}
