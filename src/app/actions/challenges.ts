"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentStreak } from "./reading-activity"
import { PREDEFINED_CHALLENGES } from "../../../prisma/predefined-challenges"
import { auth } from "@/auth"
import { BADGES } from "@/lib/badges"

export async function initializePredefinedChallenges() {
    try {
        let createdCount = 0
        for (const challenge of PREDEFINED_CHALLENGES) {
            const existing = await prisma.challenge.findFirst({
                where: {
                    title: challenge.title,
                    isPredefined: true
                }
            })

            if (!existing) {
                await prisma.challenge.create({
                    data: challenge
                })
                createdCount++
            }
        }

        // Disable old predefined challenges to ensure only the user-requested ones are visible
        const activeTitles = PREDEFINED_CHALLENGES.map(c => c.title)

        // Strict cleanup: Delete old predefined challenges that are not in the new list
        // This effectively removes them for all users, which matches the single-user requirement
        await prisma.challenge.deleteMany({
            where: {
                isPredefined: true,
                title: { notIn: activeTitles }
            }
        })

        return { success: true, message: `${createdCount} new challenges created` }
    } catch (error) {
        console.error("Error initializing challenges:", error)
        return { success: false, error: "Failed to initialize challenges" }
    }
}

export async function getPredefinedChallenges() {
    try {
        const challenges = await prisma.challenge.findMany({
            where: { isPredefined: true },
            orderBy: { createdAt: 'asc' },
        })

        return { success: true, challenges }
    } catch (error) {
        console.error("Error fetching predefined challenges:", error)
        return { success: false, challenges: [] }
    }
}

export async function getUserChallenges() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, userChallenges: [] }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, userChallenges: [] }
        }

        const userChallenges = await prisma.userChallenge.findMany({
            include: {
                challenge: true,
            },
            orderBy: { startedAt: 'desc' },
        })

        // Filter and delete ghosts (challenges not in the approved list)
        const allowedTitles = [
            "📄 Dévoreur de Pages",
            "📚 Un Roman par Semaine",
            "🗯️ Fan de BD",
            "✍️ Critique Littéraire"
        ]

        const validChallenges = []

        for (const uc of userChallenges) {
            if (!allowedTitles.includes(uc.challenge.title)) {
                // Background delete of invalid "ghost" challenge
                await prisma.userChallenge.delete({
                    where: { id: uc.id }
                }).catch(err => console.error("Failed to delete ghost challenge:", err))
            } else {
                validChallenges.push(uc)
            }
        }

        // Calculate and update progress for each challenge
        const challengesWithProgress = await Promise.all(
            validChallenges.map(async (uc) => {
                const progress = await calculateChallengeProgress(uc.challenge, {
                    startDate: uc.startDate,
                    endDate: uc.endDate,
                    manualProgress: uc.manualProgress
                })
                const isCompleted = progress >= uc.challenge.target

                // Update progress in database if changed
                if (progress !== uc.progress || isCompleted !== uc.isCompleted) {
                    await prisma.userChallenge.update({
                        where: { id: uc.id },
                        data: {
                            progress,
                            isCompleted,
                            completedAt: isCompleted && !uc.isCompleted ? new Date() : uc.completedAt,
                        },
                    })

                    // Award badges if newly completed
                    if (isCompleted && !uc.isCompleted) {
                        await checkAndAwardBadges(uc.userId)
                    }
                }

                return {
                    ...uc,
                    progress,
                    isCompleted,
                }
            })
        )

        return { success: true, userChallenges: challengesWithProgress }
    } catch (error) {
        console.error("Error fetching user challenges:", error)
        return { success: false, userChallenges: [] }
    }
}

export async function joinChallenge(challengeId: string, customDates?: { startDate: Date, endDate: Date }) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Check if already joined
        const existing = await prisma.userChallenge.findFirst({
            where: { challengeId, userId: user.id },
        })

        if (existing) {
            return { success: false, error: "Already joined this challenge" }
        }

        // Default startDate to NOW to prevent immediate auto-completion based on history
        // This answers: "Je veux pouvoir déclencher le défis quand je le souhaite"
        const startDate = customDates?.startDate || new Date()

        const userChallenge = await prisma.userChallenge.create({
            data: {
                challengeId,
                userId: user.id,
                startDate: startDate,
                endDate: customDates?.endDate,
            },
            include: {
                challenge: true,
            },
        })

        revalidatePath("/challenges")
        return { success: true, userChallenge }
    } catch (error) {
        console.error("Error joining challenge:", error)
        return { success: false, error: "Failed to join challenge" }
    }
}

