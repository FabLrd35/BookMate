"use client"

import { Card } from "@/components/ui/card"
import { Star, Calendar, BookOpen } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { StarRating } from "@/components/star-rating"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type Book = {
    id: string
    title: string
    coverUrl: string | null
    rating: number | null
    comment: string | null
    status: "TO_READ" | "READING" | "READ" | "ABANDONED"
    currentPage: number | null
    totalPages: number | null
    startDate: Date | null
    finishDate: Date | null
    isFavorite: boolean
    author: {
        id: string
        name: string
    }
    genre: {
        id: string
        name: string
    } | null
}

interface BookListItemProps {
    book: Book
}

export function BookListItem({ book }: BookListItemProps) {
    const router = useRouter()

    const handleCardClick = () => {
        router.push(`/books/${book.id}`)
    }

    const statusLabels = {
        TO_READ: "À lire",
        READING: "En cours",
        READ: "Lu",
        ABANDONED: "Abandonné",
    }

    const formatDate = (date: Date | null) => {
        if (!date) return null
        return format(new Date(date), "dd/MM/yy", { locale: fr })
    }

    const displayDate = book.status === "READ" ? book.finishDate : book.startDate

    return (
        <div
            className="group flex items-center gap-4 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Book Cover */}
            <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted border">
                {book.coverUrl ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center p-1">
                        <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                    {book.title}
                </h3>
                <p className="text-muted-foreground truncate">
                    {book.author.name}
                </p>

                <div className="flex items-center gap-2 mt-1">
                    {book.rating ? (
                        <div className="flex items-center gap-2">
                            <StarRating rating={book.rating} size="sm" showValue />
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Pas de note</span>
                    )}
                </div>
            </div>

            {/* Status & Date */}
            <div className="flex flex-col items-end justify-center gap-1 min-w-[100px]">
                <span className="text-base font-medium text-muted-foreground">
                    {statusLabels[book.status]}
                </span>
                {displayDate && (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(displayDate)}
                    </span>
                )}
            </div>
        </div>
    )
}
