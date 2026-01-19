"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, turnstileToken }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Kayıt sırasında bir hata oluştu")
            } else {
                router.push("/auth/login?registered=true")
            }
        } catch (err) {
            setError("Bağlantı hatası oluştu")
        } finally {
            setLoading(false)
        }
    }

    if (!isMounted) return null

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110 motion-safe:animate-[pulse_10s_infinite]"
                style={{ backgroundImage: "url('/auth-bg.png')" }}
            />
            <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/40 via-indigo-950/60 to-black/80 backdrop-blur-[2px]" />

            {/* Navigation Header */}
            <div className="absolute top-8 left-8 z-[100]">
                <Link href="/" className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-white/70 hover:text-white transition-all shadow-2xl hover:bg-white/10 group">
                    <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Anasayfa</span>
                </Link>
            </div>

            {/* Content Container */}
            <div className={`relative z-10 w-full max-w-md transition-all duration-1000 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/30 blur-[80px] rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/30 blur-[80px] rounded-full" />

                    <div className="relative z-10 text-center mb-8">
                        <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
                            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-indigo-200 tracking-tight">
                            Yeni Hesap
                        </h1>
                        <p className="text-white/50 text-sm mt-2 font-medium uppercase tracking-[0.2em]">Koleksiyona Katılın</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {error && (
                            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-2 ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Ad Soyad</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30 group-focus-within:text-purple-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                    placeholder="Adınız Soyadınız"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-2 ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Email Adresi</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30 group-focus-within:text-purple-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-2 ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Şifre</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30 group-focus-within:text-purple-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-center my-4">
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACNL8b6TcMdSxc_H"}
                                onSuccess={(token) => setTurnstileToken(token)}
                                options={{ theme: "dark" }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full overflow-hidden group/btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(124,58,237,0.3)] disabled:opacity-50 mt-4 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Kaydediliyor...
                                    </>
                                ) : "Kayıt Ol"}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    </form>

                    <p className="text-center text-white/40 mt-10 text-sm font-medium">
                        Zaten üyeyim?{" "}
                        <Link href="/auth/login" className="text-purple-300 hover:text-white transition-colors underline underline-offset-4 decoration-purple-500/50">
                            Giriş Yapın
                        </Link>
                    </p>
                </div>

                {/* Footer text */}
                <div className="mt-8 text-center">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold">
                        © 2026 Edebiyat Çarkı — Tüm Hakları Saklıdır
                    </p>
                </div>
            </div>
        </div>
    )
}

