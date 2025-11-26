"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getDashboardStats() {
    const session = await auth()
    if (!session?.user?.email) {
        return { toRead: 0, reading: 0, read: 0, thisMonth: 0, readThisYear: 0 }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return { toRead: 0, reading: 0, read: 0, thisMonth: 0, readThisYear: 0 }
    }
    const [toRead, reading, read, thisMonth, readThisYear] = await Promise.all([
        prisma.book.count({ where: { status: "TO_READ", userId: user.id } }),
        prisma.book.count({ where: { status: "READING", userId: user.id } }),
        prisma.book.count({ where: { status: "READ", userId: user.id } }),
        prisma.book.count({
            where: {
                status: "READ",
                userId: user.id,
                finishDate: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
        prisma.book.count({
            where: {
                status: "READ",
                userId: user.id,
                finishDate: {
                    gte: new Date(new Date().getFullYear(), 0, 1),
                },
            },
        }),
    ])

    return {
        toRead,
        reading,
        read,
        thisMonth,
        readThisYear,
    }
}

export async function getDetailedStats() {
    const session = await auth()
    if (!session?.user?.email) {
        return {
            monthlyActivity: [],
            genreDistribution: [],
            ratingDistribution: [],
            totalRead: 0,
        }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return {
            monthlyActivity: [],
            genreDistribution: [],
            ratingDistribution: [],
            totalRead: 0,
        }
    }

    // Monthly reading activity (last 12 months or current year)
    // Since SQLite doesn't support date functions easily in Prisma groupBy without raw query,
    // and dataset is likely small, we can fetch read books and process in JS.
    const readBooks = await prisma.book.findMany({
        where: {
            status: "READ",
            finishDate: { not: null },
            userId: user.id,
        },
        select: {
            finishDate: true,
            rating: true,
            genre: { select: { name: true } },
            author: { select: { name: true } },
        },
    })

    // Process Monthly Activity
    const monthlyActivity = new Array(12).fill(0).map((_, i) => ({
        name: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
        count: 0,
    }))

    readBooks.forEach(book => {
        if (book.finishDate) {
            const month = book.finishDate.getMonth()
            monthlyActivity[month].count++
        }
    })

    // Process Genre Distribution
    const genreMap = new Map<string, number>()
    readBooks.forEach(book => {
        const genreName = book.genre?.name || "Non classé"
        genreMap.set(genreName, (genreMap.get(genreName) || 0) + 1)
    })

    const genreDistribution = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    // Process Rating Distribution
    const ratingDistribution = new Array(5).fill(0).map((_, i) => ({
        name: `${i + 1} étoiles`,
        value: 0,
    }))

    readBooks.forEach(book => {
        if (book.rating && Number(book.rating) >= 1 && Number(book.rating) <= 5) {
            ratingDistribution[Math.floor(Number(book.rating)) - 1].value++
        }
    })

    return {
        monthlyActivity,
        genreDistribution,
        ratingDistribution,
        totalRead: readBooks.length,
    }
}

export async function getRecentBooks() {
    const session = await auth()
    if (!session?.user?.email) {
        return []
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return []
    }

    const books = await prisma.book.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: {
            updatedAt: "desc",
        },
        include: {
            author: true,
            genre: true,
        },
    })

    return books
}

