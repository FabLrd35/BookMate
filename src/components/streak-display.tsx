"use client"

import { Card } from "@/components/ui/card"
import { Flame, Trophy } from "lucide-react"

interface StreakDisplayProps {
    currentStreak: number
    longestStreak: number
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
    const getMotivationalMessage = () => {
        if (currentStreak === 0) {
            return "Commencez une nouvelle série aujourd'hui!"
        } else if (currentStreak === 1) {
            return "Bon début! Continuez demain!"
        } else if (currentStreak < 7) {
            return "Vous êtes sur la bonne voie! 🎉"
        } else if (currentStreak < 30) {
            return "Excellente régularité! 🔥"
        } else {
            return "Incroyable! Vous êtes un lecteur assidu! 🌟"
        }
    }

    const isNewRecord = currentStreak > 0 && currentStreak === longestStreak

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Streak */}
            <Card className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${currentStreak > 0 ? 'bg-orange-100 dark:bg-orange-950' : 'bg-muted'}`}>
                        <Flame className={`h-6 w-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Série actuelle</p>
                        <p className="text-3xl font-bold mt-1">
                            {currentStreak} {currentStreak <= 1 ? 'jour' : 'jours'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {getMotivationalMessage()}
                        </p>
                        {isNewRecord && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                                <Trophy className="h-3 w-3" />
                                Nouveau record!
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Longest Streak */}
            <Card className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950">
                        <Trophy className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Record personnel</p>
                        <p className="text-3xl font-bold mt-1">
                            {longestStreak} {longestStreak <= 1 ? 'jour' : 'jours'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {longestStreak === 0
                                ? "Commencez à lire pour établir votre record!"
                                : longestStreak < 7
                                    ? "Continuez pour battre votre record!"
                                    : "Impressionnant! Pouvez-vous faire mieux?"
                            }
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
