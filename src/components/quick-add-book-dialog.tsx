"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { quickAddBook } from "@/app/actions/books"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRatingSelector } from "@/components/star-rating-selector"
import { useConfetti } from "@/hooks/use-confetti"

interface QuickAddBookDialogProps {
    book: {
        id: string
        title: string
        authors: string[]
        coverUrl: string | null
        description: string | null
        pageCount: number | null
        categories: string[]
    }
    trigger: React.ReactNode
}

export function QuickAddBookDialog({ book, trigger }: QuickAddBookDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState<"TO_READ" | "READING" | "READ">("TO_READ")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [rating, setRating] = useState<number | null>(null)
    const [comment, setComment] = useState("")
    const [currentPage, setCurrentPage] = useState<number | null>(null)
    const [startDate, setStartDate] = useState<Date | undefined>(new Date())
    const [finishDate, setFinishDate] = useState<Date | undefined>(new Date())
    const { quickCelebrate } = useConfetti()

    async function handleSubmit() {
        setIsSubmitting(true)
        try {
            const result = await quickAddBook({
                title: book.title,
                author: book.authors[0] || "Auteur inconnu",
                coverUrl: book.coverUrl,
                description: book.description,
                pageCount: book.pageCount,
                categories: book.categories,
                status,
                currentPage: status === "READING" ? currentPage : null,
                startDate: status === "READING" ? startDate : (status === "READ" ? startDate : null),
                rating: status === "READ" && rating ? rating.toString() : null,
                comment: status === "READ" ? comment : null,
                finishDate: status === "READ" && finishDate ? finishDate.toISOString() : null,
            })

            if (result.success && result.bookId) {
                toast.success("Livre ajouté à votre bibliothèque!")
                quickCelebrate() // 🎊 Confetti!
                setOpen(false)
                router.push(`/books/${result.bookId}`)
            } else {
                toast.error(result.error || "Échec de l'ajout du livre")
            }
        } catch (error) {
            console.error("Error adding book:", error)
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Ajouter à ma bibliothèque</DialogTitle>
                    <DialogDescription>
                        Choisissez le statut de lecture pour ce livre
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                    {/* Book Preview */}
                    <div className="flex gap-4 py-4 border-b">
                        <div className="flex-shrink-0 w-20 h-28 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded overflow-hidden relative">
                            {book.coverUrl ? (
                                <Image
                                    src={book.coverUrl}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {book.authors.join(", ")}
                            </p>
                            {book.pageCount && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {book.pageCount} pages
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-3 py-4">
                        <label className="text-sm font-medium">
                            Statut de lecture
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <label
                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${status === "TO_READ"
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-border hover:border-blue-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="TO_READ"
                                    checked={status === "TO_READ"}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="sr-only"
                                />
                                <span className="font-medium text-sm text-center">À lire</span>
                            </label>
                            <label
                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${status === "READING"
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                    : "border-border hover:border-orange-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="READING"
                                    checked={status === "READING"}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="sr-only"
                                />
                                <span className="font-medium text-sm text-center">En cours</span>
                            </label>
                            <label
                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${status === "READ"
                                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border-border hover:border-green-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value="READ"
                                    checked={status === "READ"}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="sr-only"
                                />
                                <span className="font-medium text-sm text-center">Déjà lu</span>
                            </label>
                        </div>
                    </div>

                    {/* Additional Fields for READING status */}
                    {status === "READING" && (
                        <div className="space-y-4 py-2 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="currentPage">Page actuelle (optionnel)</Label>
                                <Input
                                    id="currentPage"
                                    type="number"
                                    min="0"
                                    max={book.pageCount || undefined}
                                    placeholder={book.pageCount ? `Sur ${book.pageCount} pages` : "Numéro de page"}
                                    value={currentPage || ""}
                                    onChange={(e) => setCurrentPage(e.target.value ? parseInt(e.target.value) : null)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Date de début</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "d MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(d) => d && setStartDate(d)}
                                            initialFocus
                                            locale={fr}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}

                    {/* Additional Fields for READ status */}
                    {status === "READ" && (
                        <div className="space-y-4 py-2 border-t">
                            <div className="space-y-2">
                                <Label>Votre note</Label>
                                <StarRatingSelector
                                    value={rating || 0}
                                    onChange={setRating}
                                    size="md"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Date de début</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "d MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(d) => d && setStartDate(d)}
                                            initialFocus
                                            locale={fr}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="finishDate">Date de fin</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !finishDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {finishDate ? format(finishDate, "d MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={finishDate}
                                            onSelect={(d) => d && setFinishDate(d)}
                                            initialFocus
                                            locale={fr}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">Votre avis (optionnel)</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Qu'avez-vous pensé de ce livre ?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t mt-auto">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Ajout...
                            </>
                        ) : (
                            "Ajouter"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
