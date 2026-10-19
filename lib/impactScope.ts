import { cookies } from 'next/headers';
import { ADMIN_COOKIE, isValidOpsSecret } from '@/lib/auth';
import { staffAccessStatus } from '@/lib/staffAccess';
import { resolveStaffRole } from '@/lib/staffRoles';
import { listMembershipsForEmail } from '@/lib/organizations';
import type { ImpactScope } from '@/lib/impact';

/** Who is looking: their org, or all orgs for platform staff. */
export async function resolveImpactScope(): Promise<ImpactScope> {
  const status = staffAccessStatus();
  const secret = cookies().get(ADMIN_COOKIE)?.value;
  const platform = isValidOpsSecret(secret);

  if (status.staff_ok && status.staff_email) {
    const memberships = await listMembershipsForEmail(status.staff_email);
    if (memberships.length) {
      const names = memberships.map((m) => m.org_name);
      const companies = memberships.flatMap((m) => [m.org_code, m.org_name]);
      return {
        all: false,
        org_ids: memberships.map((m) => m.org_id),
        companies,
        label: names.join(' · ') || 'Your organization',
      };
    }
    const role = await resolveStaffRole(status.staff_email);
    if (role.source === 'env_admin' || role.role === 'admin' || role.can_ops || platform) {
      return { all: true, org_ids: [], companies: [], label: 'All organizations' };
    }
  }

  if (platform) {
    return { all: true, org_ids: [], companies: [], label: 'All organizations' };
  }

  return { all: true, org_ids: [], companies: [], label: 'All organizations' };
}
