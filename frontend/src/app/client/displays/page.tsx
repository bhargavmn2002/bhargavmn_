/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DisplayStatus = 'ONLINE' | 'OFFLINE' | 'PAIRING' | 'ERROR';

interface Display {
  id: string;
  name: string | null;
  location: string | null;
  status: DisplayStatus;
  pairingCode: string | null;
  managedByUser?: {
    email: string;
  } | null;
}

function getStatusColor(status: DisplayStatus) {
  if (status === 'ONLINE') return 'bg-green-500';
  if (status === 'OFFLINE') return 'bg-red-500';
  if (status === 'PAIRING') return 'bg-yellow-500';
  return 'bg-gray-400';
}

function getStatusText(status: DisplayStatus) {
  if (status === 'ONLINE') return 'Online';
  if (status === 'OFFLINE') return 'Offline';
  if (status === 'PAIRING') return 'Pairing';
  return 'Error';
}

export default function ClientDisplaysPage() {
  const { user } = useAuth();
  const [displays, setDisplays] = useState<Display[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const isClientAdmin = user?.role === 'CLIENT_ADMIN';

  useEffect(() => {
    if (!isClientAdmin) return;
    
    // Initial fetch
    fetchDisplays(false);
    
    // Set up polling every 10 seconds for status updates
    const interval = setInterval(() => {
      fetchDisplays(true); // Pass true to indicate this is a refresh
    }, 10000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isClientAdmin]);

  async function fetchDisplays(isRefresh = false) {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');
      const res = await api.get('/displays');
      // Backend returns { displays: [...] }
      setDisplays(res.data?.displays || res.data || []);
    } catch (e: any) {
      console.error('Failed to fetch displays:', e);
      if (!isRefresh) {
        setError('Failed to load displays. Please try again.');
        setDisplays([]);
      }
    } finally {
      if (!isRefresh) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }

  if (!isClientAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">You do not have access to this page.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Tenant Displays</h1>
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                <span>Updating status...</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-600">
            Read-only view of all displays across your User Admins.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading displays…</div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned User</TableHead>
                  <TableHead>Pairing Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displays.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${getStatusColor(d.status)}`}
                        />
                        <span className="text-sm text-gray-700">{getStatusText(d.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {d.name || 'Unnamed Display'}
                    </TableCell>
                    <TableCell>{d.location || '—'}</TableCell>
                    <TableCell>{d.managedByUser?.email || '—'}</TableCell>
                    <TableCell>
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                        {d.pairingCode || 'N/A'}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
                {displays.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      No displays found for this tenant.
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

