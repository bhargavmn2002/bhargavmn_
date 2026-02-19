'use client';

import { useEffect, useState } from 'react';
import { Building2, User, UserCog } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

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

export default function StaffDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyInfo | null>(null);

  useEffect(() => {
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
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            {profile && (
              <Badge variant="outline">
                {getRoleDisplayName(profile.role, profile.staffRole)}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4">
            <p className="text-gray-600">Your workspace</p>
            {hierarchy?.companyName && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>{hierarchy.companyName}</span>
              </div>
            )}
          </div>
        </div>

        {/* User Information Card */}
        {(profile || hierarchy) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Staff Information
              </CardTitle>
              <CardDescription>Your account and organization hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{profile?.email || 'Loading...'}</p>
                </div>
                {hierarchy?.userAdmin && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">User Administrator</p>
                    <div className="flex items-center gap-2 mt-1">
                      <UserCog className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-900">{hierarchy.userAdmin.email}</p>
                        <p className="text-xs text-gray-500">Your direct supervisor</p>
                      </div>
                    </div>
                  </div>
                )}
                {hierarchy?.clientAdmin && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client Administrator</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-900">{hierarchy.clientAdmin.name}</p>
                        <p className="text-xs text-gray-500">{hierarchy.clientAdmin.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">Welcome to your dashboard. Use the sidebar to navigate to your assigned areas.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
