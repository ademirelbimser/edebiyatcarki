import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database with current system data...')
    const filePath = path.join(process.cwd(), 'prisma', 'seed_data.json')

    if (!fs.existsSync(filePath)) {
        console.error('Seed data file not found:', filePath)
        return
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Clear existing data to avoid conflicts during full seed
    console.log('Clearing existing records...')
    // Order matters to respect foreign keys
    try { await prisma.rating.deleteMany({}); } catch (e) { }
    try { await prisma.card.deleteMany({}); } catch (e) { }
    try { await prisma.bucket.deleteMany({}); } catch (e) { }
    try { await prisma.user.deleteMany({}); } catch (e) { }

    console.log(`Processing ${data.length} users...`)

    for (const userData of data) {
        const { buckets, ...userFields } = userData

        const hashedPassword = userFields.password ?
            (userFields.password.startsWith('$2') ? userFields.password : await bcrypt.hash(userFields.password, 10)) :
            await bcrypt.hash('password123', 10)

        const user = await prisma.user.create({
            data: {
                id: userFields.id,
                name: userFields.name,
                email: userFields.email,
                password: hashedPassword,
                role: userFields.role,
                isActive: userFields.isActive,
                createdAt: new Date(userFields.createdAt),
                updatedAt: new Date(userFields.updatedAt)
            }
        })

        console.log(`  User: ${user.email} created.`)

        if (buckets && buckets.length > 0) {
            for (const bucketData of buckets) {
                const { cards, ...bucketFields } = bucketData
                const bucket = await prisma.bucket.create({
                    data: {
                        id: bucketFields.id,
                        name: bucketFields.name,
                        createdBy: user.id,
                        createdAt: new Date(bucketFields.createdAt),
                        updatedAt: new Date(bucketFields.updatedAt)
                    }
                })

                console.log(`    Bucket: ${bucket.name} created.`)

                if (cards && cards.length > 0) {
                    for (const cardData of cards) {
                        const { ratings, ...cardFields } = cardData
                        await prisma.card.create({
                            data: {
                                id: cardData.id,
                                title: cardData.title,
                                type: cardData.type,
                                author: cardData.author,
                                content: cardData.content,
                                bucketId: bucket.id,
                                createdAt: new Date(cardFields.createdAt),
                                updatedAt: new Date(cardFields.updatedAt)
                            }
                        })
                    }
                    console.log(`      ${cards.length} cards added.`)
                }
            }
        }
    }

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
