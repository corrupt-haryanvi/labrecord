'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Users, FileText, Settings, LogOut, Activity, Plus } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-warm text-sage-primary">Loading...</div>;

  if (!user) {
    router.push('/');
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Patients', href: '/patients' },
    { name: 'Reports', href: '/reports' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-warm text-text-main font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-border-color flex items-center justify-between px-8 shrink-0">
        <div className="font-serif text-2xl font-bold text-sage-primary flex items-center gap-2">
          <div className="w-3 h-3 bg-accent-warm rounded-full"></div>
          LabManager
        </div>
        <nav className="flex gap-6 h-full items-end">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors pb-[20px] ${
                  isActive
                    ? 'text-sage-primary border-b-2 border-sage-primary'
                    : 'text-text-muted hover:text-sage-primary'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-6">
          <div className="text-sm font-semibold text-text-main">{user.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-text-muted hover:text-sage-primary transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-[280px_1fr] overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-white border-r border-border-color p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="text-xs uppercase tracking-[0.1em] text-text-muted mb-2">Quick Actions</div>
          <div className="flex flex-col gap-3">
            <Link href="/patients/new" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-sage-light text-sage-dark hover:bg-[#c8d4c8] transition-colors border-none cursor-pointer">
              <Plus className="w-4 h-4" /> Add Patient
            </Link>
            <Link href="/reports/new" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-sage-primary text-white hover:bg-sage-dark transition-colors border-none cursor-pointer">
              <FileText className="w-4 h-4" /> Create Report
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <section className="p-8 overflow-y-auto flex flex-col gap-6">
          {children}
        </section>
      </main>
    </div>
  );
}
