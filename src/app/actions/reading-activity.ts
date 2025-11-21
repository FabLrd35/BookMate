"use server"

import { prisma } from "@/lib/prisma"

export async function getReadingActivityForYear(year: number) {
    try {
        const startDate = new Date(year, 0, 1) // 1er janvier
        const endDate = new Date(year, 11, 31, 23, 59, 59) // 31 décembre

        const activities = await prisma.readingActivity.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        coverUrl: true,
                    },
                },
            },
            orderBy: {
                date: 'asc',
            },
        })

        // Group by date and count activities
        const activityMap: Record<string, number> = {}
        activities.forEach((activity) => {
            const dateKey = activity.date.toISOString().split('T')[0]
            activityMap[dateKey] = (activityMap[dateKey] || 0) + 1
        })

        return { success: true, activityMap, activities }
    } catch (error) {
        console.error("Error fetching reading activity:", error)
        return { success: false, activityMap: {}, activities: [] }
    }
}

export async function getReadingActivityForDay(dateString: string) {
    try {
        const date = new Date(dateString)
        const startOfDay = new Date(date.setHours(0, 0, 0, 0))
        const endOfDay = new Date(date.setHours(23, 59, 59, 999))

        const activities = await prisma.readingActivity.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        coverUrl: true,
                        author: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        return { success: true, activities }
    } catch (error) {
        console.error("Error fetching day activity:", error)
        return { success: false, activities: [] }
    }
}

export async function getCurrentStreak() {
    try {
        const activities = await prisma.readingActivity.findMany({
            orderBy: {
                date: 'desc',
            },
            select: {
                date: true,
            },
        })

        if (activities.length === 0) {
            return { success: true, streak: 0 }
        }

        // Get unique dates
        const uniqueDates = Array.from(
            new Set(activities.map(a => a.date.toISOString().split('T')[0]))
        ).sort((a, b) => b.localeCompare(a)) // Sort descending

        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let currentDate = new Date(today)

        for (const dateStr of uniqueDates) {
            const activityDate = new Date(dateStr)
            activityDate.setHours(0, 0, 0, 0)

            const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays === 0 || diffDays === 1) {
                streak++
                currentDate = activityDate
            } else {
                break
            }
        }

        return { success: true, streak }
    } catch (error) {
        console.error("Error calculating current streak:", error)
        return { success: false, streak: 0 }
    }
}

export async function getLongestStreak() {
    try {
        const activities = await prisma.readingActivity.findMany({
            orderBy: {
                date: 'asc',
            },
            select: {
                date: true,
            },
        })

        if (activities.length === 0) {
            return { success: true, streak: 0 }
        }

        // Get unique dates sorted
        const uniqueDates = Array.from(
            new Set(activities.map(a => a.date.toISOString().split('T')[0]))
        ).sort()

        let longestStreak = 1
        let currentStreak = 1

        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1])
            const currDate = new Date(uniqueDates[i])

            const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                currentStreak++
                longestStreak = Math.max(longestStreak, currentStreak)
            } else {
                currentStreak = 1
            }
        }

        return { success: true, streak: longestStreak }
    } catch (error) {
        console.error("Error calculating longest streak:", error)
        return { success: false, streak: 0 }
    }
}

export async function populateActivityFromBooks() {
    try {
        // Get all books with dates
        const books = await prisma.book.findMany({
            where: {
                OR: [
                    { startDate: { not: null } },
                    { finishDate: { not: null } },
                ],
            },
            select: {
                id: true,
                startDate: true,
                finishDate: true,
                status: true,
            },
        })

        const activitiesToCreate = []

        for (const book of books) {
            // Add STARTED activity
            if (book.startDate) {
                activitiesToCreate.push({
                    date: book.startDate,
                    bookId: book.id,
                    activityType: 'STARTED' as const,
                })
            }

            // Add FINISHED activity
            if (book.finishDate) {
                activitiesToCreate.push({
                    date: book.finishDate,
                    bookId: book.id,
                    activityType: 'FINISHED' as const,
                })
            }

            // Add READING activities in between (every 3 days)
            if (book.startDate && book.finishDate) {
                const start = new Date(book.startDate)
                const end = new Date(book.finishDate)
                const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

                if (diffDays > 3) {
                    const interval = Math.max(3, Math.floor(diffDays / 5))
                    let currentDate = new Date(start)
                    currentDate.setDate(currentDate.getDate() + interval)

                    while (currentDate < end) {
                        activitiesToCreate.push({
                            date: new Date(currentDate),
                            bookId: book.id,
                            activityType: 'READING' as const,
                        })
                        currentDate.setDate(currentDate.getDate() + interval)
                    }
                }
            }
        }

        // Create activities (skip duplicates)
        let created = 0
        for (const activity of activitiesToCreate) {
            try {
                await prisma.readingActivity.create({
                    data: activity,
                })
                created++
            } catch (error) {
                // Skip duplicates
                continue
            }
        }

        return { success: true, created }
    } catch (error) {
        console.error("Error populating activities:", error)
        return { success: false, created: 0, error: "Échec du peuplement des activités" }
    }
}
