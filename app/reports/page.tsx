'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Search, FileText, Calendar, Eye, Edit3, User } from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  patient_name: string;
  test_name: string;
  test_date: string;
  status: string;
  created_at: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('test_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('reports_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const filteredReports = reports.filter(r => 
    r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Reports</h1>
          <p className="text-text-muted text-sm mt-1">View and manage lab reports</p>
        </div>
        <Link 
          href="/reports/new" 
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sage-primary to-sage-dark text-white rounded-xl hover:shadow-lg hover:shadow-sage-primary/25 font-semibold text-sm transition-all duration-200 btn-press"
        >
          <Plus className="w-4 h-4" />
          Create Report
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search by patient or test type..."
          className="w-full pl-12 pr-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-white font-medium text-text-main placeholder:text-text-muted/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-color overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle border-b border-border-color">
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Test Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr 
                    key={report.id} 
                    className="row-hover"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/50 flex items-center justify-center">
                          <User className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="font-semibold text-text-main">{report.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center">
                          <FileText className="w-4 h-4 text-sage-primary" />
                        </div>
                        <span className="text-text-muted font-medium">{report.test_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(report.test_date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                        ${report.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                          report.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}
                      `}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/reports/${report.id}/edit`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <Link 
                          href={`/reports/${report.id}`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sage-primary hover:bg-sage-light rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-bg-subtle flex items-center justify-center">
                        <FileText className="w-8 h-8 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-text-main">No reports found</p>
                        <p className="text-sm text-text-muted mt-1">
                          {searchTerm ? 'Try a different search term' : 'Create your first lab report'}
                        </p>
                      </div>
                      {!searchTerm && (
                        <Link 
                          href="/reports/new" 
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-sage-primary text-white rounded-lg font-medium text-sm hover:bg-sage-dark transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create Report
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
