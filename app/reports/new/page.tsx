'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { useRouter, useSearchParams } from 'next/navigation';
import { LAB_TEMPLATES, LabTemplate } from '@/lib/templates';
import Link from 'next/link';

export default function NewReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  
  const [reportDetails, setReportDetails] = useState({
    visitLabNo: '',
    referLabHosp: 'SELF',
    refClient: '',
    barcodeNo: '',
    sampleCollectionDate: new Date().toISOString().slice(0, 16),
    sampleReceivedDate: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (!user) return;
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, 'patients'), where('doctorId', '==', user.uid));
        const snapshot = await getDocs(q);
        const pts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(pts);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'patients', auth);
      }
    };
    fetchPatients();
  }, [user]);

  const selectedTemplate = LAB_TEMPLATES.find(t => t.id === selectedTemplateId);

  const handleResultChange = (fieldName: string, value: string) => {
    setResults(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPatientId || !selectedTemplate) return;
    
    setLoading(true);
    try {
      // Get doctor profile for stamp and clinic name
      const doctorDoc = await getDoc(doc(db, 'users', user.uid));
      const doctorData = doctorDoc.data() || {};
      
      const patient = patients.find(p => p.id === selectedPatientId);
      
      const reportRef = await addDoc(collection(db, 'reports'), {
        doctorId: user.uid,
        patientId: selectedPatientId,
        patientName: patient?.name || 'Unknown',
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        results,
        date: new Date().toISOString(),
        doctorStampBase64: doctorData.doctorStampBase64 || '',
        clinicName: doctorData.clinicName || 'Lab Clinic',
        visitLabNo: reportDetails.visitLabNo,
        referLabHosp: reportDetails.referLabHosp,
        refClient: reportDetails.refClient,
        barcodeNo: reportDetails.barcodeNo,
        sampleCollectionDate: new Date(reportDetails.sampleCollectionDate).toISOString(),
        sampleReceivedDate: new Date(reportDetails.sampleReceivedDate).toISOString(),
        registrationDate: patient?.createdAt || new Date().toISOString()
      });
      
      router.push(`/reports/${reportRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports', auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Create New Report</h1>
        <Link href="/reports" className="text-text-muted hover:text-sage-primary font-semibold text-sm transition-colors">
          Cancel
        </Link>
      </div>

      <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-border-color">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Select Patient *</label>
              <select
                required
                className="block w-full px-3 py-2.5 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
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
                className="block w-full px-3 py-2.5 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  setResults({}); // Reset results when template changes
                }}
              >
                <option value="">-- Select Template --</option>
                {LAB_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border-color">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Visit/Lab No</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={reportDetails.visitLabNo}
                onChange={(e) => setReportDetails({...reportDetails, visitLabNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Barcode No</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={reportDetails.barcodeNo}
                onChange={(e) => setReportDetails({...reportDetails, barcodeNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Refer Lab/Hosp</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={reportDetails.referLabHosp}
                onChange={(e) => setReportDetails({...reportDetails, referLabHosp: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Ref. Client</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={reportDetails.refClient}
                onChange={(e) => setReportDetails({...reportDetails, refClient: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Sample Collection Date/Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={reportDetails.sampleCollectionDate}
                onChange={(e) => setReportDetails({...reportDetails, sampleCollectionDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Sample Received Date/Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={reportDetails.sampleReceivedDate}
                onChange={(e) => setReportDetails({...reportDetails, sampleReceivedDate: e.target.value})}
              />
            </div>
          </div>
          
          {selectedTemplate && (
            <div className="pt-6 border-t border-border-color">
              <h3 className="text-lg font-semibold text-text-main mb-4">Enter Results for {selectedTemplate.name}</h3>
              
              <div className="bg-white rounded-2xl border border-border-color overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Parameter</th>
                      <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Result</th>
                      <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Unit</th>
                      <th className="bg-[#F0EEE9] p-4 text-xs font-medium text-text-muted uppercase border-b border-border-color">Normal Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTemplate.fields.map((field, idx) => (
                      <tr key={idx} className="hover:bg-bg-warm transition-colors">
                        <td className="p-4 text-sm border-b border-[#F0EEE9] font-semibold text-text-main">{field.name}</td>
                        <td className="p-4 text-sm border-b border-[#F0EEE9]">
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                            value={results[field.name] || ''}
                            onChange={(e) => handleResultChange(field.name, e.target.value)}
                            placeholder="Result"
                          />
                        </td>
                        <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted">{field.unit}</td>
                        <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted italic">{field.normalRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-border-color">
            <Link href="/reports" className="px-5 py-2.5 border border-border-color rounded-lg text-text-main font-semibold text-sm hover:bg-bg-warm transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedTemplateId || !selectedPatientId}
              className="flex items-center px-6 py-2.5 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}