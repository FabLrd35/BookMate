"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createSeries(name: string, description?: string) {
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

    try {
        const series = await prisma.series.create({
            data: {
                name,
                description: description || null,
                userId: user.id,
            },
        })

        revalidatePath("/series")
        return { success: true, series }
    } catch (error) {
        console.error("Error creating series:", error)
        return { success: false, error: "Échec de la création de la série" }
    }
}

export async function updateSeries(id: string, name: string, description?: string) {
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

    // Verify ownership
    const existingSeries = await prisma.series.findUnique({
        where: { id },
        select: { userId: true }
    })

    if (!existingSeries || existingSeries.userId !== user.id) {
        return { success: false, error: "Série non trouvée ou accès non autorisé" }
    }

    try {
        const series = await prisma.series.update({
            where: { id },
            data: {
                name,
                description: description || null,
            },
        })

        revalidatePath("/series")
        return { success: true, series }
    } catch (error) {
        console.error("Error updating series:", error)
        return { success: false, error: "Échec de la mise à jour de la série" }
    }
}

export async function deleteSeries(id: string) {
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

    // Verify ownership
    const series = await prisma.series.findUnique({
        where: { id },
        select: { userId: true }
    })

    if (!series || series.userId !== user.id) {
        return { success: false, error: "Série non trouvée ou accès non autorisé" }
    }

    try {
        await prisma.series.delete({
            where: { id },
        })

        revalidatePath("/series")
        return { success: true }
    } catch (error) {
        console.error("Error deleting series:", error)
        return { success: false, error: "Échec de la suppression de la série" }
    }
}

export async function addBookToSeries(bookId: string, seriesId: string, order: number) {
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

    // Verify ownership of both book and series
    const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { userId: true }
    })

    const series = await prisma.series.findUnique({
        where: { id: seriesId },
        select: { userId: true }
    })

    if (!book || book.userId !== user.id || !series || series.userId !== user.id) {
        return { success: false, error: "Livre ou série non trouvé(e) ou accès non autorisé" }
    }

    try {
        await prisma.book.update({
            where: { id: bookId },
            data: {
                seriesId,
                seriesOrder: order,
            },
        })

        revalidatePath("/series")
        revalidatePath("/books")
        revalidatePath(`/books/${bookId}`)
        return { success: true }
    } catch (error) {
        console.error("Error adding book to series:", error)
        return { success: false, error: "Échec de l'ajout du livre à la série" }
    }
}

export async function removeBookFromSeries(bookId: string) {
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

    // Verify ownership
    const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { userId: true }
    })

    if (!book || book.userId !== user.id) {
        return { success: false, error: "Livre non trouvé ou accès non autorisé" }
    }

    try {
        await prisma.book.update({
            where: { id: bookId },
            data: {
                seriesId: null,
                seriesOrder: null,
            },
        })

        revalidatePath("/series")
        revalidatePath("/books")
        revalidatePath(`/books/${bookId}`)
        return { success: true }
    } catch (error) {
        console.error("Error removing book from series:", error)
        return { success: false, error: "Échec du retrait du livre de la série" }
    }
}

