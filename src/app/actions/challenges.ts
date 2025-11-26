"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentStreak } from "./reading-activity"
import { PREDEFINED_CHALLENGES } from "../../../prisma/predefined-challenges"
import { auth } from "@/auth"

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
        const userChallenges = await prisma.userChallenge.findMany({
            include: {
                challenge: true,
            },
            orderBy: { startedAt: 'desc' },
        })

        // Calculate and update progress for each challenge
        const challengesWithProgress = await Promise.all(
            userChallenges.map(async (uc) => {
                const progress = await calculateChallengeProgress(uc.challenge, { startDate: uc.startDate, endDate: uc.endDate })
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

        const userChallenge = await prisma.userChallenge.create({
            data: {
                challengeId,
                userId: user.id,
                startDate: customDates?.startDate,
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
    customDates?: { startDate?: Date | null, endDate?: Date | null }
): Promise<number> {
    try {
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
                return genres.length
            }

            case "BOOK_COUNT": {
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        finishDate: dateFilter,
                    },
                })
                return count
            }

            case "LONG_BOOKS": {
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        totalPages: { gte: 500 },
                        finishDate: dateFilter,
                    },
                })
                return count
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
                return books.reduce((sum, b) => sum + (b.totalPages || 0), 0)
            }

            case "AUTHOR_DIVERSITY": {
                const authors = await prisma.book.findMany({
                    where: { status: "READ" },
                    select: { authorId: true },
                    distinct: ["authorId"],
                })
                return authors.length
            }

            case "REVIEW_COUNT": {
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        comment: { not: null },
                    },
                })
                return count
            }

            case "QUOTE_COUNT": {
                const count = await prisma.quote.count()
                return count
            }

            case "READING_STREAK": {
                const result = await getCurrentStreak()
                return result.streak
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
                return maxSize
            }

            default:
                return 0
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
            endDate: userChallenge.endDate
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
            const progress = await calculateChallengeProgress(uc.challenge, { startDate: uc.startDate, endDate: uc.endDate })
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
        const completedCount = await prisma.userChallenge.count({
            where: { isCompleted: true, userId },
        })

        // Badge: Premier Pas (1st challenge)
        if (completedCount >= 1) {
            await awardBadgeIfNotExists(userId, {
                name: "Premier Pas",
                description: "Complétez votre premier défi",
                icon: "🎯",
                category: "CHALLENGE_COMPLETION",
            })
        }

        // Badge: Défi Relevé (5 challenges)
        if (completedCount >= 5) {
            await awardBadgeIfNotExists(userId, {
                name: "Défi Relevé",
                description: "Complétez 5 défis",
                icon: "🏆",
                category: "CHALLENGE_COMPLETION",
            })
        }

        // Badge: Maître des Défis (all predefined)
        const predefinedCount = await prisma.challenge.count({
            where: { isPredefined: true },
        })
        const completedPredefined = await prisma.userChallenge.count({
            where: {
                isCompleted: true,
                challenge: { isPredefined: true },
                userId,
            },
        })
        if (completedPredefined >= predefinedCount) {
            await awardBadgeIfNotExists(userId, {
                name: "Maître des Défis",
                description: "Complétez tous les défis prédéfinis",
                icon: "👑",
                category: "CHALLENGE_COMPLETION",
            })
        }

        // Badge: Créateur (1 custom challenge)
        const customCount = await prisma.userChallenge.count({
            where: {
                userId,
                challenge: { isPredefined: false }
            },
        })
        if (customCount >= 1) {
            await awardBadgeIfNotExists(userId, {
                name: "Créateur",
                description: "Créez votre premier défi personnalisé",
                icon: "✨",
                category: "SPECIAL",
            })
        }

        return { success: true }
    } catch (error) {
        console.error("Error awarding badges:", error)
        return { success: false }
    }
}

async function awardBadgeIfNotExists(userId: string, badgeData: {
    name: string
    description: string
    icon: string
    category: string
}) {
    const existing = await prisma.badge.findFirst({
        where: { name: badgeData.name, userId },
    })

    if (!existing) {
        await prisma.badge.create({
            data: {
                ...badgeData,
                category: badgeData.category as any,
                userId,
            },
        })
    }
}
