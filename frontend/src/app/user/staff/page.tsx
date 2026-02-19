/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Key, CheckSquare, Square } from 'lucide-react';

type StaffUser = {
  id: string;
  email: string;
  role: string;
  staffRole?: string;
  isActive: boolean;
  createdAt: string;
};

const STAFF_ROLE_LABEL: Record<string, string> = {
  DISPLAY_MANAGER: 'Display Manager',
  BROADCAST_MANAGER: 'Broadcast Manager',
  CONTENT_MANAGER: 'Content Manager',
  CMS_VIEWER: 'CMS Viewer',
  POP_MANAGER: 'POP Manager',
};

export default function UserStaffPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    staffRole: 'CONTENT_MANAGER',
  });

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState('');
  const [deleteUserEmail, setDeleteUserEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Password Reset State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetUserEmail, setResetUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const isUserAdmin = user?.role === 'USER_ADMIN';

  useEffect(() => {
    if (!user) return;
    if (!isUserAdmin) {
      router.replace('/login');
      return;
    }
    fetchStaff();
  }, [user, isUserAdmin]);

  async function fetchStaff() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users');
      if (res.data.role === 'USER_ADMIN') {
        setStaff(res.data.users ?? []);
      } else {
        setStaff([]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }

  async function createStaff() {
    try {
      setSaving(true);
      setError('');

      if (!form.email || !form.password || !form.staffRole) {
        setError('Email, Password, and Role are required.');
        return;
      }

      await api.post('/users', {
        email: form.email,
        password: form.password,
        staffRole: form.staffRole,
      });

      setOpen(false);
      setForm({
        email: '',
        password: '',
        staffRole: 'CONTENT_MANAGER',
      });
      await fetchStaff();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create staff user');
    } finally {
      setSaving(false);
    }
  }

  const openDeleteDialog = (userId: string, userEmail: string) => {
    setDeleteUserId(userId);
    setDeleteUserEmail(userEmail);
    setDeleteDialogOpen(true);
  };

  async function deleteStaff() {
    if (!deleteUserId) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${deleteUserId}`);
      setDeleteDialogOpen(false);
      setDeleteUserId('');
      setDeleteUserEmail('');
      setSelectedUsers(new Set());
      await fetchStaff();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete staff user');
    } finally {
      setDeleting(false);
    }
  }

  // Bulk delete functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(staff.map(s => s.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    try {
      setBulkDeleting(true);
      // Use POST for bulk delete since DELETE doesn't support body in some configurations
      await api.post('/users/bulk-delete', {
        userIds: Array.from(selectedUsers)
      });
      setBulkDeleteDialogOpen(false);
      const deletedCount = selectedUsers.size;
      setSelectedUsers(new Set());
      await fetchStaff();
      alert(`${deletedCount} staff user(s) deleted successfully`);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete staff users');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      setResetting(true);
      await api.put(`/users/${resetUserId}/reset-password`, {
        newPassword: newPassword
      });
      
      setResetDialogOpen(false);
      setResetUserId('');
      setResetUserEmail('');
      setNewPassword('');
      alert('Password reset successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const openResetDialog = (userId: string, userEmail: string) => {
    setResetUserId(userId);
    setResetUserEmail(userEmail);
    setNewPassword('');
    setResetDialogOpen(true);
  };

  if (!isUserAdmin) {
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Users</h1>
            <p className="mt-2 text-gray-600">
              Manage staff accounts for content and display operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedUsers.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedUsers.size})
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 signomart-primary hover:signomart-primary">
                <Plus className="h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] bg-white">
              <DialogHeader>
                <DialogTitle>Create Staff User</DialogTitle>
                <DialogDescription>
                  Create a staff user with a specific operational role.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@example.com"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <select
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.staffRole}
                      onChange={(e) => setForm({ ...form, staffRole: e.target.value })}
                    >
                      <option value="CONTENT_MANAGER">Content Manager</option>
                      <option value="DISPLAY_MANAGER">Display Manager</option>
                      <option value="BROADCAST_MANAGER">Broadcast Manager</option>
                      <option value="CMS_VIEWER">CMS Viewer</option>
                      <option value="POP_MANAGER">POP Manager</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={createStaff} disabled={saving} className="signomart-primary hover:signomart-primary">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Create Staff'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* PASSWORD RESET MODAL */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset the password for this staff user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input 
                  value={resetUserEmail}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  required 
                  type="password" 
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={6}
                  disabled={resetting}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setResetDialogOpen(false)}
                  disabled={resetting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={resetting} className="flex-1">
                  {resetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRMATION MODAL */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Delete Staff User</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this staff user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input 
                  value={deleteUserEmail}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="destructive" 
                  onClick={deleteStaff}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* BULK DELETE CONFIRMATION MODAL */}
        <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Delete Selected Staff Users</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete {selectedUsers.size} staff user(s)? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-40 overflow-y-auto space-y-1">
                {Array.from(selectedUsers).map(userId => {
                  const user = staff.find(s => s.id === userId);
                  return user ? (
                    <div key={userId} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                      {user.email}
                    </div>
                  ) : null;
                })}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setBulkDeleteDialogOpen(false)}
                  disabled={bulkDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1"
                >
                  {bulkDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    `Delete ${selectedUsers.size} User(s)`
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="ml-3 text-gray-600">Loading staff…</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <button
                      onClick={() => handleSelectAll(selectedUsers.size !== staff.length)}
                      className="flex items-center justify-center"
                      title={selectedUsers.size === staff.length ? 'Deselect All' : 'Select All'}
                    >
                      {selectedUsers.size === staff.length && staff.length > 0 ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <button
                        onClick={() => handleSelectUser(s.id, !selectedUsers.has(s.id))}
                        className="flex items-center justify-center"
                      >
                        {selectedUsers.has(s.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {s.staffRole ? STAFF_ROLE_LABEL[s.staffRole] || s.staffRole : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openResetDialog(s.id, s.email)}
                          title="Reset Password"
                          className="hover:bg-blue-50"
                        >
                          <Key className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(s.id, s.email)}
                          title="Delete User"
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No staff users found. Click "Add Staff" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