export async function getSeries() {
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

    try {
        const series = await prisma.series.findMany({
            where: { userId: user.id },
            include: {
                books: {
                    orderBy: [
                        { seriesOrder: 'asc' },
                        { publishedDate: 'asc' },
                        { createdAt: 'asc' },
                    ],
                    include: {
                        author: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        })

        // Convert Prisma Decimal fields (e.g., rating) to plain numbers for client compatibility
        const plainSeries = series.map((s: any) => ({
            ...s,
            books: s.books.map((b: any) => ({
                ...b,
                rating: b.rating ? Number(b.rating) : null,
            })),
        }))

        return { success: true, series: plainSeries }
    } catch (error) {
        console.error("Error fetching series:", error)
        return { success: false, error: "Échec de la récupération des séries" }
    }
}

export async function getSeriesById(id: string) {
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

    try {
        const series = await prisma.series.findUnique({
            where: { id },
            include: {
                books: {
                    orderBy: [
                        { seriesOrder: 'asc' },
                        { publishedDate: 'asc' },
                        { createdAt: 'asc' },
                    ],
                    include: {
                        author: true,
                        genre: true,
                    },
                },
            },
        })

        if (!series || series.userId !== user.id) {
            return { success: false, error: "Série non trouvée ou accès non autorisé" }
        }

        return { success: true, series }
    } catch (error) {
        console.error("Error fetching series:", error)
        return { success: false, error: "Échec de la récupération de la série" }
    }
}

export async function detectSeries() {
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

    try {
        // Get all books without a series
        const books = await prisma.book.findMany({
            where: {
                userId: user.id,
                seriesId: null,
            },
            include: {
                author: true,
            },
        })

        // Group books by author
        const booksByAuthor = books.reduce((acc, book) => {
            const authorName = book.author.name
            if (!acc[authorName]) {
                acc[authorName] = []
            }
            acc[authorName].push(book)
            return acc
        }, {} as Record<string, typeof books>)

        // Detect potential series
        const suggestions: Array<{
            seriesName: string
            books: Array<{ id: string; title: string; suggestedOrder: number }>
        }> = []

        for (const [authorName, authorBooks] of Object.entries(booksByAuthor)) {
            if (authorBooks.length < 2) continue

            // Find common prefixes
            const titles = authorBooks.map(b => b.title)
            const commonPrefixes = findCommonPrefixes(titles)

            for (const prefix of commonPrefixes) {
                const matchingBooks = authorBooks.filter(b => b.title.startsWith(prefix))
                if (matchingBooks.length >= 2) {
                    // Sort by publishedDate first, then by title-based order extraction, then by createdAt
                    const sortedBooks = matchingBooks.sort((a, b) => {
                        // Prioritize publishedDate if both books have it
                        if (a.publishedDate && b.publishedDate) {
                            return a.publishedDate.localeCompare(b.publishedDate)
                        }

                        // If only one has a publishedDate, prioritize it
                        if (a.publishedDate) return -1
                        if (b.publishedDate) return 1

                        // Try to extract order from title
                        const orderA = extractOrderFromTitle(a.title)
                        const orderB = extractOrderFromTitle(b.title)

                        // If both have extracted orders, use them
                        if (orderA !== null && orderB !== null) {
                            return orderA - orderB
                        }

                        // If only one has an order, prioritize it
                        if (orderA !== null) return -1
                        if (orderB !== null) return 1

                        // Fallback to creation date (when added to library)
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    })

                    suggestions.push({
                        seriesName: prefix.trim(),
                        books: sortedBooks.map((b, idx) => ({
                            id: b.id,
                            title: b.title,
                            suggestedOrder: idx + 1,
                        })),
                    })
                }
            }
        }

        return { success: true, suggestions }
    } catch (error) {
        console.error("Error detecting series:", error)
        return { success: false, error: "Échec de la détection des séries" }
    }
}

// Helper function to find common prefixes in titles
function findCommonPrefixes(titles: string[]): string[] {
    if (titles.length < 2) return []

    const prefixCandidates: Array<{ prefix: string; matchCount: number; wordCount: number }> = []

    // Check for common words at the start
    for (let i = 0; i < titles.length; i++) {
        const words = titles[i].split(/\s+/)
        // Start at 2 words minimum to avoid too short prefixes like "Harry"
        for (let len = 2; len <= Math.min(words.length - 1, 4); len++) {
            const prefix = words.slice(0, len).join(' ')

            // Check if at least 2 titles start with this prefix
            const matchCount = titles.filter(t => t.startsWith(prefix)).length
            if (matchCount >= 2) {
                prefixCandidates.push({ prefix, matchCount, wordCount: len })
            }
        }
    }

    // Remove duplicates and overlapping prefixes
    // Keep the prefix with the best balance: not too short, not too long
    const filteredPrefixes: string[] = []
    const sortedCandidates = prefixCandidates.sort((a, b) => {
        // Prioritize prefixes with more matches
        if (a.matchCount !== b.matchCount) {
            return b.matchCount - a.matchCount
        }
        // Then prefer 2-3 word prefixes over longer ones
        return Math.abs(a.wordCount - 2.5) - Math.abs(b.wordCount - 2.5)
    })

    for (const candidate of sortedCandidates) {
        // Check if this prefix is not a substring of an already selected prefix
        // or if an already selected prefix is not a substring of this one
        const isOverlapping = filteredPrefixes.some(existing =>
            existing.startsWith(candidate.prefix) || candidate.prefix.startsWith(existing)
        )

        if (!isOverlapping) {
            filteredPrefixes.push(candidate.prefix)
        }
    }

    return filteredPrefixes
}

// Helper function to extract order number from title
function extractOrderFromTitle(title: string): number | null {
    // Look for patterns like "Tome 1", "Volume 2", "Livre 3", "#4", etc.
    const patterns = [
        /tome\s+(\d+)/i,
        /volume\s+(\d+)/i,
        /livre\s+(\d+)/i,
        /#(\d+)/,
        /\b(\d+)\b/,
    ]

    for (const pattern of patterns) {
        const match = title.match(pattern)
        if (match) {
            return parseInt(match[1])
        }
    }

    return null
}

export async function acceptSeriesSuggestion(
    seriesName: string,
    books: Array<{ id: string; order: number }>
) {
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

    try {
        // Create the series
        const series = await prisma.series.create({
            data: {
                name: seriesName,
                userId: user.id,
            },
        })

        // Add books to the series
        for (const book of books) {
            await prisma.book.update({
                where: { id: book.id },
                data: {
                    seriesId: series.id,
                    seriesOrder: book.order,
                },
            })
        }

        revalidatePath("/series")
        revalidatePath("/books")
        return { success: true, series }
    } catch (error) {
        console.error("Error accepting series suggestion:", error)
        return { success: false, error: "Échec de la création de la série" }
    }
}
export async function reorderSeriesBooks(seriesId: string, bookIds: string[]) {
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

    // Verify ownership
    const series = await prisma.series.findUnique({
        where: { id: seriesId },
        select: { userId: true }
    })

    if (!series || series.userId !== user.id) {
        return { success: false, error: "Saga non trouvée ou accès non autorisé" }
    }

    try {
        // Update order for each book
        await prisma.$transaction(
            bookIds.map((bookId, index) =>
                prisma.book.update({
                    where: { id: bookId },
                    data: { seriesOrder: index + 1 },
                })
            )
        )

        revalidatePath(`/series/${seriesId}`)
        return { success: true }
    } catch (error) {
        console.error("Error reordering series books:", error)
        return { success: false, error: "Échec de la réorganisation des livres" }
    }
}

export async function autoSortSeriesBooks(seriesId: string) {
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

    // Verify ownership
    const series = await prisma.series.findUnique({
        where: { id: seriesId },
        include: { books: true }
    })

    if (!series || series.userId !== user.id) {
        return { success: false, error: "Saga non trouvée ou accès non autorisé" }
    }

    try {
        // Sort books by publishedDate
        const sortedBooks = [...series.books].sort((a, b) => {
            if (!a.publishedDate) return 1
            if (!b.publishedDate) return -1
            return a.publishedDate.localeCompare(b.publishedDate)
        })

        // Update order
        await prisma.$transaction(
            sortedBooks.map((book, index) =>
                prisma.book.update({
                    where: { id: book.id },
                    data: { seriesOrder: index + 1 },
                })
            )
        )

        revalidatePath(`/series/${seriesId}`)
        return { success: true }
    } catch (error) {
        console.error("Error auto-sorting series books:", error)
        return { success: false, error: "Échec du tri automatique" }
    }
}
