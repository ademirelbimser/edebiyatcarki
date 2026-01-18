import { prisma } from '@/lib/prisma'
import LiteraryWheel from '@/components/LiteraryWheel'
import { auth, signOut } from '@/auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Home } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ bucketId: string }>
}

export default async function BucketPage({ params }: PageProps) {
    const { bucketId } = await params
    const session = await auth()

    const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
            cards: {
                include: {
                    ratings: true
                },
                orderBy: { id: 'asc' }
            }
        }
    })

    if (!bucket) {
        notFound()
    }

    const cardsWithStats = bucket.cards.map(card => {
        const total = card.ratings.reduce((acc, r) => acc + r.value, 0)
        const avg = card.ratings.length > 0 ? total / card.ratings.length : 0
        return {
            ...card,
            averageRating: avg,
            ratingCount: card.ratings.length
        }
    })

    return (
        <main className="w-full min-h-screen relative bg-[#020617] font-sans">
            {/* Navigation Header */}
            <div className="absolute top-5 left-5 z-[100]">
                <Link href="/" className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-white/70 hover:text-white transition-all shadow-2xl hover:bg-white/10 group">
                    <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Anasayfa</span>
                </Link>
            </div>

            {/* User Status Header */}
            <div className="absolute top-5 right-5 z-[100] flex items-center gap-4 bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
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

            <div className="flex justify-center items-center min-h-screen">
                <LiteraryWheel
                    initialCards={cardsWithStats}
                    bucketTitle={bucket.name}
                    bucketId={bucketId}
                    isAuthenticated={!!session}
                />
            </div>
        </main>
    )
}
