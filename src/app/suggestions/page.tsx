'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuggestionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/suggestions/new');
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
    </main>
  );
}
