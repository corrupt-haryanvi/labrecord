'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { LAB_TEMPLATES } from '@/lib/templates';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    doctorStampBase64: ''
  });
  const [testCharges, setTestCharges] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            clinicName: data.clinicName || '',
            doctorStampBase64: data.doctorStampBase64 || ''
          });
          setTestCharges(data.testCharges || {});
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, auth);
      } finally {
        setFetching(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, doctorStampBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChargeChange = (templateId: string, value: string) => {
    const numValue = parseFloat(value);
    setTestCharges(prev => ({
      ...prev,
      [templateId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        clinicName: formData.clinicName,
        doctorStampBase64: formData.doctorStampBase64,
        testCharges: testCharges
      });
      alert('Settings updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, auth);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <AppLayout><div className="p-8">Loading profile...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Doctor Profile & Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-color h-fit">
          <h2 className="text-xl font-bold text-text-main mb-6">Profile Information</h2>
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Doctor Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. John Doe"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Clinic / Hospital Name</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-bg-warm font-semibold text-text-main"
                value={formData.clinicName}
                onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Doctor Stamp / Signature</label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 h-24 w-48 border-2 border-dashed border-border-color rounded-lg flex items-center justify-center overflow-hidden bg-bg-warm">
                  {formData.doctorStampBase64 ? (
                    <img src={formData.doctorStampBase64} alt="Stamp" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-text-muted text-sm font-medium">No stamp uploaded</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sage-light file:text-sage-dark hover:file:bg-[#c8d4c8] cursor-pointer"
                  />
                  <p className="mt-2 text-xs text-text-muted">PNG or JPG. Max 1MB.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-color h-fit">
          <h2 className="text-xl font-bold text-text-main mb-6">Test Charges Configuration</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {LAB_TEMPLATES.map(template => (
              <div key={template.id} className="flex items-center justify-between p-4 bg-bg-warm rounded-lg border border-border-color">
                <div className="font-semibold text-text-main">{template.name}</div>
                <div className="flex items-center">
                  <span className="text-text-muted mr-2">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-24 px-3 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-sage-primary focus:border-sage-primary bg-white font-semibold text-text-main text-right"
                    value={testCharges[template.id] || ''}
                    onChange={(e) => handleChargeChange(template.id, e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          form="settings-form"
          disabled={loading}
          className="flex items-center px-8 py-3 bg-sage-primary text-white rounded-lg hover:bg-sage-dark font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </AppLayout>
  );
}