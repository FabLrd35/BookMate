"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateBookStatus } from "@/app/actions/books"
import { XCircle, Star } from "lucide-react"
import { StarRatingSelector } from "@/components/star-rating-selector"

interface AbandonBookDialogProps {
    bookId: string
    title: string
    trigger?: React.ReactNode
    initialRating?: number | null
    initialComment?: string | null
    isEditing?: boolean
}

export function AbandonBookDialog({
    bookId,
    title,
    trigger,
    initialRating,
    initialComment,
    isEditing = false
}: AbandonBookDialogProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState(initialComment || "")
    const [rating, setRating] = useState<number | null>(initialRating || null)
    const [isPending, startTransition] = useTransition()

    const handleAbandon = () => {
        startTransition(async () => {
            await updateBookStatus(bookId, "ABANDONED", {
                comment: reason.trim() || undefined,
                rating: rating || undefined
            })
            setOpen(false)
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    >
                        <XCircle className="h-3 w-3" /> Abandonner
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Modifier la critique" : "Abandonner ce livre"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? `Modifiez votre note et votre commentaire pour "${title}".`
                            : `Êtes-vous sûr de vouloir abandonner "${title}" ? Vous pourrez toujours le reprendre plus tard.`
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Note (optionnelle)</Label>
                        <div className="flex items-center gap-4">
                            <StarRatingSelector
                                value={rating || 0}
                                onChange={setRating}
                                size="md"
                            />
                            {rating && (
                                <button
                                    type="button"
                                    onClick={() => setRating(null)}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Effacer
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">{isEditing ? "Commentaire" : "Raison (optionnelle)"}</Label>
                        <Textarea
                            id="reason"
                            placeholder={isEditing ? "Votre avis sur ce livre..." : "Pourquoi abandonnez-vous ce livre ? (ex: Pas accroché à l'histoire...)"}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Annuler
                    </Button>
                    <Button variant={isEditing ? "default" : "destructive"} onClick={handleAbandon} disabled={isPending}>
                        {isPending ? "Enregistrement..." : (isEditing ? "Enregistrer" : "Confirmer l'abandon")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
