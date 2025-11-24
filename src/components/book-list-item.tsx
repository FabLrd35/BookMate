"use client"

import { Card } from "@/components/ui/card"
import { Star, Calendar, BookOpen, Play, CheckCircle2, MoreVertical, Trash2, XCircle, Heart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DeleteBookDialog } from "@/components/delete-book-dialog"
import { StarRating } from "@/components/star-rating"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { updateBookStatus, toggleBookFavorite } from "@/app/actions/books"
import { useTransition, useState } from "react"
import { UpdateProgressDialog } from "@/components/update-progress-dialog"
import { AbandonBookDialog } from "@/components/abandon-book-dialog"
import { FinishBookDialog } from "@/components/finish-book-dialog"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

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
    const [isPending, startTransition] = useTransition()
    const [isFavorite, setIsFavorite] = useState(book.isFavorite)

    const handleCardClick = () => {
        router.push(`/books/${book.id}`)
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

    const handleStatusChange = (e: React.MouseEvent, newStatus: "READING" | "READ" | "ABANDONED") => {
        e.preventDefault()
        e.stopPropagation()
        startTransition(async () => {
            await updateBookStatus(book.id, newStatus)
        })
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
            className="group flex flex-col gap-3 p-3 sm:p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-center gap-3 sm:gap-4 w-full">
                {/* Book Cover */}
                <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted border group/cover">
                    <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-1 left-1 z-10 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all ${isFavorite ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover/cover:opacity-100"}`}
                    >
                        <Heart className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>
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
                    <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 sm:truncate group-hover:text-primary transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 sm:truncate">
                        {book.author.name}
                    </p>

                    {/* Rating (only for READ books) */}
                    {book.status === "READ" && (
                        <div className="flex items-center gap-2 mt-1">
                            {book.rating ? (
                                <StarRating rating={book.rating} size="sm" showValue />
                            ) : (
                                <span className="text-xs text-muted-foreground italic">Pas de note</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    {/* Quick Actions */}
                    <div className="hidden sm:flex items-center gap-2">
                        {book.status === "TO_READ" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={(e) => handleStatusChange(e, "READING")}
                                disabled={isPending}
                            >
                                <Play className="h-3 w-3" /> Commencer
                            </Button>
                        )}
                        {book.status === "READING" && (
                            <>
                                <UpdateProgressDialog
                                    bookId={book.id}
                                    currentProgress={book.currentPage || 0}
                                    title={book.title}
                                    trigger={
                                        <Button size="sm" variant="outline">
                                            Mettre à jour
                                        </Button>
                                    }
                                />
                                <FinishBookDialog
                                    bookId={book.id}
                                    title={book.title}
                                    trigger={
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            disabled={isPending}
                                        >
                                            <CheckCircle2 className="h-3 w-3" /> Terminer
                                        </Button>
                                    }
                                />
                                <AbandonBookDialog bookId={book.id} title={book.title} />
                            </>
                        )}
                        {book.status === "ABANDONED" && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={(e) => handleStatusChange(e, "READING")}
                                disabled={isPending}
                            >
                                <Play className="h-3 w-3" /> Reprendre
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <DeleteBookDialog
                                        bookId={book.id}
                                        title={book.title}
                                        trigger={<span className="w-full text-red-600 flex items-center gap-2"><Trash2 className="h-4 w-4" /> Supprimer</span>}
                                    />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Menu (Dropdown) */}
                    <div className="sm:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {book.status === "TO_READ" && (
                                    <DropdownMenuItem onClick={(e) => handleStatusChange(e, "READING")}>
                                        <Play className="mr-2 h-4 w-4" /> Commencer
                                    </DropdownMenuItem>
                                )}
                                {book.status === "READING" && (
                                    <>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <UpdateProgressDialog
                                                bookId={book.id}
                                                currentProgress={book.currentPage || 0}
                                                title={book.title}
                                                trigger={<span className="w-full flex items-center gap-2"><BookOpen className="h-4 w-4" /> Mettre à jour</span>}
                                            />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <FinishBookDialog
                                                bookId={book.id}
                                                title={book.title}
                                                trigger={<span className="w-full flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Terminer</span>}
                                            />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <AbandonBookDialog
                                                bookId={book.id}
                                                title={book.title}
                                                trigger={<span className="w-full text-red-600 flex items-center gap-2"><XCircle className="h-4 w-4" /> Abandonner</span>}
                                            />
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {book.status === "ABANDONED" && (
                                    <DropdownMenuItem onClick={(e) => handleStatusChange(e, "READING")}>
                                        <Play className="mr-2 h-4 w-4" /> Reprendre
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <DeleteBookDialog
                                        bookId={book.id}
                                        title={book.title}
                                        trigger={<span className="w-full text-red-600 flex items-center gap-2"><Trash2 className="h-4 w-4" /> Supprimer</span>}
                                    />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Status & Date */}
                    <div className="flex flex-col items-end justify-center gap-1 min-w-[80px] sm:min-w-[100px] text-right">
                        <span className="text-sm sm:text-base font-medium text-muted-foreground whitespace-nowrap">
                            {statusLabels[book.status]}
                        </span>
                        {displayDate && (
                            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(displayDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar (Full Width Row) */}
            {book.status === "READING" && (() => {
                const percentage = Math.round(((book.currentPage || 0) / (book.totalPages || 1)) * 100)

                let colors = {
                    text: "text-green-600 dark:text-green-400",
                    track: "bg-green-100 dark:bg-green-900/30",
                    indicator: "[&>*]:bg-green-500"
                }

                if (percentage < 30) {
                    colors = {
                        text: "text-red-600 dark:text-red-400",
                        track: "bg-red-100 dark:bg-red-900/30",
                        indicator: "[&>*]:bg-red-500"
                    }
                } else if (percentage < 70) {
                    colors = {
                        text: "text-orange-600 dark:text-orange-400",
                        track: "bg-orange-100 dark:bg-orange-900/30",
                        indicator: "[&>*]:bg-orange-500"
                    }
                }

                return (
                    <div className="w-full space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className={`font-bold ${colors.text}`}>
                                {percentage}%
                            </span>
                            <span className="text-muted-foreground">
                                {book.currentPage}/{book.totalPages} p.
                            </span>
                        </div>
                        <Progress
                            value={percentage}
                            className={`h-1.5 sm:h-2 ${colors.track} ${colors.indicator}`}
                        />
                    </div>
                )
            })()}
        </div>
    )
}
