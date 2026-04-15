'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { LAB_TEMPLATES } from '@/lib/templates';
import { Download, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportViewPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  
  const [report, setReport] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const docRef = doc(db, 'reports', reportId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const reportData = docSnap.data();
          setReport({ id: docSnap.id, ...reportData });
          
          // Fetch patient details
          const patientRef = doc(db, 'patients', reportData.patientId);
          const patientSnap = await getDoc(patientRef);
          if (patientSnap.exists()) {
            setPatient(patientSnap.data());
          }
        } else {
          setError('Report not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleDownloadPDF = () => {
    if (!report || !patient) return;
    
    const doc = new jsPDF();
    const template = LAB_TEMPLATES.find(t => t.id === report.templateId);
    if (!template) return;

    // Header
    doc.setFontSize(20);
    doc.text(report.clinicName || 'Lab Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('PATIENT DETAILS', 14, 40);
    doc.setFontSize(10);
    doc.text(`Name: ${patient.name}`, 14, 48);
    doc.text(`Age/Gender: ${patient.age} / ${patient.gender}`, 14, 54);
    doc.text(`Date: ${format(new Date(report.date), 'MMM d, yyyy')}`, 140, 48);
    doc.text(`Report ID: ${report.id.substring(0, 8)}`, 140, 54);
    
    doc.line(14, 60, 196, 60);
    
    doc.setFontSize(14);
    doc.text(report.templateName, 105, 70, { align: 'center' });

    // Table
    const tableData = template.fields.map(field => [
      field.name,
      report.results[field.name] || '-',
      field.unit,
      field.normalRange
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Test Name', 'Result', 'Unit', 'Normal Range']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer / Stamp
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    if (report.doctorStampBase64) {
      try {
        doc.addImage(report.doctorStampBase64, 'PNG', 140, finalY + 20, 40, 20);
      } catch (e) {
        console.error("Error adding stamp image to PDF", e);
      }
    }
    
    doc.setFontSize(10);
    doc.text('Authorized Signature', 150, finalY + 45);
    
    doc.save(`${patient.name}_${report.templateName}.pdf`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading report...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!report || !patient) return null;

  const template = LAB_TEMPLATES.find(t => t.id === report.templateId);
  const reportUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div>
            {user ? (
              <Link href="/reports" className="flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Link>
            ) : (
              <span className="text-gray-500 font-medium">Lab Report Viewer</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Report Paper */}
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow-md border border-gray-200 print:shadow-none print:border-none">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider">
              {report.clinicName || 'Laboratory Report'}
            </h1>
          </div>

          {/* Patient Details & QR */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-1 mb-3">Patient Details</h3>
              <p><span className="text-gray-500 w-24 inline-block">Name:</span> <span className="font-medium">{patient.name}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Age/Gender:</span> <span className="font-medium">{patient.age} / {patient.gender}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Date:</span> <span className="font-medium">{format(new Date(report.date), 'MMM d, yyyy')}</span></p>
              <p><span className="text-gray-500 w-24 inline-block">Report ID:</span> <span className="font-medium text-sm">{report.id}</span></p>
            </div>
            <div className="text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
              <QRCodeSVG value={reportUrl} size={100} />
              <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6 bg-gray-50 py-2 rounded">
              {report.templateName}
            </h2>
            
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {template?.fields.map((field, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">{report.results[field.name] || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.normalRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Stamp */}
          <div className="flex justify-end mt-16 pt-8 border-t border-gray-200">
            <div className="text-center w-48">
              {report.doctorStampBase64 ? (
                <img src={report.doctorStampBase64} alt="Doctor Stamp" className="h-20 mx-auto mb-2 object-contain" />
              ) : (
                <div className="h-20 mb-2"></div>
              )}
              <div className="border-t border-gray-400 pt-2">
                <p className="text-sm font-medium text-gray-900">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}