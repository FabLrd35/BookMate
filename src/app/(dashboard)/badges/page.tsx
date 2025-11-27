"use client"

import { useEffect, useState } from "react"
import { BadgeDisplay } from "@/components/badge-display"
import { Award, Trophy } from "lucide-react"
import { getUnlockedBadges } from "@/app/actions/challenges"
import { BADGES, BadgeDefinition } from "@/lib/badges"

export default function BadgesPage() {
    const [unlockedBadges, setUnlockedBadges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBadges()
    }, [])

    async function loadBadges() {
        setLoading(true)
        const result = await getUnlockedBadges()
        if (result.success) {
            setUnlockedBadges(result.badges)
        }
        setLoading(false)
    }

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

    // Group badges by category for better display
    const categories: Record<string, string> = {
        'READING': 'Lectures',
        'PAGES': 'Pages',
        'STREAK': 'Séries',
        'SOCIAL': 'Social',
        'CHALLENGE': 'Défis',
        'SPECIAL': 'Spécial'
    }

    const groupedBadges = BADGES.reduce((acc, badge) => {
        if (!acc[badge.category]) acc[badge.category] = []
        acc[badge.category].push(badge)
        return acc
    }, {} as Record<string, BadgeDefinition[]>)

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-500" />
                    Mes Badges
                </h1>
                <p className="text-muted-foreground">
                    Collectionnez des badges en relevant des défis et en atteignant des objectifs de lecture!
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <span className="font-medium text-foreground">{unlockedBadges.length}</span> badges débloqués sur <span className="font-medium text-foreground">{BADGES.length}</span>
                </div>
            </div>

            {Object.entries(groupedBadges).map(([category, badges]) => (
                <div key={category} className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">
                        {categories[category] || category}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {badges.map((badgeDef) => {
                            const unlocked = unlockedBadges.find(ub => ub.name === badgeDef.name)
                            return (
                                <BadgeDisplay
                                    key={badgeDef.id}
                                    badge={unlocked || badgeDef}
                                    locked={!unlocked}
                                />
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
