"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, UserCog } from "lucide-react"

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    isActive: boolean
    createdAt: string
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
            router.push("/")
        } else if (status === "authenticated") {
            fetchUsers()
        }
    }, [status, session])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            if (res.ok) setUsers(data)
        } catch (err) {
            setMessage("Kullanıcılar yüklenemedi")
        } finally {
            setLoading(false)
        }
    }

    const updateUser = async (userId: string, data: any) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, ...data })
            })
            if (res.ok) {
                fetchUsers()
                setMessage("Kullanıcı güncellendi")
            }
        } catch (err) {
            setMessage("Güncelleme hatası")
        }
    }

    const resetPassword = async (userId: string) => {
        const newPassword = prompt("Yeni şifreyi girin:")
        if (!newPassword) return
        updateUser(userId, { password: newPassword })
    }

    const deleteUser = async (userId: string) => {
        if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return
        try {
            const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            })
            if (res.ok) {
                fetchUsers()
                setMessage("Kullanıcı silindi")
            }
        } catch (err) {
            setMessage("Silme hatası")
        }
    }

    if (loading) return <div className="p-8 text-white">Yükleniyor...</div>

    return (
        <div className="min-h-screen bg-[#020617] p-8 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            <UserCog className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-400 tracking-tight">
                            Kullanıcı Yönetimi
                        </h1>
                    </div>
                    <Link
                        href="/"
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white group"
                    >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Anasayfa
                    </Link>
                </div>

                {message && (
                    <div className="mb-4 p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/50 text-indigo-200 text-sm">
                        {message}
                    </div>
                )}

                <div className="overflow-x-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Kullanıcı</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">E-posta</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Durum</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{user.name || "İsimsiz"}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUser(user.id, { role: e.target.value })}
                                            className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="PUBLIC">Public</option>
                                            <option value="TEACHER">Öğretmen</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${user.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                        >
                                            {user.isActive ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => resetPassword(user.id)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            Şifre Sıfırla
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
