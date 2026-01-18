import { PrismaClient } from './src/generated/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.rating.deleteMany({})
    console.log('Ratings cleared')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
