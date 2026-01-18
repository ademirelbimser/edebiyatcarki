import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { name, email, password, turnstileToken } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email ve şifre gereklidir" },
                { status: 400 }
            )
        }

        // Verify Turnstile Token
        if (!turnstileToken) {
            return NextResponse.json(
                { message: "Güvenlik doğrulaması gereklidir" },
                { status: 400 }
            )
        }

        const verifyRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA",
                    response: turnstileToken,
                }),
            }
        )

        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
            return NextResponse.json(
                { message: "Güvenlik doğrulaması başarısız oldu" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json(
            { message: "User created successfully", userId: user.id },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}
