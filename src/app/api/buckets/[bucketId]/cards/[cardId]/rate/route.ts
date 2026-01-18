import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ bucketId: string, cardId: string }> }
) {
    const session = await auth()

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Oy vermek için giriş yapmalısınız" }, { status: 401 })
    }

    const { bucketId, cardId } = await params
    const { value } = await req.json()
    const userId = session.user.id

    if (typeof value !== "number" || value < 1 || value > 5) {
        return NextResponse.json({ error: "Geçersiz puan" }, { status: 400 })
    }

    try {
        const intCardId = parseInt(cardId)

        // Use upsert to ensure only one rating per user per card
        await prisma.rating.upsert({
            where: {
                bucketId_cardId_userId: {
                    bucketId,
                    cardId: intCardId,
                    userId
                }
            },
            update: { value },
            create: {
                bucketId,
                cardId: intCardId,
                value,
                userId
            }
        })

        // Fetch new average
        const stats = await prisma.rating.aggregate({
            where: { bucketId, cardId: intCardId },
            _avg: { value: true },
            _count: { value: true }
        })

        return NextResponse.json({
            success: true,
            average: stats._avg.value || 0,
            count: stats._count.value
        })
    } catch (error) {
        console.error("Rating error:", error)
        return NextResponse.json({ error: "Puan verilirken bir hata oluştu" }, { status: 500 })
    }
}
