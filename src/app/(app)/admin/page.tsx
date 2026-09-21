'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/home?role=admin');
  }, [router]);
  return <div className="p-4 text-caption text-sb-text-subtle">Redirecting to Admin Home...</div>;
}
