"use client"

import { Button } from "@/components/ui/button"
import { Play, CheckCircle2, Star, XCircle } from "lucide-react"
import { updateBookStatus } from "@/app/actions/books"
import { useTransition } from "react"
import { FinishBookDialog } from "@/components/finish-book-dialog"
import { AbandonBookDialog } from "@/components/abandon-book-dialog"

interface BookStatusActionsProps {
    bookId: string
    status: "TO_READ" | "READING" | "READ" | "ABANDONED"
    currentRating?: number | null
    currentComment?: string | null
    finishDate?: Date | null
    title: string
}

export function BookStatusActions({
    bookId,
    status,
    currentRating,
    currentComment,
    finishDate,
    title
}: BookStatusActionsProps) {
    const [isPending, startTransition] = useTransition()

    const handleStatusChange = (newStatus: "READING" | "READ") => {
        startTransition(async () => {
            await updateBookStatus(bookId, newStatus)
        })
    }

    if (status === "TO_READ") {
        return (
            <Button
                className="w-full gap-2"
                onClick={() => handleStatusChange("READING")}
                disabled={isPending}
            >
                <Play className="h-4 w-4" /> Commencer
            </Button>
        )
    }

    if (status === "READING") {
        return (
            <div className="space-y-2 w-full">
                <FinishBookDialog
                    bookId={bookId}
                    trigger={
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            disabled={isPending}
                        >
                            <CheckCircle2 className="h-4 w-4" /> Terminer
                        </Button>
                    }
                />
                <AbandonBookDialog
                    bookId={bookId}
                    title={title}
                    trigger={
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                        >
                            <XCircle className="h-4 w-4" /> Abandonner
                        </Button>
                    }
                />
            </div>
        )
    }

    if (status === "READ") {
        return (
            <FinishBookDialog
                bookId={bookId}
                initialRating={currentRating}
                initialComment={currentComment}
                initialDate={finishDate}
                trigger={
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        disabled={isPending}
                    >
                        <Star className="h-4 w-4" /> {currentRating ? "Modifier ma critique" : "Ajouter une critique"}
                    </Button>
                }
            />
        )
    }

    if (status === "ABANDONED") {
        return (
            <div className="space-y-2 w-full">
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleStatusChange("READING")}
                    disabled={isPending}
                >
                    <Play className="h-3 w-3" /> Reprendre
                </Button>
                <AbandonBookDialog
                    bookId={bookId}
                    title={title}
                    initialRating={currentRating}
                    initialComment={currentComment}
                    isEditing={true}
                    trigger={
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2"
                            disabled={isPending}
                        >
                            <Star className="h-3 w-3" /> {currentRating ? "Modifier ma critique" : "Ajouter une critique"}
                        </Button>
                    }
                />
            </div>
        )
    }

    return null
}
