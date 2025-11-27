"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthYearPickerProps {
    currentDate: Date
    onDateChange: (date: Date) => void
    maxDate?: Date
    className?: string
}

export function MonthYearPicker({ currentDate, onDateChange, maxDate, className }: MonthYearPickerProps) {
    const [open, setOpen] = useState(false)
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

    const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() - 1)
        onDateChange(newDate)
    }

    const handleNextMonth = () => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + 1)
        if (maxDate && newDate > maxDate) return
        onDateChange(newDate)
    }

    const handleApply = () => {
        const newDate = new Date(selectedYear, selectedMonth, 1)
        onDateChange(newDate)
        setOpen(false)
    }

    const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
    const isNextDisabled = maxDate ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1) > maxDate : false

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[180px] justify-between">
                        <span className="capitalize font-semibold">{monthName}</span>
                        <Calendar className="h-4 w-4 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="center">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Année</label>
                            <div className="grid grid-cols-5 gap-2">
                                {years.map(year => (
                                    <Button
                                        key={year}
                                        variant={selectedYear === year ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedYear(year)}
                                        className="h-9"
                                    >
                                        {year}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Mois</label>
                            <div className="grid grid-cols-3 gap-2">
                                {months.map((month, index) => (
                                    <Button
                                        key={month}
                                        variant={selectedMonth === index ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedMonth(index)}
                                        className="h-9"
                                    >
                                        {month.slice(0, 4)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleApply} className="w-full">
                            Appliquer
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isNextDisabled}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
