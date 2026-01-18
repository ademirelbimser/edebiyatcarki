import { prisma } from '@/lib/prisma'
import { auth, signOut } from '@/auth'
import Link from 'next/link'
import BucketList from '@/components/BucketList'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()
  const buckets = await prisma.bucket.findMany({
    include: {
      _count: {
        select: { cards: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-[#020617] font-sans">
      {/* Background with Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* User Status Header */}
      <div className="absolute top-8 right-8 z-[100] flex items-center gap-4 bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
        {session ? (
          <>
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs ring-1 ring-indigo-500/30">
                  {session.user?.name?.[0] || session.user?.email?.[0]}
                </div>
              )}
              <span className="text-white/80 text-sm font-medium">{session.user?.name || session.user?.email}</span>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/users" className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-400/30 px-2 py-1 rounded-lg bg-indigo-400/10">
                  Panel
                </Link>
              )}
            </div>
            <form action={async () => {
              'use server'
              await signOut()
            }}>
              <button className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs px-4 py-1.5 rounded-full font-bold transition-all border border-rose-500/20">
                Çıkış Yap
              </button>
            </form>
          </>
        ) : (
          <Link href="/auth/login" className="text-white text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-2 rounded-full transition-all shadow-lg shadow-purple-500/20">
            Giriş Yap
          </Link>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-400 mb-6 tracking-tight">
            Edebiyat Çarkı
          </h1>
          <p className="text-indigo-200/50 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Şiirlerin ve edebiyatın büyülü dünyasına hoş geldiniz. <br className="hidden md:block" /> Bir koleksiyon seçin ve çarkı çevirmeye hazırlanın.
          </p>

          {session && session.user.role !== "PUBLIC" && (
            <div className="mt-10">
              <Link
                href="/buckets/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Yeni Edebiyat Demeti Oluştur
              </Link>
            </div>
          )}
        </div>

        <BucketList
          buckets={buckets}
          currentUserId={session?.user?.id || undefined}
          userRole={session?.user?.role}
        />
      </div>

      <footer className="relative z-10 text-center pb-10">
        <p className="text-white/10 text-[10px] uppercase tracking-[0.4em] font-bold">
          © 2026 Edebiyat Çarkı — Tüm Hakları Saklıdır
        </p>
      </footer>
    </main>
  )
}
