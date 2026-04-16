'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { ArrowLeft, User, Phone, Mail, MapPin, Check, X } from 'lucide-react';

export default function NewPatientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('patients').insert({
        user_id: user.id,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null
      });

      if (error) throw error;
      
      showToast('Patient created successfully!', 'success');
      router.push('/patients');
    } catch (error) {
      console.error('Error creating patient:', error);
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

      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-color animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-muted mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Patient address"
                      className="w-full pl-11 pr-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
              <Link 
                href="/patients" 
                className="flex items-center gap-2 px-5 py-3 border border-border-color rounded-xl text-text-main font-medium text-sm hover:bg-bg-subtle transition-colors btn-press"
              >
                <X className="w-4 h-4" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage-primary to-sage-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-sage-primary/25 transition-all disabled:opacity-50 btn-press"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Patient
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
