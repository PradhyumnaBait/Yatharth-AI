'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    } else {
      router.replace('/welcome');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sb-bg text-sb-ink">
      <div className="font-mono text-mono-s text-sb-ink-3 animate-pulse">
        Initializing SchedBridge AI...
      </div>
    </div>
  );
}
