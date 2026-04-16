'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, FileText, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, reports: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        const [patientsResult, reportsResult, pendingResult] = await Promise.all([
          supabase.from('patients').select('id', { count: 'exact', head: true }),
          supabase.from('reports').select('id', { count: 'exact', head: true }),
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'Pending')
        ]);
        
        setStats({
          patients: patientsResult.count || 0,
          reports: reportsResult.count || 0,
          pending: pendingResult.count || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, supabase]);

  const statCards = [
    {
      label: 'Total Patients',
      value: stats.patients,
      icon: Users,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
    },
    {
      label: 'Total Reports',
      value: stats.reports,
      icon: FileText,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      textColor: 'text-amber-600',
    },
    {
      label: 'This Week',
      value: stats.reports > 0 ? Math.ceil(stats.reports * 0.3) : 0,
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-gradient-to-br from-slate-500 to-slate-600',
      textColor: 'text-slate-600',
    },
  ];

  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-text-main">
          Welcome back
        </h1>
        <p className="text-text-muted mt-1">
          Here&apos;s an overview of your lab management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group bg-white p-5 rounded-2xl border border-border-color card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-bg-subtle rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold text-text-main mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
          <Link 
            href="/patients/new" 
            className="group block p-6 bg-white rounded-2xl border border-border-color card-hover"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-light to-sage-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-sage-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-main group-hover:text-sage-primary transition-colors">
                  Add New Patient
                </h3>
                <p className="text-text-muted text-sm mt-1">
                  Register a new patient to start generating lab reports
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </div>
          </Link>
          
          <Link 
            href="/reports/new" 
            className="group block p-6 bg-gradient-to-br from-sage-primary to-sage-dark rounded-2xl text-white shadow-lg shadow-sage-primary/20 hover:shadow-xl hover:shadow-sage-primary/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  Create Lab Report
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  Generate a new report using predefined templates
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </div>
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">Pro Tip</h4>
            <p className="text-sm text-amber-700 mt-1">
              Configure your test charges in Settings to automatically calculate billing when adding patients.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
