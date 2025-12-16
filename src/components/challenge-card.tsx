"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, MoreVertical, Archive, RefreshCw, Plus, CalendarClock, PauseCircle, PlayCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { addManualProgress, archiveChallenge, relaunchChallenge, toggleChallengePause } from "@/app/actions/challenges"
import { toast } from "sonner"

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
    isArchived?: boolean
    isPaused?: boolean
    manualProgress?: number
}

interface ChallengeCardProps {
    challenge: Challenge
    userChallenge?: UserChallenge
    onJoin?: (dates?: { startDate: Date, endDate: Date }) => void
}

export function ChallengeCard({ challenge, userChallenge, onJoin }: ChallengeCardProps) {
    const [isManualProgressOpen, setIsManualProgressOpen] = useState(false)
    const [manualAmount, setManualAmount] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const progress = userChallenge?.progress || 0
    const percentage = Math.min((progress / challenge.target) * 100, 100)
    const isCompleted = userChallenge?.isCompleted || false
    const isPaused = userChallenge?.isPaused || false

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
    const handleAddProgress = async () => {
        if (!userChallenge) return
        setIsLoading(true)
        const result = await addManualProgress(userChallenge.id, manualAmount)
        setIsLoading(false)
        if (result.success) {
            toast.success("Progression ajoutée")
            setIsManualProgressOpen(false)
        } else {
            toast.error("Erreur lors de l'ajout de la progression")
        }
    }

    const handleArchive = async () => {
        if (!userChallenge) return
        const result = await archiveChallenge(userChallenge.id)
        if (result.success) {
            toast.success("Défi archivé")
        } else {
            toast.error("Erreur lors de l'archivage")
        }
    }

    const handleRelaunch = async () => {
        if (!userChallenge) return
        const result = await relaunchChallenge(userChallenge.id)
        if (result.success) {
            toast.success("Défi relancé")
        } else {
            toast.error("Erreur lors de la relance")
        }
    }

    const handleTogglePause = async () => {
        if (!userChallenge) return
        const newStatus = !isPaused
        const result = await toggleChallengePause(userChallenge.id, newStatus)
        if (result.success) {
            toast.success(newStatus ? "Défi mis en pause" : "Défi repris !")
        } else {
            toast.error("Erreur lors du changement de statut")
        }
    }

    return (
        <>
            <Card className={`flex flex-col h-full bg-card hover:bg-accent/5 transition-colors ${isPaused ? 'opacity-75 border-dashed' : ''} ${isCompleted ? 'border-green-500 dark:border-green-700' : ''}`}>
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                    {challenge.title}
                                </h3>
                                {isPaused && (
                                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                        En pause
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                    {getPeriodLabel(challenge.period)}
                                </Badge>
                            </div>
                        </div>
                        {/* Icon placeholder if we had dynamic icons, for now just a generic one or none */}
                        {userChallenge ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {!isCompleted && !isPaused && (
                                        <DropdownMenuItem onClick={() => setIsManualProgressOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter progression
                                        </DropdownMenuItem>
                                    )}

                                    {!isCompleted && (
                                        <DropdownMenuItem onClick={handleTogglePause}>
                                            {isPaused ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
                                            {isPaused ? "Reprendre" : "Mettre en pause"}
                                        </DropdownMenuItem>
                                    )}

                                    {(isCompleted || userChallenge.isArchived) && (
                                        <DropdownMenuItem onClick={handleRelaunch}>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Recommencer
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleArchive} className="text-red-600 focus:text-red-600">
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archiver
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">
                        {challenge.description}
                    </p>

                    {userChallenge ? (
                        <>
                            <div className="mt-4 space-y-2">
                                <Progress value={percentage} className="h-2" />
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>
                                        {Math.round(percentage)}%
                                    </span>
                                    <span>
                                        {progress} / {challenge.target}
                                    </span>
                                </div>
                            </div>
                            {isCompleted && (
                                <div className="mt-3 p-2 bg-green-100 dark:bg-green-950 rounded-md flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                        Défi complété !
                                    </p>
                                </div>
                            )}
                            {isPaused && (
                                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-md flex items-center gap-2">
                                    <PauseCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                                        Défi en pause
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="mt-4 pt-4 border-t">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="w-full" size="sm">
                                        Rejoindre le défi
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuItem onClick={() => onJoin?.()}>
                                        <Clock className="mr-2 h-4 w-4" />
                                        Commencer maintenant
                                    </DropdownMenuItem>

                                    {challenge.period === "WEEKLY" && (
                                        <DropdownMenuItem onClick={() => {
                                            const now = new Date()
                                            const nextMonday = new Date(now)
                                            nextMonday.setDate(now.getDate() + (8 - now.getDay())) // Next Monday
                                            nextMonday.setHours(0, 0, 0, 0)

                                            const nextMondayEnd = new Date(nextMonday)
                                            nextMondayEnd.setDate(nextMonday.getDate() + 6)
                                            nextMondayEnd.setHours(23, 59, 59, 999)

                                            onJoin?.({ startDate: nextMonday, endDate: nextMondayEnd })
                                        }}>
                                            <CalendarClock className="mr-2 h-4 w-4" />
                                            Semaine prochaine
                                        </DropdownMenuItem>
                                    )}

                                    {challenge.period === "MONTHLY" && (
                                        <DropdownMenuItem onClick={() => {
                                            const now = new Date()
                                            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
                                            const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)

                                            onJoin?.({ startDate: nextMonth, endDate: nextMonthEnd })
                                        }}>
                                            <CalendarClock className="mr-2 h-4 w-4" />
                                            Mois prochain
                                        </DropdownMenuItem>
                                    )}

                                    {challenge.period === "YEARLY" && (
                                        <DropdownMenuItem onClick={() => {
                                            const nextYear = new Date(2026, 0, 1)
                                            const nextYearEnd = new Date(2026, 11, 31, 23, 59, 59, 999)

                                            onJoin?.({ startDate: nextYear, endDate: nextYearEnd })
                                        }}>
                                            <CalendarClock className="mr-2 h-4 w-4" />
                                            Prévoir pour 2026
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog open={isManualProgressOpen} onOpenChange={setIsManualProgressOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une progression manuelle</DialogTitle>
                        <DialogDescription>
                            Ajoutez manuellement des unités à votre défi (ex: BDs lues, pages, etc.)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Quantité
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={manualAmount}
                                onChange={(e) => setManualAmount(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManualProgressOpen(false)}>Annuler</Button>
                        <Button onClick={handleAddProgress} disabled={isLoading}>
                            {isLoading ? "Ajout..." : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
