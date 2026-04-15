'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { useRouter, useParams } from 'next/navigation';
import { LAB_TEMPLATES, LabTemplate } from '@/lib/templates';
import Link from 'next/link';

export default function EditReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [reportData, setReportData] = useState<any>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  
  const [reportDetails, setReportDetails] = useState({
    visitLabNo: '',
    referLabHosp: '',
    refClient: '',
    barcodeNo: '',
    sampleCollectionDate: '',
    sampleReceivedDate: ''
  });

  useEffect(() => {
    if (!user || !reportId) return;
    
    const fetchReport = async () => {
      try {
        const reportDocRef = doc(db, 'reports', reportId);
        const reportDocSnap = await getDoc(reportDocRef);
        
        if (reportDocSnap.exists()) {
          const data = reportDocSnap.data();
          if (data.doctorId !== user.uid) {
            router.push('/reports');
            return;
          }
          setReportData(data);
          setResults(data.results || {});
          setReportDetails({
            visitLabNo: data.visitLabNo || '',
            referLabHosp: data.referLabHosp || '',
            refClient: data.refClient || '',
            barcodeNo: data.barcodeNo || '',
            sampleCollectionDate: data.sampleCollectionDate ? new Date(data.sampleCollectionDate).toISOString().slice(0, 16) : '',
            sampleReceivedDate: data.sampleReceivedDate ? new Date(data.sampleReceivedDate).toISOString().slice(0, 16) : ''
          });
        } else {
          router.push('/reports');
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setFetching(false);
      }
    };
    
    fetchReport();
  }, [user, reportId, router]);

  const selectedTemplate = LAB_TEMPLATES.find(t => t.id === reportData?.templateId);

  const handleResultChange = (fieldName: string, value: string) => {
    setResults(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportData) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        results,
        visitLabNo: reportDetails.visitLabNo,
        referLabHosp: reportDetails.referLabHosp,
        refClient: reportDetails.refClient,
        barcodeNo: reportDetails.barcodeNo,
        sampleCollectionDate: reportDetails.sampleCollectionDate ? new Date(reportDetails.sampleCollectionDate).toISOString() : null,
        sampleReceivedDate: reportDetails.sampleReceivedDate ? new Date(reportDetails.sampleReceivedDate).toISOString() : null
      });
      
      router.push(`/reports/${reportId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`, auth);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <AppLayout><div className="p-8">Loading report details...</div></AppLayout>;
  }

  if (!reportData || !selectedTemplate) {
    return <AppLayout><div className="p-8">Report not found or invalid template.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Edit Report</h1>
        <Link href={`/reports/${reportId}`} className="text-text-muted hover:text-sage-primary font-semibold text-sm transition-colors">
          Cancel
        </Link>
      </div>

      <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-border-color">
        <div className="mb-6 pb-6 border-b border-border-color">
          <h2 className="text-lg font-bold text-text-main mb-2">Patient: {reportData.patientName}</h2>
          <p className="text-text-muted text-sm">Test: {reportData.templateName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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

          <div className="pt-2">
            <h3 className="text-lg font-semibold text-text-main mb-4">Update Results for {selectedTemplate.name}</h3>
            
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
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-border-color">
            <Link href={`/reports/${reportId}`} className="px-5 py-2.5 border border-border-color rounded-lg text-text-main font-semibold text-sm hover:bg-bg-warm transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2.5 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Report'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
