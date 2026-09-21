import type { Metadata, Viewport } from 'next';
import { inter, jetbrainsMono } from '@/design/fonts';
import './globals.css';

import { PwaProvider } from '@/components/shell/PwaProvider';

export const metadata: Metadata = {
  title: 'SchedBridge AI — Heavy EPC Project Controls',
  description: 'Turn field progress into schedule intelligence.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#1E293B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-sb-bg text-sb-ink min-h-screen">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
