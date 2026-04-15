'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LAB_TEMPLATES } from '@/lib/templates';

export default function NewPatientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testCharges, setTestCharges] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    referredByDr: '',
    clientAddress: ''
  });
  
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchCharges = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTestCharges(docSnap.data().testCharges || {});
        }
      } catch (error) {
        console.error("Error fetching test charges:", error);
      }
    };
    fetchCharges();
  }, [user]);

  const handleTestToggle = (templateId: string) => {
    setSelectedTests(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const totalBill = selectedTests.reduce((sum, testId) => sum + (testCharges[testId] || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'patients'), {
        doctorId: user.uid,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        referredByDr: formData.referredByDr,
        clientAddress: formData.clientAddress,
        createdAt: new Date().toISOString(),
        assignedTests: selectedTests,
        totalBill: totalBill
      });
      router.push('/patients');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'patients', auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Add New Patient</h1>
        <Link href="/patients" className="text-text-muted hover:text-sage-primary font-semibold text-sm transition-colors">
          Cancel
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-border-color h-fit">
          <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Full Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Age *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="150"
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Gender *</label>
                <select
                  required
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Referred By Dr.</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                  value={formData.referredByDr}
                  onChange={(e) => setFormData({...formData, referredByDr: e.target.value})}
                  placeholder="e.g. SELF"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Client Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-color h-fit">
          <h2 className="text-xl font-bold text-text-main mb-6">Assign Tests & Billing</h2>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 mb-6">
            {LAB_TEMPLATES.map(template => {
              const charge = testCharges[template.id] || 0;
              return (
                <label key={template.id} className="flex items-center justify-between p-3 bg-bg-warm rounded-lg border border-border-color cursor-pointer hover:bg-[#F0EEE9] transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-sage-primary border-border-color rounded focus:ring-sage-primary"
                      checked={selectedTests.includes(template.id)}
                      onChange={() => handleTestToggle(template.id)}
                    />
                    <span className="ml-3 font-semibold text-text-main text-sm">{template.name}</span>
                  </div>
                  <span className="text-text-muted text-sm">₹{charge.toFixed(2)}</span>
                </label>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border-color">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-text-main">Total Bill</span>
              <span className="text-2xl font-bold text-sage-primary">₹{totalBill.toFixed(2)}</span>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/patients" className="px-5 py-2.5 border border-border-color rounded-lg text-text-main font-semibold text-sm hover:bg-bg-warm transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                form="patient-form"
                disabled={loading}
                className="flex items-center px-6 py-2.5 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Patient'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}