'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AnalyticsData {
  totalClients: number;
  totalDisplays: number;
  onlineDisplays: number;
  offlineDisplays: number;
  systemHealth?: {
    status: string;
    uptime: number;
  };
}

export default function SuperAdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/summary');
      setAnalytics(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Analytics</h1>
          <p className="mt-2 text-gray-600">
            Platform-wide metrics (clients, displays, active status).
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : analytics ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalClients}</p>
                <p className="mt-1 text-sm text-gray-500">CLIENT_ADMIN users</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Displays</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalDisplays}</p>
                <p className="mt-1 text-sm text-gray-500">Paired displays</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-sm font-medium text-gray-500">Online Displays</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">{analytics.onlineDisplays}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {analytics.offlineDisplays} offline
                </p>
              </div>
            </div>

            {analytics.systemHealth && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      {analytics.systemHealth.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Uptime</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatUptime(analytics.systemHealth.uptime)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
            No analytics data available
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

