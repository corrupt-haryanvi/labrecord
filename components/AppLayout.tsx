'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Users, FileText, Settings, LogOut, LayoutDashboard, Plus, ChevronRight, Activity } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-warm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-sage-light border-t-sage-primary animate-spin" />
          <span className="text-text-muted font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-warm text-text-main font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-border-color flex items-center justify-between px-8 shrink-0 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-sage-primary to-sage-dark rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-text-main tracking-tight">
            Lab<span className="text-sage-primary">Manager</span>
          </span>
        </div>
        
        <nav className="flex items-center gap-1 h-full">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-sage-primary bg-sage-light/50'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-subtle'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sage-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-light to-sage-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-sage-dark">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-text-main max-w-[150px] truncate">
              {user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 btn-press"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-[260px_1fr] overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-white border-r border-border-color p-5 flex flex-col gap-6 overflow-y-auto scrollbar-thin">
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3 px-1">
              Quick Actions
            </div>
            <div className="flex flex-col gap-2">
              <Link 
                href="/patients/new" 
                className="group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm bg-bg-subtle text-text-main hover:bg-sage-light hover:text-sage-dark transition-all duration-200 btn-press"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                  <Plus className="w-4 h-4 text-sage-primary" />
                </div>
                <span>Add Patient</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link 
                href="/reports/new" 
                className="group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-sage-primary to-sage-dark text-white hover:shadow-lg hover:shadow-sage-primary/25 transition-all duration-200 btn-press"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span>Create Report</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          </div>
          
          {/* Recent Activity Placeholder */}
          <div className="mt-auto pt-4 border-t border-border-color">
            <div className="text-xs text-text-muted px-1">
              Logged in as
            </div>
            <div className="text-sm font-medium text-text-main mt-1 px-1 truncate">
              {user.email}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin animate-fade-in">
          {children}
        </section>
      </main>
    </div>
  );
}