export async function createCustomChallenge(data: {
    title: string
    description: string
    challengeType: string
    target: number
    period: string
    icon?: string
    startDate?: Date
    endDate?: Date
}) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        const challenge = await prisma.challenge.create({
            data: {
                title: data.title,
                description: data.description,
                challengeType: data.challengeType as any,
                target: data.target,
                period: data.period as any,
                icon: data.icon,
                isPredefined: false,
            },
        })

        // Automatically join the custom challenge
        const userChallenge = await prisma.userChallenge.create({
            data: {
                challengeId: challenge.id,
                userId: user.id,
                startDate: data.startDate,
                endDate: data.endDate,
            },
        })

        revalidatePath("/challenges")
        return { success: true, challenge, userChallenge }
    } catch (error) {
        console.error("Error creating custom challenge:", error)
        return { success: false, error: "Failed to create challenge" }
    }
}

async function calculateChallengeProgress(
    challenge: any,
    customDates?: { startDate?: Date | null, endDate?: Date | null, manualProgress?: number }
): Promise<number> {
    try {
        const manualProgress = customDates?.manualProgress || 0
        // Determine effective date range
        let dateFilter: any = undefined

        if (customDates?.startDate) {
            dateFilter = {
                gte: customDates.startDate,
                lte: customDates.endDate || undefined
            }
        } else {
            dateFilter = getDateRangeForPeriod(challenge.period)
        }

        switch (challenge.challengeType) {
            case "GENRE_DIVERSITY": {
                const genres = await prisma.book.findMany({
                    where: {
                        status: "READ",
                        genreId: { not: null },
                        finishDate: dateFilter,
                    },
                    select: { genreId: true },
                    distinct: ["genreId"],
                })
                return genres.length + manualProgress
            }

            case "BOOK_COUNT": {
                // Custom Logic for specific user requests (Roman, BD)
                const isRomanChallenge = challenge.title.includes("Roman")
                const isBDChallenge = challenge.title.includes("BD") || challenge.title.includes("bande dessinée")

                let genreFilter: any = undefined

                if (isRomanChallenge) {
                    genreFilter = {
                        name: { contains: "Roman", mode: "insensitive" }
                    }
                } else if (isBDChallenge) {
                    // Try to match typical BD genre names
                    genreFilter = {
                        name: { contains: "BD", mode: "insensitive" }
                    }
                }

                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        finishDate: dateFilter,
                        genre: genreFilter
                    },
                })
                return count + manualProgress
            }

            case "LONG_BOOKS": {
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        totalPages: { gte: 500 },
                        finishDate: dateFilter,
                    },
                })
                return count + manualProgress
            }

            case "PAGE_COUNT": {
                const books = await prisma.book.findMany({
                    where: {
                        status: "READ",
                        finishDate: dateFilter,
                        totalPages: { not: null },
                    },
                    select: { totalPages: true },
                })
                return books.reduce((sum, b) => sum + (b.totalPages || 0), 0) + manualProgress
            }

            case "AUTHOR_DIVERSITY": {
                const authors = await prisma.book.findMany({
                    where: { status: "READ" },
                    select: { authorId: true },
                    distinct: ["authorId"],
                })
                return authors.length + manualProgress
            }

            case "REVIEW_COUNT": {
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        comment: { not: null },
                    },
                })
                return count + manualProgress
            }

            case "QUOTE_COUNT": {
                const count = await prisma.quote.count()
                return count + manualProgress
            }

            case "READING_STREAK": {
                const result = await getCurrentStreak()
                return result.streak + manualProgress
            }

            case "COLLECTION_SIZE": {
                const collections = await prisma.collection.findMany({
                    include: {
                        _count: {
                            select: { books: true },
                        },
                    },
                })
                const maxSize = Math.max(...collections.map(c => c._count.books), 0)
                return maxSize + manualProgress
            }

            default:
                return manualProgress
        }
    } catch (error) {
        console.error("Error calculating progress:", error)
        return 0
    }
}

function getDateRangeForPeriod(period: string) {
    const now = new Date()

    switch (period) {
        case "WEEKLY": {
            const weekAgo = new Date(now)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return { gte: weekAgo }
        }

        case "MONTHLY": {
            const monthAgo = new Date(now)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return { gte: monthAgo }
        }

        case "QUARTERLY": {
            const quarterAgo = new Date(now)
            quarterAgo.setMonth(quarterAgo.getMonth() - 3)
            return { gte: quarterAgo }
        }

        case "YEARLY": {
            const yearStart = new Date(now.getFullYear(), 0, 1)
            return { gte: yearStart }
        }

        case "ANYTIME":
        default:
            return undefined
    }
}

