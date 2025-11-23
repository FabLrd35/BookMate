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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateBookStatus } from "@/app/actions/books"
import { toast } from "sonner"
import { StarRatingSelector } from "@/components/star-rating-selector"
import { useConfetti } from "@/hooks/use-confetti"

interface FinishBookDialogProps {
    bookId: string
    title?: string
    trigger?: React.ReactNode
    onOpenChange?: (open: boolean) => void
    initialRating?: number | null
    initialComment?: string | null
    initialDate?: Date | null
    targetStatus?: "READING" | "READ"
}

export function FinishBookDialog({
    bookId,
    title,
    trigger,
    onOpenChange,
    initialRating,
    initialComment,
    initialDate,
    targetStatus = "READ"
}: FinishBookDialogProps) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState<number>(initialRating || 0)
    const [comment, setComment] = useState(initialComment || "")
    const [date, setDate] = useState<Date>(initialDate ? new Date(initialDate) : new Date())
    const [isPending, startTransition] = useTransition()
    const { celebrate } = useConfetti()

    const isFinishMode = targetStatus === "READ"

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    const handleSubmit = () => {
        startTransition(async () => {
            try {
                await updateBookStatus(bookId, targetStatus, {
                    rating: rating > 0 ? rating : undefined,
                    comment: comment.trim() || undefined,
                    finishDate: isFinishMode && date ? date.toISOString() : undefined,
                })

                if (isFinishMode) {
                    toast.success(initialRating ? "Critique mise à jour ! 📝" : "Félicitations ! Livre terminé 🎉")
                    celebrate() // 🎊 Confetti!
                } else {
                    toast.success("Critique enregistrée ! 📝")
                }

                setOpen(false)
            } catch (error) {
                toast.error("Une erreur est survenue")
                console.error(error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Terminer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isFinishMode
                            ? "Bravo ! Vous avez terminé ce livre"
                            : "Noter ce livre"}
                    </DialogTitle>
                    <DialogDescription>
                        {isFinishMode
                            ? "Prenez un moment pour noter votre lecture et ajouter un commentaire."
                            : "Partagez votre avis sur votre lecture en cours."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Votre note</Label>
                        <StarRatingSelector
                            value={rating}
                            onChange={setRating}
                            size="md"
                        />
                    </div>

                    {isFinishMode && (
                        <div className="space-y-2">
                            <Label htmlFor="date">Date de fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "d MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="comment">Votre avis (optionnel)</Label>
                        <Textarea
                            id="comment"
                            placeholder={isFinishMode ? "Qu'avez-vous pensé de ce livre ?" : "Vos impressions jusqu'ici..."}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                        {isPending ? "Enregistrement..." : (isFinishMode ? "Terminer le livre" : "Enregistrer")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
