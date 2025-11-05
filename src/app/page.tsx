'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LiteratureWheel from '@/components/LiteratureWheel';

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const bucketId = searchParams.get('bucket');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-cyan-300 text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 relative">
      {/* Auth buttons in top right */}
      <div className="absolute top-4 right-4 flex gap-2">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Merhaba, {session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Çıkış
            </button>
          </div>
        ) : (
          <>
            <Link href="/login">
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors">
                Giriş
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                Kayıt
              </button>
            </Link>
          </>
        )}
      </div>

      <div className="w-full max-w-6xl bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <h1 className="text-3xl font-bold text-cyan-300 mb-6 text-center pt-6">Edebiyat Çarkı</h1>

        <LiteratureWheel bucketId={bucketId} />
      </div>
    </div>
  );
}
