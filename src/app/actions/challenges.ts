"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentStreak } from "./reading-activity"
import { PREDEFINED_CHALLENGES } from "../../../prisma/predefined-challenges"

export async function initializePredefinedChallenges() {
    try {
        // Check if predefined challenges already exist
        const existing = await prisma.challenge.count({
            where: { isPredefined: true },
        })

        if (existing > 0) {
            return { success: true, message: "Challenges already initialized" }
        }

        // Create predefined challenges
        await prisma.challenge.createMany({
            data: PREDEFINED_CHALLENGES,
        })

        return { success: true, message: `${PREDEFINED_CHALLENGES.length} challenges created` }
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

        // Calculate progress for each challenge
        const challengesWithProgress = await Promise.all(
            userChallenges.map(async (uc) => {
                const progress = await calculateChallengeProgress(uc.challenge)
                return {
                    ...uc,
                    progress,
                }
            })
        )

        return { success: true, userChallenges: challengesWithProgress }
    } catch (error) {
        console.error("Error fetching user challenges:", error)
        return { success: false, userChallenges: [] }
    }
}

export async function joinChallenge(challengeId: string) {
    try {
        // Check if already joined
        const existing = await prisma.userChallenge.findFirst({
            where: { challengeId },
        })

        if (existing) {
            return { success: false, error: "Already joined this challenge" }
        }

        const userChallenge = await prisma.userChallenge.create({
            data: {
                challengeId,
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
}) {
    try {
        const challenge = await prisma.challenge.create({
            data: {
                ...data,
                isPredefined: false,
                challengeType: data.challengeType as any,
                period: data.period as any,
            },
        })

        // Automatically join the custom challenge
        const userChallenge = await prisma.userChallenge.create({
            data: {
                challengeId: challenge.id,
            },
        })

        revalidatePath("/challenges")
        return { success: true, challenge, userChallenge }
    } catch (error) {
        console.error("Error creating custom challenge:", error)
        return { success: false, error: "Failed to create challenge" }
    }
}

async function calculateChallengeProgress(challenge: any): Promise<number> {
    try {
        switch (challenge.challengeType) {
            case "GENRE_DIVERSITY": {
                const genres = await prisma.book.findMany({
                    where: {
                        status: "READ",
                        genreId: { not: null },
                    },
                    select: { genreId: true },
                    distinct: ["genreId"],
                })
                return genres.length
            }

            case "BOOK_COUNT": {
                const dateRange = getDateRangeForPeriod(challenge.period)
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        finishDate: dateRange,
                    },
                })
                return count
            }

            case "LONG_BOOKS": {
                const count = await prisma.book.count({
                    where: {
                        status: "READ",
                        totalPages: { gte: 500 },
                    },
                })
                return count
            }

            case "PAGE_COUNT": {
                const dateRange = getDateRangeForPeriod(challenge.period)
                const books = await prisma.book.findMany({
                    where: {
                        status: "READ",
                        finishDate: dateRange,
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

        const progress = await calculateChallengeProgress(userChallenge.challenge)
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
            await checkAndAwardBadges()
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

export async function getUnlockedBadges() {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { unlockedAt: 'desc' },
        })

        return { success: true, badges }
    } catch (error) {
        console.error("Error fetching badges:", error)
        return { success: false, badges: [] }
    }
}

async function checkAndAwardBadges() {
    try {
        const completedCount = await prisma.userChallenge.count({
            where: { isCompleted: true },
        })

        // Badge: Premier Pas (1st challenge)
        if (completedCount >= 1) {
            await awardBadgeIfNotExists({
                name: "Premier Pas",
                description: "Complétez votre premier défi",
                icon: "🎯",
                category: "CHALLENGE_COMPLETION",
            })
        }

        // Badge: Défi Relevé (5 challenges)
        if (completedCount >= 5) {
            await awardBadgeIfNotExists({
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
            },
        })
        if (completedPredefined >= predefinedCount) {
            await awardBadgeIfNotExists({
                name: "Maître des Défis",
                description: "Complétez tous les défis prédéfinis",
                icon: "👑",
                category: "CHALLENGE_COMPLETION",
            })
        }

        // Badge: Créateur (1 custom challenge)
        const customCount = await prisma.challenge.count({
            where: { isPredefined: false },
        })
        if (customCount >= 1) {
            await awardBadgeIfNotExists({
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

async function awardBadgeIfNotExists(badgeData: {
    name: string
    description: string
    icon: string
    category: string
}) {
    const existing = await prisma.badge.findFirst({
        where: { name: badgeData.name },
    })

    if (!existing) {
        await prisma.badge.create({
            data: {
                ...badgeData,
                category: badgeData.category as any,
            },
        })
    }
}
