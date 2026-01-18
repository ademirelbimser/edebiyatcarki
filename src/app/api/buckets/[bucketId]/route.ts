import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ bucketId: string }> }
) {
    try {
        const { bucketId } = await params
        const bucket = await prisma.bucket.findUnique({
            where: { id: bucketId },
            include: { cards: { orderBy: { id: 'asc' } } }
        })

        if (!bucket) {
            return NextResponse.json({ error: "Koleksiyon bulunamadı" }, { status: 404 })
        }

        return NextResponse.json(bucket)
    } catch (error) {
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ bucketId: string }> }
) {
    const session = await auth()
    const { bucketId } = await params

    if (!session || !session.user?.id || !session.user.isActive) {
        return NextResponse.json({ error: "Yetkisiz erişim veya pasif hesap" }, { status: 401 })
    }

    try {
        const { name, cards } = await req.json()

        const bucket = await prisma.bucket.findUnique({
            where: { id: bucketId },
            select: { createdBy: true }
        })

        if (!bucket) {
            return NextResponse.json({ error: "Koleksiyon bulunamadı" }, { status: 404 })
        }

        if (bucket.createdBy !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Bu koleksiyonu düzenleme yetkiniz yok" }, { status: 403 })
        }

        // Update in transaction: Update name and all cards
        await prisma.$transaction(async (tx) => {
            await tx.bucket.update({
                where: { id: bucketId },
                data: { name }
            })

            // Update each card
            for (const card of cards) {
                await tx.card.update({
                    where: {
                        bucketId_id: {
                            bucketId: bucketId,
                            id: card.id
                        }
                    },
                    data: {
                        title: card.title,
                        type: card.type,
                        author: card.author,
                        content: card.content
                    }
                })
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update error:", error)
        return NextResponse.json({ error: "Güncelleme sırasında bir hata oluştu" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ bucketId: string }> }
) {
    const session = await auth()
    const { bucketId } = await params

    if (!session || !session.user?.id || !session.user.isActive) {
        return NextResponse.json({ error: "Yetkisiz erişim veya pasif hesap" }, { status: 401 })
    }

    try {
        const bucket = await prisma.bucket.findUnique({
            where: { id: bucketId },
            select: { createdBy: true }
        })

        if (!bucket) {
            return NextResponse.json({ error: "Koleksiyon bulunamadı" }, { status: 404 })
        }

        if (bucket.createdBy !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Bu koleksiyonu silme yetkiniz yok" }, { status: 403 })
        }

        await prisma.bucket.delete({
            where: { id: bucketId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Silme sırasında bir hata oluştu" }, { status: 500 })
    }
}
