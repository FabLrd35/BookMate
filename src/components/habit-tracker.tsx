"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check, Flame, Calendar as CalendarIcon } from "lucide-react"
import { toggleReadingLog, getReadingLogs } from "@/app/actions/reading-logs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function HabitTracker() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [logs, setLogs] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        loadLogs()
    }, [currentDate.getFullYear()])

    async function loadLogs() {
        const result = await getReadingLogs(currentDate.getFullYear())
        if (result.success) {
            setLogs(result.logs.map((d: any) => {
                const date = new Date(d)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }))
        }
    }

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    // Calculate stats for current month
    const currentMonthLogs = logs.filter(dateStr => {
        const [year, month] = dateStr.split('-').map(Number)
        return year === currentDate.getFullYear() && month === currentDate.getMonth() + 1
    })

    // Calculate current streak
    const calculateStreak = () => {
        const sortedLogs = [...logs].sort().reverse()
        let streak = 0
        const today = new Date()

        for (let i = 0; i < sortedLogs.length; i++) {
            const logDate = new Date(sortedLogs[i])
            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)

            const logStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`
            const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, '0')}-${String(expectedDate.getDate()).padStart(2, '0')}`

            if (logStr === expectedStr) {
                streak++
            } else {
                break
            }
        }
        return streak
    }

    const currentStreak = calculateStreak()

    const handleToggle = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0, 0)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const dayStr = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${dayStr}`

        const isLogged = logs.includes(dateStr)

        setLogs(prev => isLogged ? prev.filter(d => d !== dateStr) : [...prev, dateStr])

        startTransition(async () => {
            const result = await toggleReadingLog(date)
            if (!result.success) {
                setLogs(prev => isLogged ? [...prev, dateStr] : prev.filter(d => d !== dateStr))
                toast.error("Erreur lors de la mise à jour")
            } else {
                toast.success(isLogged ? "Jour décoché" : "Jour coché !")
            }
        })
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold capitalize">
                        {monthName}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="font-medium">{currentMonthLogs.length} jours</span>
                        </div>
                        {currentStreak > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">{currentStreak} jours de suite</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="hover:bg-primary/10">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="hover:bg-primary/10">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-3">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                        <div key={d} className="text-muted-foreground font-semibold py-1">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startOffset }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0, 0)
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const dayStr = String(date.getDate()).padStart(2, '0')
                        const dateStr = `${year}-${month}-${dayStr}`
                        const isLogged = logs.includes(dateStr)

                        const today = new Date()
                        const todayYear = today.getFullYear()
                        const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
                        const todayDay = String(today.getDate()).padStart(2, '0')
                        const todayStr = `${todayYear}-${todayMonth}-${todayDay}`
                        const isToday = todayStr === dateStr

                        return (
                            <button
                                key={day}
                                onClick={() => handleToggle(day)}
                                disabled={isPending}
                                className={cn(
                                    "group relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200",
                                    "border-2 transform hover:scale-105 active:scale-95",
                                    isLogged
                                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                                        : "hover:bg-muted/50 border-transparent bg-secondary/40 hover:border-primary/20",
                                    isToday && !isLogged && "border-primary ring-2 ring-primary/20 ring-offset-2",
                                    isPending && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isLogged ? (
                                    <Check className="h-5 w-5 animate-in zoom-in-50 duration-200" />
                                ) : (
                                    <span className="group-hover:scale-110 transition-transform">
                                        {day}
                                    </span>
                                )}
                                {isToday && !isLogged && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {currentMonthLogs.length === 0 && (
                    <div className="mt-6 text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                        <p className="text-sm text-muted-foreground">
                            Commencez à cocher vos jours de lecture ! 📚
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
