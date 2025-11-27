"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChallengeCard } from "@/components/challenge-card"
import { CreateChallengeDialog } from "@/components/create-challenge-dialog"
import { Trophy, Target, Award, Archive } from "lucide-react"
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

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        // Initialize predefined challenges if needed
        await initializePredefinedChallenges()

        const [predefinedResult, userResult, badgesResult] = await Promise.all([
            getPredefinedChallenges(),
            getUserChallenges(),
            getUnlockedBadges(),
        ])

        if (predefinedResult.success) {
            setPredefinedChallenges(predefinedResult.challenges)
        }

        if (userResult.success) {
            setUserChallenges(userResult.userChallenges)
        }

        if (badgesResult.success) {
            setBadges(badgesResult.badges)
        }

        setLoading(false)
    }

    async function handleJoinChallenge(challengeId: string) {
        const result = await joinChallenge(challengeId)

        if (result.success) {
            toast.success("Défi rejoint avec succès!")
            loadData()
        } else {
            toast.error(result.error || "Erreur lors de l'ajout du défi")
        }
    }

    const activeChallenges = userChallenges.filter(uc => !uc.isCompleted && !uc.isArchived)
    const completedChallenges = userChallenges.filter(uc => uc.isCompleted && !uc.isArchived)
    const archivedChallenges = userChallenges.filter(uc => uc.isArchived)
    const availableChallenges = predefinedChallenges.filter(
        pc => !userChallenges.some(uc => uc.challengeId === pc.id)
    )

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
            < Tabs defaultValue="active" className="w-full" >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">
                        Actifs ({activeChallenges.length})
                    </TabsTrigger>
                    <TabsTrigger value="available">
                        Disponibles ({availableChallenges.length})
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

                {/* Available Challenges */}
                <TabsContent value="available" className="mt-6">
                    {availableChallenges.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                Vous avez rejoint tous les défis disponibles! 🎉
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {availableChallenges.map((challenge) => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    onJoin={() => handleJoinChallenge(challenge.id)}
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
            </Tabs >
        </div >
    )
}
