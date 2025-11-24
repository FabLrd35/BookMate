"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RouletteFilters, RouletteFilterState } from "@/components/roulette-filters"
import { getRandomBook, RouletteBook } from "@/app/actions/roulette"
import { Dices, BookOpen, RotateCcw, ExternalLink } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Link from "next/link"

type AnimationState = "idle" | "spinning" | "revealing" | "result"

export function ReadingRouletteDialog() {
    const [open, setOpen] = useState(false)
    const [filters, setFilters] = useState<RouletteFilterState>({
        genres: [],
        lengthFilter: "all"
    })
    const [animationState, setAnimationState] = useState<AnimationState>("idle")
    const [selectedBook, setSelectedBook] = useState<RouletteBook | null>(null)
    const [spinningBooks, setSpinningBooks] = useState<RouletteBook[]>([])

    const handleSpin = async () => {
        setAnimationState("spinning")
        setSelectedBook(null)

        // Convert filters to API format
        const apiFilters = {
            genres: filters.genres.length > 0 ? filters.genres : undefined,
            minPages: filters.lengthFilter === "short" ? undefined :
                filters.lengthFilter === "medium" ? 200 :
                    filters.lengthFilter === "long" ? 400 : undefined,
            maxPages: filters.lengthFilter === "short" ? 200 :
                filters.lengthFilter === "medium" ? 400 :
                    filters.lengthFilter === "long" ? undefined : undefined
        }

        try {
            // Fetch the actual book
            const result = await getRandomBook(apiFilters)

            if (!result.success || !result.book) {
                toast.error(result.error || "Aucun livre trouvé")
                setAnimationState("idle")
                return
            }

            // Simulate spinning with multiple books (for animation)
            const dummyBooks: RouletteBook[] = Array(6).fill(null).map((_, i) => ({
                id: `dummy-${i}`,
                title: "...",
                author: "...",
                coverUrl: null,
                pageCount: null,
                genre: null,
                source: "library" as const
            }))
            setSpinningBooks(dummyBooks)

            // After 2 seconds of spinning, show revealing state
            setTimeout(() => {
                setAnimationState("revealing")
                setSelectedBook(result.book!)

                // After 1 second of revealing, show final result
                setTimeout(() => {
                    setAnimationState("result")
                }, 1000)
            }, 2000)

        } catch (error) {
            console.error("Error spinning roulette:", error)
            toast.error("Erreur lors de la sélection")
            setAnimationState("idle")
        }
    }

    const handleReset = () => {
        setAnimationState("idle")
        setSelectedBook(null)
        setSpinningBooks([])
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                size="lg"
                onClick={() => setOpen(true)}
                className="gap-2 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
                <Dices className="h-5 w-5" />
                Choisir un livre au hasard
            </Button>

            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                        <Dices className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        Roulette de Lecture
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Laissez le hasard choisir parmi vos livres à lire !
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Filters */}
                    {animationState === "idle" && (
                        <RouletteFilters filters={filters} onFiltersChange={setFilters} />
                    )}

                    {/* Spinning Animation */}
                    {animationState === "spinning" && (
                        <div className="py-8 sm:py-12">
                            <div className="relative h-48 sm:h-64 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin-slow flex gap-3 sm:gap-4">
                                        {spinningBooks.map((book, i) => (
                                            <div
                                                key={i}
                                                className="w-24 h-36 sm:w-32 sm:h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg blur-sm opacity-50 flex items-center justify-center flex-shrink-0"
                                            >
                                                <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-muted-foreground mt-4 animate-pulse text-sm sm:text-base">
                                Sélection en cours...
                            </p>
                        </div>
                    )}

                    {/* Revealing Animation */}
                    {animationState === "revealing" && selectedBook && (
                        <div className="py-8 sm:py-12">
                            <div className="flex justify-center animate-bounce-in">
                                <div className="w-40 h-60 sm:w-48 sm:h-72 relative bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-2xl">
                                    {selectedBook.coverUrl ? (
                                        <Image
                                            src={selectedBook.coverUrl}
                                            alt={selectedBook.title}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center p-4">
                                            <p className="text-center text-xs sm:text-sm font-medium text-muted-foreground line-clamp-4">
                                                {selectedBook.title}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {animationState === "result" && selectedBook && (
                        <div className="space-y-4 sm:space-y-6 animate-fade-in">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                {/* Book Cover */}
                                <div className="flex-shrink-0">
                                    <div className="w-40 h-60 sm:w-48 sm:h-72 relative bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-xl mx-auto sm:mx-0">
                                        {selectedBook.coverUrl ? (
                                            <Image
                                                src={selectedBook.coverUrl}
                                                alt={selectedBook.title}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center p-4">
                                                <p className="text-center text-xs sm:text-sm font-medium text-muted-foreground line-clamp-4">
                                                    {selectedBook.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Book Info */}
                                <div className="flex-1 space-y-3 sm:space-y-4">
                                    <div>
                                        <h3 className="text-lg sm:text-2xl font-bold">{selectedBook.title}</h3>
                                        <p className="text-base sm:text-lg text-muted-foreground mt-1">{selectedBook.author}</p>
                                    </div>

                                    {selectedBook.genre && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-medium">Genre:</span>
                                            <span className="text-xs sm:text-sm text-muted-foreground">{selectedBook.genre}</span>
                                        </div>
                                    )}

                                    {selectedBook.pageCount && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="text-xs sm:text-sm">{selectedBook.pageCount} pages</span>
                                        </div>
                                    )}


                                    {selectedBook.description && (
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-xs sm:text-sm font-medium">Résumé:</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4">
                                                {selectedBook.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 pt-4">
                                        <Link href={`/books/${selectedBook.id}`}>
                                            <Button className="w-full gap-2">
                                                <ExternalLink className="h-4 w-4" />
                                                Voir le livre
                                            </Button>
                                        </Link>
                                        <Button variant="outline" onClick={handleReset} className="w-full gap-2">
                                            <RotateCcw className="h-4 w-4" />
                                            Relancer la roulette
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Spin Button */}
                    {animationState === "idle" && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                onClick={handleSpin}
                                className="gap-2 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <Dices className="h-5 w-5" />
                                Lancer la roulette !
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
