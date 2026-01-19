import NextAuth, { type DefaultSession } from "next-auth"
import { Role } from "./generated/client"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
            isActive: boolean
        } & DefaultSession["user"]
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user || !user.password) return null

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isValid) return null

                return user
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id as string
                token.role = (user as any).role as Role
                token.isActive = (user as any).isActive as boolean
            }

            // If we have a sub/id but no role, fetch it from DB (deals with missing values in session)
            if (token.sub && !token.role) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { role: true, isActive: true }
                })
                if (dbUser) {
                    token.role = dbUser.role as Role
                    token.isActive = dbUser.isActive
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = (token.sub || token.id) as string
                session.user.role = token.role as Role
                session.user.isActive = token.isActive as boolean
            }
            return session
        },
    },
})
