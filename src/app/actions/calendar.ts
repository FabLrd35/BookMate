"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export type FinishedBook = {
    id: string
    title: string
    coverUrl: string | null
    finishDate: Date
    rating: number | null
}

export async function getFinishedBooks(year: number) {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return []

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    console.log("🔍 [getFinishedBooks] Querying for year:", year)
    console.log("🔍 [getFinishedBooks] User Email:", session.user.email)
    console.log("🔍 [getFinishedBooks] User ID from DB:", user.id)

    const books = await prisma.book.findMany({
        where: {
            userId: user.id,
            status: "READ",
            finishDate: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            id: true,
            title: true,
            coverUrl: true,
            finishDate: true,
            rating: true
        },
        orderBy: {
            finishDate: 'asc'
        }
    })

    console.log("🔍 [getFinishedBooks] Found books count:", books.length)
    if (books.length > 0) {
        console.log("🔍 [getFinishedBooks] First book:", books[0])
    }

    // Convert Decimal rating to number if necessary (though schema says Decimal?, usually mapped to number in JS but Prisma returns Decimal object)
    // Actually schema says Decimal?, so we might need to toNumber(). 
    // Let's handle the mapping safely.

    return books.map(book => ({
        ...book,
        finishDate: book.finishDate!, // We know it's not null because of the query filter (technically it could be if we didn't filter, but here we rely on the logic that READ books should have finishDate, but wait, the query filters by date range so it MUST be present)
        rating: book.rating ? Number(book.rating) : null
    }))
}