export async function getPagesReadStats() {
    const session = await auth()
    if (!session?.user?.email) {
        return {
            monthlyPages: [],
            totalPagesThisYear: 0,
            totalPagesAllTime: 0,
            averagePagesPerBook: 0,
        }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return {
            monthlyPages: [],
            totalPagesThisYear: 0,
            totalPagesAllTime: 0,
            averagePagesPerBook: 0,
        }
    }

    const readBooks = await prisma.book.findMany({
        where: {
            status: "READ",
            finishDate: { not: null },
            totalPages: { not: null },
            userId: user.id,
        },
        select: {
            finishDate: true,
            totalPages: true,
        },
    })

    // Process monthly pages read for current year
    const currentYear = new Date().getFullYear()
    const monthlyPages = new Array(12).fill(0).map((_, i) => ({
        name: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
        pages: 0,
    }))

    let totalPagesThisYear = 0
    let totalPagesAllTime = 0

    readBooks.forEach(book => {
        if (book.finishDate && book.totalPages) {
            totalPagesAllTime += book.totalPages

            if (book.finishDate.getFullYear() === currentYear) {
                const month = book.finishDate.getMonth()
                monthlyPages[month].pages += book.totalPages
                totalPagesThisYear += book.totalPages
            }
        }
    })

    return {
        monthlyPages,
        totalPagesThisYear,
        totalPagesAllTime,
        averagePagesPerBook: readBooks.length > 0 ? Math.round(totalPagesAllTime / readBooks.length) : 0,
    }
}

// ===== ADVANCED ANALYTICS =====

export async function getReadingMoodAnalysis() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return []

    const readBooks = await prisma.book.findMany({
        where: {
            status: "READ",
            rating: { not: null },
            finishDate: { not: null },
            userId: user.id,
        },
        select: {
            finishDate: true,
            rating: true,
        },
        orderBy: { finishDate: 'asc' },
    })

    // Group by month and calculate average rating
    const monthlyMood: Record<string, { total: number; count: number; date: Date }> = {}

    readBooks.forEach(book => {
        if (book.finishDate && book.rating) {
            const key = `${book.finishDate.getFullYear()}-${String(book.finishDate.getMonth() + 1).padStart(2, '0')}`
            if (!monthlyMood[key]) {
                monthlyMood[key] = { total: 0, count: 0, date: book.finishDate }
            }
            monthlyMood[key].total += Number(book.rating)
            monthlyMood[key].count++
        }
    })

    return Object.entries(monthlyMood)
        .map(([key, data]) => ({
            month: new Date(data.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
            mood: Number((data.total / data.count).toFixed(2)),
        }))
        .slice(-12) // Last 12 months
}

export async function getPreferencesAnalysis() {
    const session = await auth()
    if (!session?.user?.email) return { topGenres: [], topAuthors: [] }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return { topGenres: [], topAuthors: [] }

    // Top 5 genres
    const readBooks = await prisma.book.findMany({
        where: {
            status: "READ",
            genreId: { not: null },
            userId: user.id,
        },
        include: {
            genre: true,
            author: true,
        },
    })

    // Count genres
    const genreMap = new Map<string, { name: string; count: number }>()
    readBooks.forEach(book => {
        if (book.genre) {
            const existing = genreMap.get(book.genre.id)
            if (existing) {
                existing.count++
            } else {
                genreMap.set(book.genre.id, { name: book.genre.name, count: 1 })
            }
        }
    })

    const topGenres = Array.from(genreMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    // Count authors
    const authorMap = new Map<string, { name: string; count: number }>()
    readBooks.forEach(book => {
        const existing = authorMap.get(book.author.id)
        if (existing) {
            existing.count++
        } else {
            authorMap.set(book.author.id, { name: book.author.name, count: 1 })
        }
    })

    const topAuthors = Array.from(authorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return { topGenres, topAuthors }
}

export async function getReadingTrends() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return []

    const readBooks = await prisma.book.findMany({
        where: {
            status: "READ",
            finishDate: { not: null },
            userId: user.id,
        },
        select: { finishDate: true },
    })

    // Aggregate by month (all years combined)
    const monthlyTrends = new Array(12).fill(0)
    readBooks.forEach(book => {
        if (book.finishDate) {
            const month = book.finishDate.getMonth()
            monthlyTrends[month]++
        }
    })

    return monthlyTrends.map((count, i) => ({
        month: new Date(0, i).toLocaleString('fr-FR', { month: 'long' }),
        count,
    }))
}

export async function getYearOverYearComparison() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return []

    const readBooks = await prisma.book.findMany({
        where: {
            status: "READ",
            finishDate: { not: null },
            userId: user.id,
        },
        select: {
            finishDate: true,
            totalPages: true,
        },
    })

    const yearlyStats: Record<number, { year: number; booksRead: number; totalPages: number }> = {}

    readBooks.forEach(book => {
        if (book.finishDate) {
            const year = book.finishDate.getFullYear()
            if (!yearlyStats[year]) {
                yearlyStats[year] = {
                    year,
                    booksRead: 0,
                    totalPages: 0,
                }
            }
            yearlyStats[year].booksRead++
            yearlyStats[year].totalPages += book.totalPages || 0
        }
    })

    return Object.values(yearlyStats).sort((a, b) => a.year - b.year)
}

