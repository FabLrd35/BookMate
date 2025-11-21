"use client"

import { Card } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ReadingHeatmapProps {
    year: number
    activityMap: Record<string, number>
    onDayClick?: (date: string) => void
}

export function ReadingHeatmap({ year, activityMap, onDayClick }: ReadingHeatmapProps) {
    const generateYearDays = () => {
        const days = []
        const startDate = new Date(year, 0, 1)
        const firstDay = startDate.getDay()
        const daysToSubtract = firstDay === 0 ? 6 : firstDay - 1
        const gridStart = new Date(startDate)
        gridStart.setDate(gridStart.getDate() - daysToSubtract)
        for (let week = 0; week < 53; week++) {
            const weekDays = []
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(gridStart)
                currentDate.setDate(gridStart.getDate() + week * 7 + day)
                weekDays.push(currentDate)
            }
            days.push(weekDays)
        }
        return days
    }

    const weeks = generateYearDays()

    const getActivityLevel = (date: Date) => {
        const dateKey = date.toISOString().split('T')[0]
        const count = activityMap[dateKey] || 0
        if (count === 0) return 0
        if (count === 1) return 1
        if (count === 2) return 2
        if (count === 3) return 3
        return 4
    }

    const getColorClass = (level: number, isCurrentYear: boolean) => {
        if (!isCurrentYear) return "bg-muted/30"
        switch (level) {
            case 0:
                return "bg-muted hover:bg-muted/80"
            case 1:
                return "bg-green-100 dark:bg-green-950 hover:bg-green-200 dark:hover:bg-green-900"
            case 2:
                return "bg-green-300 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-700"
            case 3:
                return "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500"
            case 4:
                return "bg-green-700 dark:bg-green-400 hover:bg-green-800 dark:hover:bg-green-300"
            default:
                return "bg-muted"
        }
    }

    const formatTooltip = (date: Date, count: number) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }
        const dateStr = date.toLocaleDateString('fr-FR', options)
        if (count === 0) return `${dateStr}\nAucune activité`
        if (count === 1) return `${dateStr}\n1 livre`
        return `${dateStr}\n${count} livres`
    }

    return (
        <Card className="p-3 sm:p-4 w-full max-w-full min-w-0">
            <div className="space-y-3 sm:space-y-4">
                {/* Legend */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xs sm:text-sm font-medium">Activité {year}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">Moins</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-muted border" />
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-100 dark:bg-green-950 border" />
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-300 dark:bg-green-800 border" />
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-500 dark:bg-green-600 border" />
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-700 dark:bg-green-400 border" />
                        </div>
                        <span className="hidden sm:inline">Plus</span>
                    </div>
                </div>

                {/* Weeks grid */}
                {/* Weeks grid */}
                {/* Weeks grid */}
                <TooltipProvider delayDuration={0}>
                    {/* IMPORTANT: min-w-0 sur le wrapper pour casser le min-content sizing */}
                    <div className="min-w-0 max-w-full">
                        {/* min-w-max = largeur naturelle de la grille, mais confinée au scroll interne */}
                        <div className="flex flex-wrap sm:flex-nowrap gap-[1px] sm:gap-1">
                            {weeks.map((week, weekIndex) => (
                                <div
                                    key={weekIndex}
                                    className="flex flex-col gap-[2px] sm:gap-1 shrink-0"
                                >
                                    {week.map((day, dayIndex) => {
                                        const level = getActivityLevel(day)
                                        const count = activityMap[day.toISOString().split("T")[0]] || 0
                                        const isInYear = day.getFullYear() === year

                                        return (
                                            <Tooltip key={dayIndex}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        className={`w-[6px] h-[6px] sm:w-3 sm:h-3 rounded-[2px] sm:rounded-sm border border-border/50 transition-colors ${getColorClass(level, isInYear)}`}
                                                        onClick={() =>
                                                            isInYear && onDayClick?.(day.toISOString().split("T")[0])
                                                        }
                                                        disabled={!isInYear}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="whitespace-pre-line text-xs">
                                                        {formatTooltip(day, count)}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </TooltipProvider>

            </div>
        </Card>
    )
}
