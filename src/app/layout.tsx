import type { Metadata, Viewport } from 'next';
import { inter, jetbrainsMono } from '@/design/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'SchedBridge AI — Heavy EPC Project Controls',
  description: 'Turn field progress into schedule intelligence.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-sb-bg text-sb-ink min-h-screen">
        {children}
      </body>
    </html>
  );
}
