"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { getRouletteFilters } from "@/app/actions/roulette"

export type RouletteFilterState = {
    genres: string[]
    lengthFilter: "all" | "short" | "medium" | "long"
}

interface RouletteFiltersProps {
    filters: RouletteFilterState
    onFiltersChange: (filters: RouletteFilterState) => void
}

export function RouletteFilters({ filters, onFiltersChange }: RouletteFiltersProps) {
    const [availableGenres, setAvailableGenres] = useState<string[]>([])
    const [toReadCount, setToReadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadFilters() {
            const result = await getRouletteFilters()
            if (result.success) {
                setAvailableGenres(result.genres || [])
                setToReadCount(result.toReadCount || 0)
            }
            setLoading(false)
        }
        loadFilters()
    }, [])

    const toggleGenre = (genre: string) => {
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre]

        onFiltersChange({ ...filters, genres: newGenres })
    }

    const setLengthFilter = (length: "all" | "short" | "medium" | "long") => {
        onFiltersChange({ ...filters, lengthFilter: length })
    }

    const lengthOptions = [
        { value: "all", label: "Tous", pages: null },
        { value: "short", label: "Court", pages: "< 200 pages" },
        { value: "medium", label: "Moyen", pages: "200-400 pages" },
        { value: "long", label: "Long", pages: "> 400 pages" },
    ] as const

    return (
        <div className="space-y-6">
            {/* Info */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    {toReadCount} livre{toReadCount !== 1 ? 's' : ''} à lire dans votre bibliothèque
                </p>
            </div>

            {/* Genre Filter */}
            {availableGenres.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Genres</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableGenres.map(genre => (
                            <Badge
                                key={genre}
                                variant={filters.genres.includes(genre) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/90 transition-colors px-3 py-1.5"
                                onClick={() => toggleGenre(genre)}
                            >
                                {genre}
                            </Badge>
                        ))}
                    </div>
                    {filters.genres.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, genres: [] })}
                            className="text-xs"
                        >
                            Effacer la sélection
                        </Button>
                    )}
                </div>
            )}

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
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
