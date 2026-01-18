import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await auth()

    if (!session || !session.user?.id || !session.user.isActive) {
        return NextResponse.json({ error: "Yetkisiz erişim veya pasif hesap" }, { status: 401 })
    }

    if (session.user.role === "PUBLIC") {
        return NextResponse.json({ error: "Koleksiyon oluşturma yetkiniz yok" }, { status: 403 })
    }

    try {
        const { name, cards } = await req.json()

        if (!name || !Array.isArray(cards) || cards.length < 6 || cards.length > 24) {
            return NextResponse.json({ error: "Geçersiz veriler. En az 6, en fazla 24 eser gereklidir." }, { status: 400 })
        }

        // Create the bucket and cards in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const bucket = await tx.bucket.create({
                data: {
                    name,
                    createdBy: session.user!.id!,
                }
            })

            const createdCards = await Promise.all(
                cards.map((card, index) =>
                    tx.card.create({
                        data: {
                            id: index + 1,
                            bucketId: bucket.id,
                            title: card.title,
                            type: card.type,
                            author: card.author,
                            content: card.content
                        }
                    })
                )
            )

            return { bucket, cardsCount: createdCards.length }
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Bucket creation error:", error)
        return NextResponse.json({ error: "Koleksiyon oluşturulurken bir hata oluştu" }, { status: 500 })
    }
}
