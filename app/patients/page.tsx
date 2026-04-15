'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'patients'), where('doctorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client side since we don't have a composite index for doctorId + createdAt
      pts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPatients(pts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients', auth);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-text-muted" />
        </div>
        <Link href="/patients/new" className="flex items-center px-5 py-2.5 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-color overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Name</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Age/Gender</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Contact</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Added On</th>
              <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-bg-warm transition-colors">
                <td className="p-4 text-sm border-b border-[#F0EEE9]">
                  <div className="font-semibold text-text-main">{patient.name}</div>
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted">
                  {patient.age} yrs, {patient.gender}
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted">
                  <div>{patient.phone || '-'}</div>
                  <div>{patient.email || '-'}</div>
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted">
                  {format(new Date(patient.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="p-4 text-sm border-b border-[#F0EEE9] text-right space-x-4">
                  <Link href={`/patients/${patient.id}/edit`} className="text-accent-warm hover:text-[#c4855d] font-semibold">
                    Edit
                  </Link>
                  <Link href={`/reports/new?patientId=${patient.id}`} className="text-sage-primary hover:text-sage-dark font-semibold">
                    Create Report
                  </Link>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted border-b border-[#F0EEE9]">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}