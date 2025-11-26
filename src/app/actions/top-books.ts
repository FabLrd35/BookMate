"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getTopBooks(year: number) {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, topBooks: [] }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })
        if (!user) return { success: false, topBooks: [] }

        const topBooks = await prisma.topBook.findMany({
            where: {
                userId: user.id,
                year
            },
            include: {
                book: {
                    include: {
                        author: true,
                        genre: true
                    }
                }
            },
            orderBy: { position: 'asc' }
        })

        // Convert Decimal to number
        const serializedTopBooks = topBooks.map(tb => ({
            ...tb,
            book: {
                ...tb.book,
                rating: tb.book.rating ? Number(tb.book.rating) : null
            }
        }))

        return { success: true, topBooks: serializedTopBooks }
    } catch (error) {
        console.error("Error fetching top books:", error)
        return { success: false, topBooks: [] }
    }
}

export async function updateTopBooks(year: number, bookIds: string[]) {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, error: "Non authentifié" }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })
        if (!user) return { success: false, error: "Utilisateur non trouvé" }

        // Validate that we have exactly 10 books
        if (bookIds.length !== 10) {
            return { success: false, error: "Vous devez sélectionner exactement 10 livres" }
        }

        // Validate that all books exist and belong to the user
        const books = await prisma.book.findMany({
            where: {
                id: { in: bookIds },
                userId: user.id,
                status: "READ"
            }
        })

        if (books.length !== 10) {
            return { success: false, error: "Certains livres sont invalides ou ne vous appartiennent pas" }
        }

        // Delete existing top books for this year
        await prisma.topBook.deleteMany({
            where: {
                userId: user.id,
                year
            }
        })

        // Create new top books
        await prisma.topBook.createMany({
            data: bookIds.map((bookId, index) => ({
                year,
                position: index + 1,
                bookId,
                userId: user.id
            }))
        })

        revalidatePath("/top-10")
        return { success: true }
    } catch (error) {
        console.error("Error updating top books:", error)
        return { success: false, error: "Échec de la mise à jour" }
    }
}

export async function getAvailableYears() {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, years: [] }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })
        if (!user) return { success: false, years: [] }

        // Get all years where user has read books
        const books = await prisma.book.findMany({
            where: {
                userId: user.id,
                status: "READ",
                finishDate: { not: null }
            },
            select: { finishDate: true }
        })

        const years = [...new Set(
            books.map(b => new Date(b.finishDate!).getFullYear())
        )].sort((a, b) => b - a)

        return { success: true, years }
    } catch (error) {
        console.error("Error fetching available years:", error)
        return { success: false, years: [] }
    }
}

export async function getReadBooksForYear(year: number) {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, books: [] }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })
        if (!user) return { success: false, books: [] }

        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59)

        const books = await prisma.book.findMany({
            where: {
                userId: user.id,
                status: "READ",
                finishDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                author: true,
                genre: true
            },
            orderBy: { finishDate: 'desc' }
        })

        // Convert Decimal to number
        const serializedBooks = books.map(book => ({
            ...book,
            rating: book.rating ? Number(book.rating) : null
        }))

        return { success: true, books: serializedBooks }
    } catch (error) {
        console.error("Error fetching books for year:", error)
        return { success: false, books: [] }
    }
}