export async function getReadingPrediction() {
    const session = await auth()
    if (!session?.user?.email) {
        return {
            currentCount: 0,
            predictedTotal: 0,
            daysRemaining: 0,
            averagePerMonth: "0",
        }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return {
            currentCount: 0,
            predictedTotal: 0,
            daysRemaining: 0,
            averagePerMonth: "0",
        }
    }

    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const now = new Date()

    const booksThisYear = await prisma.book.count({
        where: {
            status: "READ",
            finishDate: {
                gte: startOfYear,
                lte: now,
            },
            userId: user.id,
        },
    })

    const daysPassed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    const daysInYear = 365
    const booksPerDay = booksThisYear / daysPassed
    const predictedTotal = Math.round(booksPerDay * daysInYear)

    return {
        currentCount: booksThisYear,
        predictedTotal: predictedTotal > 0 ? predictedTotal : booksThisYear,
        daysRemaining: daysInYear - daysPassed,
        averagePerMonth: (booksThisYear / (now.getMonth() + 1)).toFixed(1),
    }
}

export async function getReadingRecords() {
    const session = await auth()
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return null

    const [thickestBook, thinnestBook, highestRatedBook] = await Promise.all([
        prisma.book.findFirst({
            where: { userId: user.id, status: "READ", totalPages: { not: null } },
            orderBy: { totalPages: "desc" },
            include: { author: true }
        }),
        prisma.book.findFirst({
            where: { userId: user.id, status: "READ", totalPages: { gt: 0 } },
            orderBy: { totalPages: "asc" },
            include: { author: true }
        }),
        prisma.book.findFirst({
            where: { userId: user.id, status: "READ", rating: { not: null } },
            orderBy: { rating: "desc" },
            include: { author: true }
        })
    ])

    // Calculate fastest/slowest read
    const booksWithDates = await prisma.book.findMany({
        where: {
            userId: user.id,
            status: "READ",
            startDate: { not: null },
            finishDate: { not: null }
        },
        select: {
            id: true,
            title: true,
            coverUrl: true,
            startDate: true,
            finishDate: true,
            author: { select: { name: true } }
        }
    })

    let fastestRead = null
    let slowestRead = null

    if (booksWithDates.length > 0) {
        const booksWithDuration = booksWithDates.map(book => {
            const start = new Date(book.startDate!)
            const end = new Date(book.finishDate!)
            const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
            return { ...book, duration }
        }).sort((a, b) => a.duration - b.duration)

        fastestRead = booksWithDuration[0]
        slowestRead = booksWithDuration[booksWithDuration.length - 1]
    }

    return {
        thickestBook: thickestBook ? {
            ...thickestBook,
            rating: thickestBook.rating ? Number(thickestBook.rating) : null
        } : null,
        thinnestBook: thinnestBook ? {
            ...thinnestBook,
            rating: thinnestBook.rating ? Number(thinnestBook.rating) : null
        } : null,
        highestRatedBook: highestRatedBook ? {
            ...highestRatedBook,
            rating: highestRatedBook.rating ? Number(highestRatedBook.rating) : null
        } : null,
        fastestRead,
        slowestRead
    }
}
