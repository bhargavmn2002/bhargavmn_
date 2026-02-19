'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Building2, UserCog, Shield } from 'lucide-react';
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      setProfile(response.data.user);
      setHierarchy(response.data.hierarchy);
    } catch (error: any) {
      setError('Failed to load profile information');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setUpdating(true);
      await api.put('/users/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccess('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'CLIENT_ADMIN': return 'bg-blue-100 text-blue-800';
      case 'USER_ADMIN': return 'bg-green-100 text-green-800';
      case 'STAFF': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="ml-3 text-gray-600">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and password</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your account details and role information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <div className="mt-1">
                  <Badge className={getRoleBadgeColor(profile?.role || '')}>
                    {getRoleDisplayName(profile?.role || '', profile?.staffRole)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                <div className="mt-1">
                  <Badge variant={profile?.isActive ? "default" : "destructive"}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                <p className="text-sm text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Hierarchy
              </CardTitle>
              <CardDescription>
                Your position within the organization structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hierarchy?.companyName && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Company</Label>
                  <p className="text-sm font-medium text-gray-900">{hierarchy.companyName}</p>
                </div>
              )}

              {hierarchy?.clientAdmin && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Client Administrator</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{hierarchy.clientAdmin.name}</p>
                      <p className="text-xs text-gray-500">{hierarchy.clientAdmin.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {hierarchy?.userAdmin && profile?.role === 'STAFF' && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">User Administrator</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCog className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{hierarchy.userAdmin.email}</p>
                      <p className="text-xs text-gray-500">Your direct supervisor</p>
                    </div>
                  </div>
                </div>
              )}

              {!hierarchy?.clientAdmin && !hierarchy?.userAdmin && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No hierarchy information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    disabled={updating}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    disabled={updating}
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  {success}
                </div>
              )}

              <Button type="submit" disabled={updating} className="signomart-primary hover:signomart-primary">
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}