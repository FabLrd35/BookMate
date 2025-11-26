"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Calendar, Play, CheckCircle2, BookOpen, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { updateBookStatus, toggleBookFavorite } from "@/app/actions/books"
import { useTransition, useState } from "react"
import { UpdateProgressDialog } from "@/components/update-progress-dialog"
import { AbandonBookDialog } from "@/components/abandon-book-dialog"
import { FinishBookDialog } from "@/components/finish-book-dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { StarRating } from "@/components/star-rating"

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

interface BookCardProps {
    book: Book
}

export function BookCard({ book }: BookCardProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isFavorite, setIsFavorite] = useState(book.isFavorite)

    const handleStatusChange = (e: React.MouseEvent, newStatus: "READING" | "READ" | "ABANDONED") => {
        e.preventDefault()
        e.stopPropagation()
        startTransition(async () => {
            await updateBookStatus(book.id, newStatus)
        })
    }

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const newStatus = !isFavorite
        setIsFavorite(newStatus)

        const result = await toggleBookFavorite(book.id)
        if (!result.success) {
            setIsFavorite(!newStatus)
            toast.error("Erreur lors de la mise à jour des favoris")
        } else {
            toast.success(newStatus ? "Ajouté aux favoris" : "Retiré des favoris")
        }
    }

    const handleCardClick = () => {
        router.push(`/books/${book.id}`)
    }

    const statusColors = {
        TO_READ: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        READING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        READ: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        ABANDONED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    }

    const statusLabels = {
        TO_READ: "À lire",
        READING: "En cours",
        READ: "Terminé",
        ABANDONED: "Abandonné",
    }

    // Calculate progress percentage
    const progressPercentage = book.currentPage && book.totalPages && book.totalPages > 0
        ? Math.min(Math.round((book.currentPage / book.totalPages) * 100), 100)
        : null

    return (
        <Card
            className="group overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full flex flex-col"
            onClick={handleCardClick}
        >
            {/* Book Cover */}
            <div className="relative aspect-[2/3] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-2 left-2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>

                {book.coverUrl ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center p-4">
                        <p className="text-center text-sm font-medium text-muted-foreground line-clamp-3">
                            {book.title}
                        </p>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[book.status]}`}>
                        {statusLabels[book.status]}
                    </span>
                </div>
            </div>

            {/* Book Info */}
            <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col">
                <div className="flex-1">
                    <h3 className="font-semibold sm:line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1">
                        {book.author.name}
                    </p>

                    {book.genre && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {book.genre.name}
                        </p>
                    )}

                    {/* Progress Bar for books being read */}
                    {book.status === "READING" && progressPercentage !== null && (
                        <div className="pt-3 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                    {progressPercentage}% complété
                                </span>
                                <span className="text-muted-foreground">
                                    {book.currentPage} / {book.totalPages} pages
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>
                    )}

                    {/* Current Page (only if no totalPages) */}
                    {book.status === "READING" && book.currentPage && !book.totalPages && (
                        <div className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 pt-2">
                            <BookOpen className="h-3 w-3" />
                            <span>Page {book.currentPage}</span>
                        </div>
                    )}

                    {/* Rating */}
                    {book.rating && (
                        <div className="pt-2">
                            <StarRating rating={book.rating} size="sm" />
                        </div>
                    )}

                    {/* Dates */}
                    {(book.startDate || book.finishDate) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
                            <Calendar className="h-3 w-3" />
                            {book.finishDate
                                ? `Terminé le ${new Date(book.finishDate).toLocaleDateString('fr-FR')}`
                                : book.startDate
                                    ? `Commencé le ${new Date(book.startDate).toLocaleDateString('fr-FR')}`
                                    : null}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="pt-3 mt-auto" onClick={(e) => e.stopPropagation()}>
                    {book.status === "TO_READ" && (
                        <Button
                            size="sm"
                            className="w-full gap-2"
                            onClick={(e) => handleStatusChange(e, "READING")}
                            disabled={isPending}
                        >
                            <Play className="h-3 w-3" /> Commencer
                        </Button>
                    )}
                    {book.status === "READING" && (
                        <div className="space-y-2 w-full">
                            <FinishBookDialog
                                bookId={book.id}
                                title={book.title}
                                trigger={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        disabled={isPending}
                                    >
                                        <CheckCircle2 className="h-3 w-3" /> Terminer
                                    </Button>
                                }
                            />
                            <UpdateProgressDialog
                                bookId={book.id}
                                currentProgress={book.currentPage || 0}
                                title={book.title}
                            />
                            <AbandonBookDialog bookId={book.id} title={book.title} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