export async function updateChallengeProgress(userChallengeId: string) {
    try {
        const userChallenge = await prisma.userChallenge.findUnique({
            where: { id: userChallengeId },
            include: { challenge: true },
        })

        if (!userChallenge) {
            return { success: false, error: "Challenge not found" }
        }

        const progress = await calculateChallengeProgress(userChallenge.challenge, {
            startDate: userChallenge.startDate,
            endDate: userChallenge.endDate,
            manualProgress: userChallenge.manualProgress
        })
        const isCompleted = progress >= userChallenge.challenge.target

        await prisma.userChallenge.update({
            where: { id: userChallengeId },
            data: {
                progress,
                isCompleted,
                completedAt: isCompleted && !userChallenge.isCompleted ? new Date() : userChallenge.completedAt,
            },
        })

        // Award badges if challenge completed
        if (isCompleted && !userChallenge.isCompleted) {
            await checkAndAwardBadges(userChallenge.userId)
        }

        revalidatePath("/challenges")
        return { success: true, progress, isCompleted }
    } catch (error) {
        console.error("Error updating challenge progress:", error)
        return { success: false, error: "Failed to update progress" }
    }
}

export async function updateAllChallengesProgress() {
    try {
        const userChallenges = await prisma.userChallenge.findMany({
            where: { isCompleted: false },
            include: { challenge: true },
        })

        for (const uc of userChallenges) {
            await updateChallengeProgress(uc.id)
        }

        return { success: true }
    } catch (error) {
        console.error("Error updating all challenges:", error)
        return { success: false }
    }
}

// Helper function to check and update all challenges for current user
// This should be called after book status changes
export async function checkAndUpdateChallenges() {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) return { success: false }

        const userChallenges = await prisma.userChallenge.findMany({
            where: {
                userId: user.id,
                isCompleted: false
            },
            include: { challenge: true },
        })

        const newlyCompleted = []

        for (const uc of userChallenges) {
            const progress = await calculateChallengeProgress(uc.challenge, {
                startDate: uc.startDate,
                endDate: uc.endDate,
                manualProgress: uc.manualProgress
            })
            const isCompleted = progress >= uc.challenge.target

            if (progress !== uc.progress || isCompleted !== uc.isCompleted) {
                await prisma.userChallenge.update({
                    where: { id: uc.id },
                    data: {
                        progress,
                        isCompleted,
                        completedAt: isCompleted && !uc.isCompleted ? new Date() : uc.completedAt,
                    },
                })

                if (isCompleted && !uc.isCompleted) {
                    newlyCompleted.push(uc.challenge.title)
                }
            }
        }

        if (newlyCompleted.length > 0) {
            await checkAndAwardBadges(user.id)
        }

        return { success: true, newlyCompleted }
    } catch (error) {
        console.error("Error checking challenges:", error)
        return { success: false, newlyCompleted: [] }
    }
}


export async function getUnlockedBadges() {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, badges: [] }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) return { success: false, badges: [] }

        const badges = await prisma.badge.findMany({
            where: { userId: user.id },
            orderBy: { unlockedAt: 'desc' },
        })

        return { success: true, badges }
    } catch (error) {
        console.error("Error fetching badges:", error)
        return { success: false, badges: [] }
    }
}

