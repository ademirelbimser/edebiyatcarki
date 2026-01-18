"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

interface Bucket {
    id: string
    name: string
    createdBy: string
    _count: {
        cards: number
    }
}

interface BucketListProps {
    buckets: Bucket[]
    currentUserId?: string
    userRole?: string
}

export default function BucketList({ buckets, currentUserId, userRole }: BucketListProps) {
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm("Bu koleksiyonu silmek istediğinize emin misiniz?")) return

        try {
            const res = await fetch(`/api/buckets/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Silme işlemi başarısız")
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/buckets/edit/${id}`)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {buckets.map((bucket) => (
                <Link
                    key={bucket.id}
                    href={`/page/${bucket.id}`}
                    className="group block relative p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent hover:from-purple-500/40 hover:to-indigo-500/40 transition-all duration-500 shadow-2xl active:scale-[0.98]"
                >
                    <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-[2.3rem] p-8 h-full border border-white/5 group-hover:bg-[#0f172a]/40 transition-colors flex flex-col">
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full group-hover:text-white/80 transition-colors">
                                    {bucket._count.cards} Eser
                                </span>

                                {(currentUserId === bucket.createdBy || userRole === "ADMIN") && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleEdit(e, bucket.id)}
                                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all"
                                            title="Düzenle"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, bucket.id)}
                                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
                                            title="Sil"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">{bucket.name}</h3>
                        <p className="text-white/40 text-sm font-medium line-clamp-2 mb-6 flex-grow">Bu koleksiyonun içindeki şiirleri ve edebi metinleri keşfedin.</p>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-indigo-400 group-hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                                Keşfetmeye Başla
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </Link>
            ))}

            {buckets.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <div className="inline-block p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                        <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white/60">Henüz bir koleksiyon bulunmuyor</h3>
                </div>
            )}
        </div>
    )
}
