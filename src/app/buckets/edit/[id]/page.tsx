"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"

interface CardInput {
    id: number
    title: string
    type: string
    author: string
    content: string
}

interface BucketData {
    id: string
    name: string
    cards: CardInput[]
}

export default function EditBucketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [name, setName] = useState("")
    const [cards, setCards] = useState<CardInput[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        fetchBucket()
    }, [id])

    const fetchBucket = async () => {
        try {
            const res = await fetch(`/api/buckets/${id}`)
            if (!res.ok) throw new Error("Koleksiyon yüklenemedi")
            const data: BucketData = await res.json()
            setName(data.name)
            setCards(data.cards)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const updateCard = (index: number, field: keyof CardInput, value: string) => {
        const newCards = [...cards]
        newCards[index] = { ...newCards[index], [field]: value }
        setCards(newCards)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")

        try {
            const res = await fetch(`/api/buckets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, cards })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Güncelleme başarısız")

            router.push(`/page/${id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (!isMounted || loading) {
        return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white/20">Yükleniyor...</div>
    }

    return (
        <main className="w-full min-h-screen relative overflow-y-auto bg-[#020617] font-sans pb-20">
            {/* Background with Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex gap-4">
                        <Link href="/" className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10">
                            <Home className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Anasayfa</span>
                        </Link>
                        <button onClick={() => router.back()} className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10">
                            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Vazgeç
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Demet Düzenle</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Bucket Name (Count is locked) */}
                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="group">
                                <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-3 ml-1">Demet Adı</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Demet Adı"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white/30 text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                                <span>Eser Sayısı (Sabit)</span>
                                <span className="text-indigo-400 text-lg">{cards.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cards Inputs */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs ring-1 ring-indigo-500/30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Eserleri Güncelle</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {cards.map((card, idx) => (
                                <div key={idx} className="group bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-white/20 font-black text-2xl">#{(idx + 1).toString().padStart(2, '0')}</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Başlık</label>
                                            <input
                                                type="text"
                                                value={card.title}
                                                onChange={(e) => updateCard(idx, "title", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Tür</label>
                                            <input
                                                type="text"
                                                value={card.type}
                                                onChange={(e) => updateCard(idx, "type", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Yazar</label>
                                            <input
                                                type="text"
                                                value={card.author}
                                                onChange={(e) => updateCard(idx, "author", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Eser İçeriği</label>
                                        <textarea
                                            value={card.content}
                                            onChange={(e) => updateCard(idx, "content", e.target.value)}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm py-4 px-6 rounded-2xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="relative w-full overflow-hidden group/btn bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-6 rounded-[2.3rem] transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] disabled:opacity-50 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 text-xl">
                                {saving ? "Değişiklikler Kaydediliyor..." : "Demet Değişikliklerini Kaydet"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
