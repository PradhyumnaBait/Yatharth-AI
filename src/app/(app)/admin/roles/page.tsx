'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRolesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/users?tab=roles');
  }, [router]);
  return <div className="p-4 text-caption text-sb-text-subtle">Redirecting to Roles Matrix...</div>;
}
