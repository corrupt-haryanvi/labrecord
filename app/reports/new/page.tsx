'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { LAB_TEMPLATES } from '@/lib/templates';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { ArrowLeft, User, FileText, Calendar, Check, X } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export default function NewReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const { showToast } = useToast();
  const supabase = createClient();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, phone, email')
        .order('name');
      
      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        setPatients(data || []);
      }
    };
    
    fetchPatients();
  }, [user, supabase]);

  const selectedTemplate = LAB_TEMPLATES.find(t => t.id === selectedTemplateId);

  const handleResultChange = (fieldName: string, value: string) => {
    setResults(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPatientId || !selectedTemplate) return;
    
    setLoading(true);
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      
      const { data, error } = await supabase.from('reports').insert({
        user_id: user.id,
        patient_id: selectedPatientId,
        patient_name: patient?.name || 'Unknown',
        test_name: selectedTemplate.name,
        test_date: testDate,
        results: selectedTemplate.fields.map(field => ({
          name: field.name,
          value: results[field.name] || '',
          unit: field.unit,
          normalRange: field.normalRange
        })),
        notes: notes || null,
        status: 'Completed'
      }).select().single();

      if (error) throw error;
      
      showToast('Report created successfully!', 'success');
      router.push(`/reports/${data.id}`);
    } catch (error) {
      console.error('Error creating report:', error);
      showToast('Failed to create report. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/reports" 
          className="w-10 h-10 rounded-xl bg-bg-subtle hover:bg-border-color flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Create New Report</h1>
          <p className="text-text-muted text-sm mt-0.5">Generate a lab report for a patient</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-color animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Template Selection */}
          <div>
            <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-sage-primary" />
              Patient & Test Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Select Patient *</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone || p.email || 'No contact'})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Select Test Template *</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setResults({});
                  }}
                >
                  <option value="">-- Select Template --</option>
                  {LAB_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Test Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="date"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Table */}
          {selectedTemplate && (
            <div className="pt-4 border-t border-border-color animate-fade-in">
              <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sage-primary" />
                Enter Results for {selectedTemplate.name}
              </h3>
              
              <div className="rounded-xl border border-border-color overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-subtle">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Parameter</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Result</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Normal Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {selectedTemplate.fields.map((field, idx) => (
                      <tr key={idx} className="row-hover">
                        <td className="px-4 py-3 text-sm font-semibold text-text-main">{field.name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all"
                            value={results[field.name] || ''}
                            onChange={(e) => handleResultChange(field.name, e.target.value)}
                            placeholder="Enter result"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">{field.unit}</td>
                        <td className="px-4 py-3 text-sm text-text-muted italic">{field.normalRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-muted mb-2">Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-3 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary bg-bg-warm/50 font-medium text-text-main transition-all resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
            <Link 
              href="/reports" 
              className="flex items-center gap-2 px-5 py-3 border border-border-color rounded-xl text-text-main font-medium text-sm hover:bg-bg-subtle transition-colors btn-press"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedTemplateId || !selectedPatientId}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage-primary to-sage-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-sage-primary/25 transition-all disabled:opacity-50 btn-press"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
