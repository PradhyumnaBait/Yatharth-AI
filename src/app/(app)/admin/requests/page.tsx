'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRequestsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/users?tab=requests');
  }, [router]);
  return <div className="p-4 text-caption text-sb-text-subtle">Redirecting to Access Requests...</div>;
}
