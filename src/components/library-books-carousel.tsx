"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/book-card"

interface LibraryBooksCarouselProps {
    books: any[]
}

export function LibraryBooksCarousel({ books }: LibraryBooksCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of the visible width
            const newScrollLeft = direction === "left"
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount

            container.scrollTo({
                left: newScrollLeft,
                behavior: "smooth"
            })
        }
    }

    return (
        <div className="relative group">
            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background shadow-md border-primary/20 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Précédent</span>
                </Button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background shadow-md border-primary/20 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Suivant</span>
                </Button>
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {books.map((book) => (
                    <div key={book.id} className="min-w-[150px] w-[150px] sm:min-w-[180px] sm:w-[180px] snap-start flex-shrink-0 h-full">
                        <BookCard book={book} />
                    </div>
                ))}
            </div>
        </div>
    )
}
