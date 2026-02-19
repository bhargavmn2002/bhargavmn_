'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hide sidebar and topbar on player page
  const isPlayerPage = pathname?.startsWith('/player');

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPlayerPage) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router, isPlayerPage]);

  // Player page should be full-screen, no layout
  if (isPlayerPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden signomart-bg">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
