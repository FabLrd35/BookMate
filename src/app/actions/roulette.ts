"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export type RouletteFilters = {
    genres?: string[]
    minPages?: number
    maxPages?: number
}

export type RouletteBook = {
    id: string
    title: string
    author: string
    coverUrl: string | null
    pageCount: number | null
    genre: string | null
    source: "library"
    description?: string | null
}

export async function getRandomBook(filters: RouletteFilters): Promise<{ success: boolean; book?: RouletteBook; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Non authentifié" }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" }
        }

        // Get random book from user's library with TO_READ status
        const whereClause: any = {
            userId: user.id,
            status: "TO_READ",
        }

        // Apply genre filter
        if (filters.genres && filters.genres.length > 0) {
            whereClause.genre = {
                name: {
                    in: filters.genres
                }
            }
        }

        // Apply page count filters
        if (filters.minPages !== undefined || filters.maxPages !== undefined) {
            whereClause.totalPages = {}
            if (filters.minPages !== undefined) {
                whereClause.totalPages.gte = filters.minPages
            }
            if (filters.maxPages !== undefined) {
                whereClause.totalPages.lte = filters.maxPages
            }
        }

        // Get count of matching books
        const count = await prisma.book.count({ where: whereClause })

        if (count === 0) {
            return { success: false, error: "Aucun livre ne correspond à vos critères" }
        }

        // Get random book using skip
        const randomIndex = Math.floor(Math.random() * count)
        const book = await prisma.book.findFirst({
            where: whereClause,
            skip: randomIndex,
            include: {
                author: true,
                genre: true,
            }
        })

        if (!book) {
            return { success: false, error: "Aucun livre trouvé" }
        }

        return {
            success: true,
            book: {
                id: book.id,
                title: book.title,
                author: book.author.name,
                coverUrl: book.coverUrl,
                pageCount: book.totalPages,
                genre: book.genre?.name || null,
                source: "library",
                description: book.summary,
            }
        }
    } catch (error) {
        console.error("Error getting random book:", error)
        return { success: false, error: "Erreur lors de la sélection du livre" }
    }
}

export async function getMultipleRandomBooks(filters: RouletteFilters, count: number = 8): Promise<{ success: boolean; books?: RouletteBook[]; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Non authentifié" }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" }
        }

        // Get random books from user's library with TO_READ status
        const whereClause: any = {
            userId: user.id,
            status: "TO_READ",
        }

        // Apply genre filter
        if (filters.genres && filters.genres.length > 0) {
            whereClause.genre = {
                name: {
                    in: filters.genres
                }
            }
        }

        // Apply page count filters
        if (filters.minPages !== undefined || filters.maxPages !== undefined) {
            whereClause.totalPages = {}
            if (filters.minPages !== undefined) {
                whereClause.totalPages.gte = filters.minPages
            }
            if (filters.maxPages !== undefined) {
                whereClause.totalPages.lte = filters.maxPages
            }
        }

        // Get all matching books
        const allBooks = await prisma.book.findMany({
            where: whereClause,
            include: {
                author: true,
                genre: true,
            }
        })

        if (allBooks.length === 0) {
            return { success: false, error: "Aucun livre ne correspond à vos critères" }
        }

        // Shuffle and take requested count
        const shuffled = allBooks.sort(() => Math.random() - 0.5)
        const selectedBooks = shuffled.slice(0, Math.min(count, allBooks.length))

        return {
            success: true,
            books: selectedBooks.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author.name,
                coverUrl: book.coverUrl,
                pageCount: book.totalPages,
                genre: book.genre?.name || null,
                source: "library" as const,
                description: book.summary,
            }))
        }
    } catch (error) {
        console.error("Error getting multiple random books:", error)
        return { success: false, error: "Erreur lors de la sélection des livres" }
    }
}

export async function getRouletteFilters() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Non authentifié" }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" }
        }

        // Helper to count books with specific page range
        const countBooks = async (min?: number, max?: number) => {
            const where: any = {
                userId: user.id,
                status: "TO_READ",
            }

            if (min !== undefined || max !== undefined) {
                where.totalPages = {}
                if (min !== undefined) where.totalPages.gte = min
                if (max !== undefined) where.totalPages.lte = max
            }

            return await prisma.book.count({ where })
        }

        const [total, short, medium, long] = await Promise.all([
            countBooks(),
            countBooks(undefined, 200),
            countBooks(200, 400),
            countBooks(400, undefined)
        ])

        return {
            success: true,
            counts: {
                total,
                short,
                medium,
                long
            }
        }
    } catch (error) {
        console.error("Error getting roulette filters:", error)
        return { success: false, error: "Erreur lors de la récupération des filtres" }
    }
}
