import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        })
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: "Kullanıcılar yüklenemedi" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    try {
        const { userId, role, isActive, password } = await req.json()

        const data: any = {}
        if (role) data.role = role
        if (typeof isActive === "boolean") data.isActive = isActive
        if (password) {
            data.password = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data
        })

        return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
        return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    try {
        const { userId } = await req.json()

        if (userId === session.user.id) {
            return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz" }, { status: 400 })
        }

        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Silme başarısız" }, { status: 500 })
    }
}
