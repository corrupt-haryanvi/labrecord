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
import { useToast } from '@/components/Toast';
import { ArrowLeft, User, Phone, Mail, MapPin, Stethoscope, Check, X } from 'lucide-react';

export default function NewPatientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
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
      showToast('Patient created successfully!', 'success');
      router.push('/patients');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'patients', auth);
      showToast('Failed to create patient. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/patients" 
          className="w-10 h-10 rounded-xl bg-bg-subtle hover:bg-border-color flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Add New Patient</h1>
          <p className="text-text-muted text-sm mt-0.5">Fill in the patient details below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-border-color animate-fade-in">
          <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-sage-primary" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-muted mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient name"
                    className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="150"
                    placeholder="Age"
                    className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Gender *</label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="pt-4 border-t border-border-color">
              <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-sage-primary" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className="w-full pl-11 pr-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-11 pr-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="pt-4 border-t border-border-color">
              <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sage-primary" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Referred By Dr.</label>
                  <input
                    type="text"
                    placeholder="e.g. SELF"
                    className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                    value={formData.referredByDr}
                    onChange={(e) => setFormData({...formData, referredByDr: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Client Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full pl-11 pr-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar - Tests & Billing */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-color h-fit animate-slide-in sticky top-24">
          <h2 className="text-lg font-semibold text-text-main mb-4">Assign Tests & Billing</h2>
          
          <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin pr-1 mb-4">
            {LAB_TEMPLATES.map(template => {
              const charge = testCharges[template.id] || 0;
              const isSelected = selectedTests.includes(template.id);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTestToggle(template.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                    ${isSelected 
                      ? 'bg-sage-light/50 border-sage-primary text-sage-dark' 
                      : 'bg-bg-warm/50 border-border-color text-text-main hover:border-sage-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-sage-primary border-sage-primary' : 'border-border-color'}
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-sage-primary' : 'text-text-muted'}`}>
                    ₹{charge.toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border-color">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-text-main">Total Bill</span>
              <span className="text-2xl font-bold text-sage-primary">₹{totalBill.toFixed(0)}</span>
            </div>

            <div className="flex gap-3">
              <Link 
                href="/patients" 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border-color rounded-xl text-text-main font-medium text-sm hover:bg-bg-subtle transition-colors btn-press"
              >
                <X className="w-4 h-4" />
                Cancel
              </Link>
              <button
                type="submit"
                form="patient-form"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sage-primary to-sage-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-sage-primary/25 transition-all disabled:opacity-50 btn-press"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
