/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Activity, HardDrive, ListMusic, Monitor, PlusCircle, Upload, Building2, User, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });

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
      <div className="space-y-8 pb-8">
        {/* Header Section */}
        <div className="relative" data-aos="fade-down">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-10 w-10 text-yellow-400" />
                  <h1 className="text-4xl font-black text-white">Dashboard</h1>
                  {profile && (
                    <Badge className="bg-yellow-400 text-black font-bold px-4 py-1">
                      {getRoleDisplayName(profile.role, profile.staffRole)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-gray-300 text-lg">Display health and content overview</p>
                  {hierarchy?.companyName && (
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                      <Building2 className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-semibold">{hierarchy.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
                  onClick={() => router.push('/user/displays')}
                >
                  <PlusCircle className="h-5 w-5" />
                  Add Display
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold transition-all duration-300"
                  onClick={() => router.push('/user/media')}
                >
                  <Upload className="h-5 w-5" />
                  Upload Media
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        {(profile || hierarchy) && (
          <Card className="border-gray-200 shadow-lg" data-aos="fade-up">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
                User Information
              </CardTitle>
              <CardDescription className="text-base">Your account and organization details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Email</p>
                  <p className="text-lg font-bold text-gray-900">{profile?.email || 'Loading...'}</p>
                </div>
                {hierarchy?.clientAdmin && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Client Administrator</p>
                    <p className="text-lg font-bold text-gray-900">{hierarchy.clientAdmin.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{hierarchy.clientAdmin.email}</p>
                  </div>
                )}
                {hierarchy?.companyName && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Company</p>
                    <p className="text-lg font-bold text-gray-900">{hierarchy.companyName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="My Displays"
            value={summary?.displays.total ?? '—'}
            subtitle={healthSubtitle}
            icon={<Monitor className="h-8 w-8" />}
            gradient="from-yellow-400 to-orange-500"
          />
          <StatCard
            title="Media Files"
            value={summary?.mediaCount ?? '—'}
            icon={<Activity className="h-8 w-8" />}
            gradient="from-blue-400 to-blue-600"
          />
          <StatCard
            title="Playlists"
            value={summary?.playlistCount ?? '—'}
            icon={<ListMusic className="h-8 w-8" />}
            gradient="from-purple-400 to-purple-600"
          />
        </div>

        {/* Storage and Health */}
        <div className="grid gap-6 md:grid-cols-2" data-aos="fade-up" data-aos-delay="200">
          <StatCard
            title="Storage Used"
            value={summary ? formatBytes(summary.storageBytes) : '—'}
            subtitle="Approximate usage based on uploaded file sizes"
            icon={<HardDrive className="h-8 w-8" />}
            gradient="from-green-400 to-green-600"
          />

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Display Health
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Online Status</span>
                  <span className="text-2xl font-black text-green-600">
                    {summary && summary.displays.total > 0
                      ? `${Math.round((summary.displays.online / summary.displays.total) * 100)}%`
                      : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: summary && summary.displays.total > 0
                        ? `${(summary.displays.online / summary.displays.total) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <span className="font-bold text-green-600">{summary?.displays.online ?? 0}</span> online
                  </span>
                  <span className="text-gray-500">
                    <span className="font-bold text-red-600">{summary?.displays.offline ?? 0}</span> offline
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
