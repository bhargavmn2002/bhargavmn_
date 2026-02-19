/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Activity, Monitor, Users, Building2, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

type HierarchyInfo = {
  clientAdmin: {
    id: string;
    email: string;
    name: string;
  } | null;
  userAdmin: {
    id: string;
    email: string;
  } | null;
  companyName: string | null;
};

type UserProfile = {
  id: string;
  email: string;
  role: string;
  staffRole?: string;
  isActive: boolean;
  createdAt: string;
};

export default function ClientDashboard() {
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyInfo | null>(null);

  useEffect(() => {
    // Fetch analytics summary
    api
      .get('/analytics/summary')
      .then((res) => {
        if (res.data.role === 'CLIENT_ADMIN') {
          setSummary(res.data);
        }
      })
      .catch(() => setSummary(null));

    // Fetch user profile and hierarchy
    api
      .get('/users/profile')
      .then((res) => {
        setProfile(res.data.user);
        setHierarchy(res.data.hierarchy);
      })
      .catch(() => {
        setProfile(null);
        setHierarchy(null);
      });
  }, []);

  const licenseLabel =
    summary && summary.license.expiry
      ? `${summary.license.status} · Expires ${new Date(
          summary.license.expiry
        ).toLocaleDateString()}`
      : summary
      ? summary.license.status
      : undefined;

  const getRoleDisplayName = (role: string, staffRole?: string) => {
    const roleNames = {
      SUPER_ADMIN: 'Super Administrator',
      CLIENT_ADMIN: 'Client Administrator',
      USER_ADMIN: 'User Administrator',
      STAFF: 'Staff Member'
    };

    const staffRoleNames = {
      DISPLAY_MANAGER: 'Display Manager',
      BROADCAST_MANAGER: 'Broadcast Manager',
      CONTENT_MANAGER: 'Content Manager',
      CMS_VIEWER: 'CMS Viewer',
      POP_MANAGER: 'Proof of Play Manager'
    };

    let displayName = roleNames[role as keyof typeof roleNames] || role;
    if (role === 'STAFF' && staffRole) {
      displayName += ` - ${staffRoleNames[staffRole as keyof typeof staffRoleNames] || staffRole}`;
    }
    return displayName;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
              {profile && (
                <Badge variant="outline">
                  {getRoleDisplayName(profile.role, profile.staffRole)}
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-gray-600">Tenant analytics and quick actions</p>
              {hierarchy?.companyName && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4" />
                  <span>{hierarchy.companyName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Information Card */}
        {(profile || hierarchy) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Administrator Information
              </CardTitle>
              <CardDescription>Your account and organization details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{profile?.email || 'Loading...'}</p>
                </div>
                {hierarchy?.companyName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p className="text-sm text-gray-900">{hierarchy.companyName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="User Admins"
            value={summary?.userAdmins ?? '—'}
            icon={<Users className="h-8 w-8" />}
          />
          <StatCard
            title="Displays"
            value={summary ? `${summary.totalDisplays}/${summary.displayLimit}` : '—'}
            subtitle="Current displays vs license limit"
            icon={<Monitor className="h-8 w-8" />}
          />
          <StatCard
            title="License Status"
            value={summary?.license.status ?? '—'}
            subtitle={licenseLabel}
            icon={<Activity className="h-8 w-8" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
