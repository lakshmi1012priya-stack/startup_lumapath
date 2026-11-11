import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LumaPath — Digital Moi Express',
  description: 'Cloud-native digital wedding gift management and real-time ledger platform. Modernizing South Indian Moi gifting traditions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white antialiased">{children}</body>
    </html>
  );
}
