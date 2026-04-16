import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  title: 'LabManager - Modern Lab Reports',
  description: 'Professional lab report management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} bg-bg-warm`}>
      <body className="bg-bg-warm text-text-main antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
