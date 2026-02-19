/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Activity, HardDrive, ListMusic, Monitor, PlusCircle, Upload, Building2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface UserSummary {
  displays: {
    total: number;
    online: number;
    offline: number;
  };
  mediaCount: number;
  playlistCount: number;
  storageBytes: number;
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

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
}

export default function UserAdminDashboard() {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch analytics summary
    api
      .get('/analytics/summary')
      .then((res) => {
        if (res.data.role === 'USER_ADMIN') {
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

  const healthSubtitle =
    summary && summary.displays.total > 0
      ? `${summary.displays.online} online · ${summary.displays.offline} offline`
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {profile && (
                <Badge variant="outline">
                  {getRoleDisplayName(profile.role, profile.staffRole)}
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-gray-600">Display health and content overview</p>
              {hierarchy?.companyName && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4" />
                  <span>{hierarchy.companyName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              onClick={() => router.push('/user/displays')}
            >
              <PlusCircle className="h-4 w-4" />
              Add Display
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              onClick={() => router.push('/user/media')}
            >
              <Upload className="h-4 w-4" />
              Upload Media
            </Button>
          </div>
        </div>

        {/* User Information Card */}
        {(profile || hierarchy) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
              <CardDescription>Your account and organization details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{profile?.email || 'Loading...'}</p>
                </div>
                {hierarchy?.clientAdmin && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client Administrator</p>
                    <p className="text-sm text-gray-900">{hierarchy.clientAdmin.name}</p>
                    <p className="text-xs text-gray-500">{hierarchy.clientAdmin.email}</p>
                  </div>
                )}
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
            title="My Displays"
            value={summary?.displays.total ?? '—'}
            subtitle={healthSubtitle}
            icon={<Monitor className="h-8 w-8" />}
          />
          <StatCard
            title="Media Files"
            value={summary?.mediaCount ?? '—'}
            icon={<Activity className="h-8 w-8" />}
          />
          <StatCard
            title="Playlists"
            value={summary?.playlistCount ?? '—'}
            icon={<ListMusic className="h-8 w-8" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Storage Used"
            value={summary ? formatBytes(summary.storageBytes) : '—'}
            subtitle="Approximate usage based on uploaded file sizes"
            icon={<HardDrive className="h-8 w-8" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
