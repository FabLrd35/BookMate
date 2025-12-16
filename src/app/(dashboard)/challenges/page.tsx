"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChallengeCard } from "@/components/challenge-card"
import { CreateChallengeDialog } from "@/components/create-challenge-dialog"
import { Trophy, Target, Award, Archive, Calendar } from "lucide-react"
import { GoalCard } from "@/components/goal-card"
import { getReadingGoal } from "@/app/actions/goals"
import { getDashboardStats } from "@/app/actions/statistics"
import {
    getPredefinedChallenges,
    getUserChallenges,
    getUnlockedBadges,
    joinChallenge,
    initializePredefinedChallenges,
    updateAllChallengesProgress,
} from "@/app/actions/challenges"
import { toast } from "sonner"

export default function ChallengesPage() {
    const [predefinedChallenges, setPredefinedChallenges] = useState<any[]>([])
    const [userChallenges, setUserChallenges] = useState<any[]>([])
    const [badges, setBadges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Goal Stats State
    // Goal Stats State
    const [goalStats, setGoalStats] = useState<{
        year: number
        month: number
        currentMonthly: number
        currentAnnual: number
        targetMonthly: number | null
        targetAnnual: number | null
    } | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        // Initialize predefined challenges if needed
        await initializePredefinedChallenges()

        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1

        const [predefinedResult, userResult, badgesResult, stats, monthlyGoal, annualGoal] = await Promise.all([
            getPredefinedChallenges(),
            getUserChallenges(),
            getUnlockedBadges(),
            getDashboardStats(),
            getReadingGoal("MONTHLY", currentYear, currentMonth),
            getReadingGoal("ANNUAL", currentYear),
        ])

        if (predefinedResult.success) {
            setPredefinedChallenges(predefinedResult.challenges)
        }

        if (userResult?.success) {
            setUserChallenges(userResult.userChallenges)
        }

        if (badgesResult.success) {
            setBadges(badgesResult.badges)
        }

        // Set Goal Stats
        setGoalStats({
            year: currentYear,
            month: currentMonth,
            currentMonthly: stats.thisMonth,
            currentAnnual: stats.readThisYear,
            targetMonthly: monthlyGoal?.target ?? null,
            targetAnnual: annualGoal?.target ?? null,
        })

        setLoading(false)
    }

    async function handleJoinChallenge(challengeId: string, customDates?: { startDate: Date, endDate: Date }) {
        const result = await joinChallenge(challengeId, customDates)

        if (result.success) {
            toast.success("Défi rejoint avec succès!")
            loadData()
        } else {
            toast.error(result.error || "Erreur lors de l'ajout du défi")
        }
    }

    const [periodFilter, setPeriodFilter] = useState<string>("ALL")

    const now = new Date()

    const activeChallenges = userChallenges.filter(uc => !uc.isCompleted && !uc.isArchived && (!uc.startDate || new Date(uc.startDate) <= now))
    const upcomingChallenges = userChallenges.filter(uc => !uc.isCompleted && !uc.isArchived && uc.startDate && new Date(uc.startDate) > now)
    const completedChallenges = userChallenges.filter(uc => uc.isCompleted && !uc.isArchived)
    const archivedChallenges = userChallenges.filter(uc => uc.isArchived)

    // Get all available challenges (not yet joined OR joinable for future)
    const allAvailableChallenges = predefinedChallenges.filter(pc => {
        const userInstances = userChallenges.filter(uc => uc.challengeId === pc.id)

        // If never joined, it's available
        if (userInstances.length === 0) return true

        // For Yearly challenges, allow joining if no future instance exists
        if (pc.period === 'YEARLY') {
            const currentYear = new Date().getFullYear()
            const hasFutureInstance = userInstances.some(uc =>
                uc.startDate && new Date(uc.startDate).getFullYear() > currentYear
            )
            // If we don't have a future one, let them plan one
            return !hasFutureInstance
        }

        // For others, if already joined, hide it
        return false
    })

    // Filter available challenges by selected period
    const filteredAvailableChallenges = allAvailableChallenges.filter(challenge => {
        if (periodFilter === "ALL") return true
        return challenge.period === periodFilter
    })

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" />
                        <p className="text-sm text-muted-foreground">Chargement...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Défis de Lecture</h1>
                    <p className="text-muted-foreground mt-1">
                        Relevez des défis et gagnez des badges!
                    </p>
                </div>
                <CreateChallengeDialog />
            </div>

            {/* Reading Goal Card */}
            {goalStats && (
                <div className="w-full">
                    <GoalCard
                        year={goalStats.year}
                        month={goalStats.month}
                        currentMonthly={goalStats.currentMonthly}
                        currentAnnual={goalStats.currentAnnual}
                        targetMonthly={goalStats.targetMonthly}
                        targetAnnual={goalStats.targetAnnual}
                    />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950">
                            <Target className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeChallenges.length}</p>
                            <p className="text-xs text-muted-foreground">Défis actifs</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-950">
                            <Trophy className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{completedChallenges.length}</p>
                            <p className="text-xs text-muted-foreground">Défis complétés</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950">
                            <Award className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{badges.length}</p>
                            <p className="text-xs text-muted-foreground">Badges débloqués</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="active">
                        Actifs ({activeChallenges.length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">
                        À venir ({upcomingChallenges.length})
                    </TabsTrigger>
                    <TabsTrigger value="available">
                        Disponibles ({allAvailableChallenges.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                        Archivés ({archivedChallenges.length})
                    </TabsTrigger>
                </TabsList>

                {/* Active Challenges */}
                <TabsContent value="active" className="mt-6">
                    {activeChallenges.length === 0 ? (
                        <div className="text-center py-12">
                            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                Aucun défi actif. Rejoignez un défi pour commencer!
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {activeChallenges.map((uc) => (
                                <ChallengeCard
                                    key={uc.id}
                                    challenge={uc.challenge}
                                    userChallenge={uc}
                                />
                            ))}
                        </div>
                    )}

                    {/* Completed Challenges */}
                    {completedChallenges.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Défis complétés</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {completedChallenges.map((uc) => (
                                    <ChallengeCard
                                        key={uc.id}
                                        challenge={uc.challenge}
                                        userChallenge={uc}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Upcoming Challenges */}
                <TabsContent value="upcoming" className="mt-6">
                    {upcomingChallenges.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                Aucun défi prévu pour le futur.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {upcomingChallenges.map((uc) => (
                                <ChallengeCard
                                    key={uc.id}
                                    challenge={uc.challenge}
                                    userChallenge={uc}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Available Challenges */}
                <TabsContent value="available" className="mt-6">
                    {/* Period Filters */}
                    <div className="flex gap-2 mb-6">
                        <Button
                            variant={periodFilter === "ALL" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriodFilter("ALL")}
                        >
                            Tous
                        </Button>
                        <Button
                            variant={periodFilter === "YEARLY" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriodFilter("YEARLY")}
                        >
                            Annuel
                        </Button>
                        <Button
                            variant={periodFilter === "MONTHLY" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriodFilter("MONTHLY")}
                        >
                            Mensuel
                        </Button>
                        <Button
                            variant={periodFilter === "WEEKLY" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPeriodFilter("WEEKLY")}
                        >
                            Hebdomadaire
                        </Button>
                    </div>

                    {filteredAvailableChallenges.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                {periodFilter === "ALL"
                                    ? "Vous avez rejoint tous les défis disponibles! 🎉"
                                    : "Aucun défi disponible pour cette période."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredAvailableChallenges.map((challenge) => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    onJoin={(dates) => handleJoinChallenge(challenge.id, dates)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Archived Challenges */}
                <TabsContent value="archived" className="mt-6">
                    {archivedChallenges.length === 0 ? (
                        <div className="text-center py-12">
                            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                Aucun défi archivé.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {archivedChallenges.map((uc) => (
                                <ChallengeCard
                                    key={uc.id}
                                    challenge={uc.challenge}
                                    userChallenge={uc}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div >
    )
}
