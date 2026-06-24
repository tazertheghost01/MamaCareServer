// app/admin/page.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminRootRedirect() {
  const router = useRouter();
  useEffect(() => {
    // If no token, go to login, otherwise to dashboard
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [router]);
  return null; // No UI needed
}
