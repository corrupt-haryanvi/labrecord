'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, reports: 0 });

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        const patientsQuery = query(collection(db, 'patients'), where('doctorId', '==', user.uid));
        const patientsSnapshot = await getDocs(patientsQuery);
        
        const reportsQuery = query(collection(db, 'reports'), where('doctorId', '==', user.uid));
        const reportsSnapshot = await getDocs(reportsQuery);
        
        setStats({
          patients: patientsSnapshot.size,
          reports: reportsSnapshot.size
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-color flex items-center space-x-4">
          <div className="p-3 bg-sage-light text-sage-dark rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Patients</p>
            <p className="text-3xl font-bold text-text-main mt-1">{stats.patients}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-color flex items-center space-x-4">
          <div className="p-3 bg-[#F0EEE9] text-text-muted rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Reports</p>
            <p className="text-3xl font-bold text-text-main mt-1">{stats.reports}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/patients/new" className="block p-6 bg-white rounded-2xl shadow-sm border border-border-color hover:border-sage-primary transition-colors">
          <h3 className="text-lg font-semibold text-text-main mb-2">Add New Patient</h3>
          <p className="text-text-muted text-sm">Register a new patient to the system to start generating lab reports.</p>
        </Link>
        <Link href="/reports/new" className="block p-6 bg-white rounded-2xl shadow-sm border border-border-color hover:border-sage-primary transition-colors">
          <h3 className="text-lg font-semibold text-text-main mb-2">Create Lab Report</h3>
          <p className="text-text-muted text-sm">Generate a new lab report for an existing patient using predefined templates.</p>
        </Link>
      </div>
    </AppLayout>
  );
}