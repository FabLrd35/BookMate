"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"

interface Challenge {
    id: string
    title: string
    description: string
    challengeType: string
    target: number
    period: string
    icon: string | null
    isPredefined: boolean
}

interface UserChallenge {
    id: string
    progress: number
    isCompleted: boolean
    completedAt: Date | null
    startedAt: Date
    startDate?: Date | null
    endDate?: Date | null
    challenge: Challenge
}

interface ChallengeCardProps {
    challenge: Challenge
    userChallenge?: UserChallenge
    onJoin?: () => void
}

export function ChallengeCard({ challenge, userChallenge, onJoin }: ChallengeCardProps) {
    const progress = userChallenge?.progress || 0
    const percentage = Math.min((progress / challenge.target) * 100, 100)
    const isCompleted = userChallenge?.isCompleted || false

    const getPeriodLabel = (period: string) => {
        if (userChallenge?.startDate && userChallenge?.endDate) {
            const start = new Date(userChallenge.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
            const end = new Date(userChallenge.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
            return `${start} - ${end}`
        }

        switch (period) {
            case "WEEKLY": return "Hebdomadaire"
            case "MONTHLY": return "Mensuel"
            case "QUARTERLY": return "Trimestriel"
            case "YEARLY": return "Annuel"
            case "ANYTIME": return "Sans limite"
            default: return period
        }
    }

    return (
        <Card className={`p-6 transition-all ${isCompleted ? 'border-green-500 dark:border-green-700' : ''}`}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-5xl flex-shrink-0">
                    {challenge.icon || "🎯"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                            {challenge.title}
                        </h3>
                        {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {challenge.description}
                    </p>

                    {/* Period badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {getPeriodLabel(challenge.period)}
                        </Badge>
                        {!challenge.isPredefined && (
                            <Badge variant="secondary" className="text-xs">
                                Personnalisé
                            </Badge>
                        )}
                    </div>

                    {/* Progress or Join button */}
                    {userChallenge ? (
                        <>
                            <Progress value={percentage} className="h-2 mb-2" />
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    {progress} / {challenge.target}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round(percentage)}%
                                </p>
                            </div>
                            {isCompleted && (
                                <div className="mt-3 p-2 bg-green-100 dark:bg-green-950 rounded-md">
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                        ✅ Défi complété! Félicitations!
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <Button onClick={onJoin} className="w-full mt-2" size="sm">
                            Rejoindre le défi
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}
