"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { getRouletteFilters } from "@/app/actions/roulette"

export type RouletteFilterState = {
    lengthFilter: "all" | "short" | "medium" | "long"
}

interface RouletteFiltersProps {
    filters: RouletteFilterState
    onFiltersChange: (filters: RouletteFilterState) => void
}

export function RouletteFilters({ filters, onFiltersChange }: RouletteFiltersProps) {
    const [counts, setCounts] = useState({
        total: 0,
        short: 0,
        medium: 0,
        long: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadFilters() {
            const result = await getRouletteFilters()
            if (result.success && result.counts) {
                setCounts(result.counts)
            }
            setLoading(false)
        }
        loadFilters()
    }, [])

    const setLengthFilter = (length: "all" | "short" | "medium" | "long") => {
        onFiltersChange({ ...filters, lengthFilter: length })
    }

    const lengthOptions = [
        { value: "all", label: "Tous", pages: null, count: counts.total },
        { value: "short", label: "Court", pages: "< 200 pages", count: counts.short },
        { value: "medium", label: "Moyen", pages: "200-400 pages", count: counts.medium },
        { value: "long", label: "Long", pages: "> 400 pages", count: counts.long },
    ] as const

    return (
        <div className="space-y-6">
            {/* Info */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    {counts.total} livre{counts.total !== 1 ? 's' : ''} à lire dans votre bibliothèque
                </p>
            </div>

            {/* Length Filter */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Longueur</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {lengthOptions.map(option => (
                        <Button
                            key={option.value}
                            variant={filters.lengthFilter === option.value ? "default" : "outline"}
                            onClick={() => setLengthFilter(option.value)}
                            className="h-auto py-3 flex flex-col gap-1"
                            size="sm"
                        >
                            <div className="font-semibold text-sm">{option.label}</div>
                            {option.pages && (
                                <div className="text-xs opacity-80">{option.pages}</div>
                            )}
                            <div className="text-xs font-medium mt-1 bg-background/20 px-2 py-0.5 rounded-full">
                                {loading ? "..." : `${option.count} livre${option.count !== 1 ? 's' : ''}`}
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}

