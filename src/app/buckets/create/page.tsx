"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"

interface CardInput {
    title: string
    type: string
    author: string
    content: string
}

export default function CreateBucketPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [cardCount, setCardCount] = useState(6)
    const [cards, setCards] = useState<CardInput[]>(
        Array(6).fill({ title: "", type: "Şiir", author: "", content: "" })
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleCardCountChange = (count: number) => {
        setCardCount(count)
        const newCards = [...cards]
        if (count > cards.length) {
            for (let i = cards.length; i < count; i++) {
                newCards.push({ title: "", type: "Şiir", author: "", content: "" })
            }
        } else {
            newCards.splice(count)
        }
        setCards(newCards)
    }

    const updateCard = (index: number, field: keyof CardInput, value: string) => {
        const newCards = [...cards]
        newCards[index] = { ...newCards[index], [field]: value }
        setCards(newCards)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/buckets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, cards })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Bir hata oluştu")
            }

            router.push(`/page/${data.bucket.id}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isMounted) return null

    return (
        <main className="w-full min-h-screen relative overflow-y-auto bg-[#020617] font-sans pb-20">
            {/* Background with Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.03]"
                    style={{ backgroundImage: "url('/auth-bg.png')" }}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16">
                <div className="flex items-center justify-between mb-12">
                    <Link href="/" className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10">
                        <Home className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Anasayfa</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Yeni Edebiyat Demeti</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Bucket Name & Count */}
                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="group">
                                <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-3 ml-1">Demet Adı</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Örn: Garip Akımı Şiirleri"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-3 ml-1">Eser Sayısı ({cardCount})</label>
                                <input
                                    type="range"
                                    min="6"
                                    max="24"
                                    value={cardCount}
                                    onChange={(e) => handleCardCountChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-4"
                                />
                                <div className="flex justify-between text-[10px] text-white/30 mt-2 font-bold px-1">
                                    <span>6</span>
                                    <span>12</span>
                                    <span>18</span>
                                    <span>24</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cards Inputs */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-xs ring-1 ring-purple-500/30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Eser Detayları</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {cards.map((card, idx) => (
                                <div key={idx} className="group bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden">
                                    {/* Inner subtle glow */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
                                                placeholder="Eser Adı"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Tür</label>
                                            <input
                                                type="text"
                                                value={card.type}
                                                onChange={(e) => updateCard(idx, "type", e.target.value)}
                                                placeholder="Örn: Şiir, Deneme"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Yazar</label>
                                            <input
                                                type="text"
                                                value={card.author}
                                                onChange={(e) => updateCard(idx, "author", e.target.value)}
                                                placeholder="Şair / Yazar"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Eser İçeriği</label>
                                        <textarea
                                            value={card.content}
                                            onChange={(e) => updateCard(idx, "content", e.target.value)}
                                            placeholder="Eserin metni buraya..."
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-white/10 transition-all resize-none"
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

                    <div className="pt-10 pb-20">
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full overflow-hidden group/btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-6 rounded-[2.3rem] transition-all shadow-[0_20px_50px_rgba(124,58,237,0.3)] disabled:opacity-50 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 text-xl">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Demet Hazırlanıyor...
                                    </>
                                ) : (
                                    <>
                                        Demet Oluştur ve Çarkı Hazırla
                                        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
