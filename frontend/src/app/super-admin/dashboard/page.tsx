/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Activity, Monitor, Users, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface SuperAdminSummary {
  totalClients: number;
  totalDisplays: number;
  onlineDisplays: number;
}

type UserProfile = {
  id: string;
  email: string;
  role: string;
  staffRole?: string;
  isActive: boolean;
  createdAt: string;
};

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState<SuperAdminSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch analytics summary
    api
      .get('/analytics/summary')
      .then((res) => {
        if (res.data.role === 'SUPER_ADMIN') {
          setSummary(res.data);
        }
      })
      .catch(() => {
        setSummary(null);
      });

    // Fetch user profile
    api
      .get('/users/profile')
      .then((res) => {
        setProfile(res.data.user);
      })
      .catch(() => {
        setProfile(null);
      });
  }, []);

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
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            {profile && (
              <Badge variant="outline">
                {getRoleDisplayName(profile.role, profile.staffRole)}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-gray-600">Platform-wide control and analytics</p>
        </div>

        {/* User Information Card */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Administrator Information
              </CardTitle>
              <CardDescription>Your super administrator account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Access Level</p>
                  <p className="text-sm text-gray-900">Full Platform Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Clients"
            value={summary?.totalClients ?? '—'}
            icon={<Users className="h-8 w-8" />}
          />
          <StatCard
            title="Total Displays"
            value={summary?.totalDisplays ?? '—'}
            icon={<Monitor className="h-8 w-8" />}
          />
          <StatCard
            title="Online Displays"
            value={summary?.onlineDisplays ?? '—'}
            subtitle={
              summary
                ? `${summary.onlineDisplays} of ${summary.totalDisplays} displays reporting online`
                : undefined
            }
            icon={<Activity className="h-8 w-8" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
