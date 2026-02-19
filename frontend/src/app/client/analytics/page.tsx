/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Activity, Monitor, Users, CalendarClock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import api from '@/lib/api';

interface ClientSummary {
  userAdmins: number;
  totalDisplays: number;
  displayLimit: number;
  license: {
    status: string;
    expiry: string | null;
  };
}

export default function ClientAnalyticsPage() {
  const [summary, setSummary] = useState<ClientSummary | null>(null);

  useEffect(() => {
    api
      .get('/analytics/summary')
      .then((res) => {
        if (res.data.role === 'CLIENT_ADMIN') {
          setSummary(res.data);
        }
      })
      .catch(() => setSummary(null));
  }, []);

  const licenseStatus =
    summary?.license.status ?? '—';

  const licenseExpiry =
    summary && summary.license.expiry
      ? new Date(summary.license.expiry).toLocaleDateString()
      : '—';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Analytics</h1>
          <p className="mt-2 text-gray-600">
            Overview of User Admins, displays, and license status for this tenant.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="User Admins"
            value={summary?.userAdmins ?? '—'}
            icon={<Users className="h-8 w-8" />}
          />
          <StatCard
            title="Displays"
            value={
              summary
                ? `${summary.totalDisplays}/${summary.displayLimit}`
                : '—'
            }
            subtitle="Current displays vs license limit"
            icon={<Monitor className="h-8 w-8" />}
          />
          <StatCard
            title="License Status"
            value={licenseStatus}
            icon={<Activity className="h-8 w-8" />}
          />
          <StatCard
            title="License Expiry"
            value={licenseExpiry}
            icon={<CalendarClock className="h-8 w-8" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

