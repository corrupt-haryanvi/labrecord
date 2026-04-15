'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-warm py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-border-color">
        <div className="text-center">
          <div className="font-serif text-3xl font-bold text-sage-primary flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-accent-warm rounded-full"></div>
            Clinique Lab
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-text-main">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-sage-primary focus:border-sage-primary sm:text-sm bg-bg-warm font-semibold text-text-main"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-sage-primary focus:border-sage-primary sm:text-sm bg-bg-warm font-semibold text-text-main"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sage-primary hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center mt-4 text-sm text-text-muted">
            Contact your administrator to create an account.
          </div>
        </form>
      </div>
    </div>
  );
}