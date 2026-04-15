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
    
    doc.setFontSize(10);
    
    // Left column
    doc.text(`Patient NAME: ${patient.name}`, 14, 40);
    doc.text(`Age/Gender: ${patient.age} Y / ${patient.gender.charAt(0)}`, 14, 46);
    doc.text(`Refer Lab/Hosp: ${report.referLabHosp || 'SELF'}`, 14, 52);
    doc.text(`Referred BY Dr.: ${patient.referredByDr || 'SELF'}`, 14, 58);
    doc.text(`Ref.Client: ${report.refClient || '-'}`, 14, 64);
    doc.text(`Barcode NO: ${report.barcodeNo || '-'}`, 14, 70);
    
    // Right column
    doc.text(`Visit/LabNo: ${report.visitLabNo || '-'}`, 110, 40);
    doc.text(`Registration Date: ${report.registrationDate ? format(new Date(report.registrationDate), 'dd/MMM/yyyy hh:mm a') : '-'}`, 110, 46);
    doc.text(`Sample Collection: ${report.sampleCollectionDate ? format(new Date(report.sampleCollectionDate), 'dd/MMM/yyyy hh:mm a') : '-'}`, 110, 52);
    doc.text(`Sample Received: ${report.sampleReceivedDate ? format(new Date(report.sampleReceivedDate), 'dd/MMM/yyyy hh:mm a') : '-'}`, 110, 58);
    doc.text(`Report Generated: ${report.date ? format(new Date(report.date), 'dd/MMM/yyyy hh:mm a') : '-'}`, 110, 64);
    doc.text(`Client Address: ${patient.clientAddress || '-'}`, 110, 70);
    
    doc.line(14, 75, 196, 75);
    
    doc.setFontSize(14);
    doc.text(report.templateName, 105, 85, { align: 'center' });

    // Table
    const tableData = template.fields.map(field => [
      field.name,
      report.results[field.name] || '-',
      field.unit,
      field.normalRange
    ]);

    autoTable(doc, {
      startY: 95,
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
    <div className="min-h-screen bg-bg-warm py-8 px-4 sm:px-6 lg:px-8 font-sans text-text-main">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-border-color">
          <div>
            {user ? (
              <Link href="/reports" className="flex items-center text-text-muted hover:text-sage-primary font-semibold text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Link>
            ) : (
              <span className="text-text-muted font-semibold text-sm">Lab Report Viewer</span>
            )}
          </div>
          <div className="flex space-x-3">
            {user && (
              <Link 
                href={`/reports/${reportId}/edit`}
                className="flex items-center px-5 py-2.5 bg-white border border-border-color text-text-main rounded-lg hover:bg-bg-warm font-semibold text-sm transition-colors"
              >
                Edit
              </Link>
            )}
            <button 
              onClick={() => window.print()}
              className="flex items-center px-5 py-2.5 bg-sage-light text-sage-dark rounded-lg hover:bg-[#c8d4c8] font-semibold text-sm transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center px-5 py-2.5 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Report Paper */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-border-color print:shadow-none print:border-none flex flex-col gap-8">
          {/* Header */}
          <div className="text-center border-b border-border-color pb-6">
            <h1 className="font-serif text-3xl font-bold text-sage-primary uppercase tracking-wider flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-accent-warm rounded-full"></div>
              {report.clinicName || 'Laboratory Report'}
            </h1>
          </div>

          {/* Patient Details & QR */}
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm w-full pr-8">
              <div className="space-y-2">
                <div className="flex"><span className="font-bold text-text-muted w-32">Patient NAME</span><span className="font-semibold">: {patient.name}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-32">Age/Gender</span><span>: {patient.age} Y / {patient.gender.charAt(0)}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-32">Refer Lab/Hosp</span><span>: {report.referLabHosp || 'SELF'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-32">Referred BY Dr.</span><span>: {patient.referredByDr || 'SELF'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-32">Ref.Client</span><span>: {report.refClient || '-'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-32">Barcode NO</span><span className="font-semibold">: {report.barcodeNo || '-'}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex"><span className="font-bold text-text-muted w-36">Visit/LabNo</span><span className="font-semibold">: {report.visitLabNo || '-'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-36">Registration Date</span><span>: {report.registrationDate ? format(new Date(report.registrationDate), 'dd/MMM/yyyy hh:mm a') : '-'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-36">Sample Collection</span><span>: {report.sampleCollectionDate ? format(new Date(report.sampleCollectionDate), 'dd/MMM/yyyy hh:mm a') : '-'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-36">Sample Received</span><span>: {report.sampleReceivedDate ? format(new Date(report.sampleReceivedDate), 'dd/MMM/yyyy hh:mm a') : '-'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-36">Report Generated</span><span>: {report.date ? format(new Date(report.date), 'dd/MMM/yyyy hh:mm a') : '-'}</span></div>
                <div className="flex"><span className="font-bold text-text-muted w-36">Client Address</span><span>: {patient.clientAddress || '-'}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-border-color shrink-0">
              <div className="w-16 h-16 bg-text-main p-1 rounded-sm">
                <QRCodeSVG value={reportUrl} size={56} bgColor="#2D302D" fgColor="#FFFFFF" />
              </div>
              <div className="text-[11px] text-text-muted w-28">
                <strong className="text-text-main">Scan to View</strong><br/>
                Instant secure access to clinical results.
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-text-main">
                {report.templateName}
              </h2>
            </div>
            
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
                  {template?.fields.map((field, idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-sm border-b border-[#F0EEE9] font-semibold text-text-main">{field.name}</td>
                      <td className="p-4 text-sm border-b border-[#F0EEE9] font-bold text-sage-primary">{report.results[field.name] || '-'}</td>
                      <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted">{field.unit}</td>
                      <td className="p-4 text-sm border-b border-[#F0EEE9] text-text-muted italic">{field.normalRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer / Stamp */}
          <div className="flex justify-end mt-8 pt-8 border-t border-border-color">
            <div className="flex flex-col items-center gap-2 opacity-80">
              {report.doctorStampBase64 ? (
                <img src={report.doctorStampBase64} alt="Doctor Stamp" className="h-20 w-20 object-contain rounded-full border-2 border-dashed border-sage-primary p-1" />
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-sage-primary rounded-full flex items-center justify-center text-[10px] text-center text-sage-primary font-bold uppercase">
                  No<br/>Stamp
                </div>
              )}
              <div className="text-[10px] uppercase text-text-muted font-semibold">
                Electronic Signature Applied
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
