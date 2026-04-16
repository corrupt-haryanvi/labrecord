'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Plus, Search, User, Calendar, Phone, Mail, FileText, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'patients'), where('doctorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      pts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPatients(pts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients', auth);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Patients</h1>
          <p className="text-text-muted text-sm mt-1">Manage your patient records</p>
        </div>
        <Link 
          href="/patients/new" 
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sage-primary to-sage-dark text-white rounded-xl hover:shadow-lg hover:shadow-sage-primary/25 font-semibold text-sm transition-all duration-200 btn-press"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name or phone..."
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Age / Gender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Added</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-bg-subtle rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient, index) => (
                  <tr 
                    key={patient.id} 
                    className="row-hover"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-light to-sage-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-sage-primary" />
                        </div>
                        <span className="font-semibold text-text-main">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted">{patient.age} yrs, {patient.gender}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {patient.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Phone className="w-3.5 h-3.5" />
                            {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Mail className="w-3.5 h-3.5" />
                            {patient.email}
                          </div>
                        )}
                        {!patient.phone && !patient.email && (
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(patient.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/patients/${patient.id}/edit`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <Link 
                          href={`/reports/new?patientId=${patient.id}`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sage-primary hover:bg-sage-light rounded-lg transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Report
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
                        <User className="w-8 h-8 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-text-main">No patients found</p>
                        <p className="text-sm text-text-muted mt-1">
                          {searchTerm ? 'Try a different search term' : 'Add your first patient to get started'}
                        </p>
                      </div>
                      {!searchTerm && (
                        <Link 
                          href="/patients/new" 
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-sage-primary text-white rounded-lg font-medium text-sm hover:bg-sage-dark transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Patient
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
