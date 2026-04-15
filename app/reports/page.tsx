'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'reports'), where('doctorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reps.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReports(reps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports', auth);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredReports = reports.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-text-muted" />
        </div>
        <Link href="/reports/new" className="flex items-center px-5 py-2.5 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-color overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Patient</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Test Type</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Date</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-bg-warm transition-colors">
                <td className="p-4 text-sm border-b border-[#F0EEE9]">
                  <div className="font-semibold text-text-main">{report.patientName}</div>
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9]">
                  <div className="text-text-muted flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-text-muted" />
                    {report.templateName}
                  </div>
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted">
                  {format(new Date(report.date), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9] text-right space-x-4">
                  <Link href={`/reports/${report.id}/edit`} className="text-accent-warm hover:text-[#c4855d] font-semibold">
                    Edit
                  </Link>
                  <Link href={`/reports/${report.id}`} className="text-sage-primary hover:text-sage-dark font-semibold">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted border-b border-[#F0EEE9]">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}