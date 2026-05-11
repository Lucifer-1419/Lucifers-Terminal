import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kali Mock Terminal',
  description: 'Mobile optimized mock terminal interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