async function checkAndAwardBadges(userId: string) {
    try {
        // Fetch all necessary data once to minimize DB calls
        const [
            readBooks,
            userChallenges,
            quotesCount,
            streakData,
            predefinedChallengesCount,
            createdChallengesCount
        ] = await Promise.all([
            prisma.book.findMany({
                where: { userId, status: "READ", finishDate: { not: null } },
                include: { genre: true }
            }),
            prisma.userChallenge.findMany({
                where: { userId, isCompleted: true },
                include: { challenge: true }
            }),
            prisma.quote.count({ where: { userId } }),
            getCurrentStreak(),
            prisma.challenge.count({ where: { isPredefined: true } }),
            prisma.userChallenge.count({ where: { userId, challenge: { isPredefined: false } } })
        ])

        const totalPages = readBooks.reduce((sum, book) => sum + (book.totalPages || 0), 0)
        const reviewsCount = readBooks.filter(b => b.comment && b.comment.length > 0).length
        const uniqueGenres = new Set(readBooks.map(b => b.genreId).filter(Boolean)).size

        // Author counts
        const authorCounts: Record<string, number> = {}
        readBooks.forEach(b => {
            if (b.authorId) authorCounts[b.authorId] = (authorCounts[b.authorId] || 0) + 1
        })
        const maxBooksByAuthor = Math.max(...Object.values(authorCounts), 0)

        // Check each badge
        for (const badge of BADGES) {
            let awarded = false

            switch (badge.category) {
                case 'READING':
                    if (badge.target && readBooks.length >= badge.target) awarded = true
                    break
                case 'PAGES':
                    if (badge.target && totalPages >= badge.target) awarded = true
                    break
                case 'STREAK':
                    if (badge.target && streakData.streak >= badge.target) awarded = true
                    break
                case 'SOCIAL':
                    if (badge.id.startsWith('review') && badge.target && reviewsCount >= badge.target) awarded = true
                    if (badge.id.startsWith('quote') && badge.target && quotesCount >= badge.target) awarded = true
                    break
                case 'CHALLENGE':
                    if (badge.id === 'challenge-all-predefined') {
                        const completedPredefined = userChallenges.filter(uc => uc.challenge.isPredefined).length
                        if (completedPredefined >= predefinedChallengesCount && predefinedChallengesCount > 0) awarded = true
                    } else if (badge.target && userChallenges.length >= badge.target) {
                        awarded = true
                    }
                    break
                case 'SPECIAL':
                    if (badge.id === 'genre-5' && uniqueGenres >= 5) awarded = true
                    if (badge.id === 'long-book' && readBooks.some(b => (b.totalPages || 0) >= 500)) awarded = true
                    if (badge.id === 'create-challenge' && createdChallengesCount >= 1) awarded = true
                    if (badge.id === 'author-3' && maxBooksByAuthor >= 3) awarded = true
                    if (badge.id === 'fast-read') {
                        const hasFastRead = readBooks.some(b => {
                            if (!b.startDate || !b.finishDate) return false
                            const diffTime = Math.abs(b.finishDate.getTime() - b.startDate.getTime())
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            return diffDays <= 3
                        })
                        if (hasFastRead) awarded = true
                    }
                    break
            }

            if (awarded) {
                await awardBadgeIfNotExists(userId, badge)
            }
        }

        return { success: true }
    } catch (error) {
        console.error("Error awarding badges:", error)
        return { success: false }
    }
}

async function awardBadgeIfNotExists(userId: string, badgeDef: any) {
    const existing = await prisma.badge.findFirst({
        where: { name: badgeDef.name, userId },
    })

    if (!existing) {
        await prisma.badge.create({
            data: {
                name: badgeDef.name,
                description: badgeDef.description,
                icon: badgeDef.icon,
                category: badgeDef.category,
                userId,
            },
        })
    }
}

export async function addManualProgress(userChallengeId: string, amount: number) {
    try {
        const userChallenge = await prisma.userChallenge.findUnique({
            where: { id: userChallengeId },
        })

        if (!userChallenge) {
            return { success: false, error: "Challenge not found" }
        }

        const newManualProgress = (userChallenge.manualProgress || 0) + amount

        await prisma.userChallenge.update({
            where: { id: userChallengeId },
            data: { manualProgress: newManualProgress },
        })

        return await updateChallengeProgress(userChallengeId)
    } catch (error) {
        console.error("Error adding manual progress:", error)
        return { success: false, error: "Failed to add manual progress" }
    }
}

export async function archiveChallenge(userChallengeId: string) {
    try {
        await prisma.userChallenge.update({
            where: { id: userChallengeId },
            data: { isArchived: true },
        })
        revalidatePath("/challenges")
        return { success: true }
    } catch (error) {
        console.error("Error archiving challenge:", error)
        return { success: false, error: "Failed to archive challenge" }
    }
}

export async function relaunchChallenge(userChallengeId: string) {
    try {
        await prisma.userChallenge.update({
            where: { id: userChallengeId },
            data: {
                progress: 0,
                isCompleted: false,
                completedAt: null,
                startedAt: new Date(),
                manualProgress: 0,
                isArchived: false,
                isPaused: false,
            },
        })
        revalidatePath("/challenges")
        return { success: true }
    } catch (error) {
        console.error("Error relaunching challenge:", error)
        return { success: false, error: "Failed to relaunch challenge" }
    }
}

export async function toggleChallengePause(userChallengeId: string, isPaused: boolean) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Non authentifié" }
        }

        await prisma.userChallenge.update({
            where: { id: userChallengeId },
            data: { isPaused },
        })

        revalidatePath("/challenges")
        return { success: true }
    } catch (error) {
        console.error("Error toggling challenge pause:", error)
        return { success: false, error: "Erreur lors de la modification du statut" }
    }
}
