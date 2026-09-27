import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'FinFlow - Cloud Accounting & Business Management Platform',
  description: 'Production-grade double-entry cloud accounting engine for Indian SMBs, distributors, retailers and manufacturers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
