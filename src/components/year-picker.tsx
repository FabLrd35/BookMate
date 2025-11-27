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

interface YearPickerProps {
    currentYear: number
    onYearChange: (year: number) => void
    maxYear?: number
    className?: string
}

export function YearPicker({ currentYear, onYearChange, maxYear, className }: YearPickerProps) {
    const [open, setOpen] = useState(false)
    const [selectedYear, setSelectedYear] = useState(currentYear)

    const thisYear = maxYear || new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => thisYear - i)

    const handlePrevYear = () => {
        onYearChange(currentYear - 1)
    }

    const handleNextYear = () => {
        if (currentYear < thisYear) {
            onYearChange(currentYear + 1)
        }
    }

    const handleApply = () => {
        onYearChange(selectedYear)
        setOpen(false)
    }

    return (
        <div className={cn("flex items-center justify-center gap-4", className)}>
            <Button variant="outline" size="icon" onClick={handlePrevYear}>
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[140px] justify-between">
                        <span className="text-base sm:text-lg font-semibold">{currentYear}</span>
                        <Calendar className="h-4 w-4 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="center">
                    <div className="space-y-4">
                        <label className="text-sm font-medium block">Sélectionner une année</label>
                        <div className="grid grid-cols-2 gap-2">
                            {years.map(year => (
                                <Button
                                    key={year}
                                    variant={selectedYear === year ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedYear(year)}
                                    className="h-10"
                                >
                                    {year}
                                </Button>
                            ))}
                        </div>

                        <Button onClick={handleApply} className="w-full">
                            Appliquer
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={handleNextYear} disabled={currentYear >= thisYear}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
