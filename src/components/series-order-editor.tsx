"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, ArrowDown, Save, Calendar, ListOrdered } from "lucide-react"
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
import { reorderSeriesBooks, autoSortSeriesBooks } from "@/app/actions/series"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Book {
    id: string
    title: string
    seriesOrder: number | null
    publishedDate: string | null
}

interface SeriesOrderEditorProps {
    seriesId: string
    books: Book[]
}

export function SeriesOrderEditor({ seriesId, books }: SeriesOrderEditorProps) {
    const [open, setOpen] = useState(false)
    const [orderedBooks, setOrderedBooks] = useState(books)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const moveBook = (index: number, direction: 'up' | 'down') => {
        const newBooks = [...orderedBooks]
        if (direction === 'up' && index > 0) {
            [newBooks[index], newBooks[index - 1]] = [newBooks[index - 1], newBooks[index]]
        } else if (direction === 'down' && index < newBooks.length - 1) {
            [newBooks[index], newBooks[index + 1]] = [newBooks[index + 1], newBooks[index]]
        }
        setOrderedBooks(newBooks)
    }

    const handleAutoSort = async () => {
        try {
            setIsSubmitting(true)
            const result = await autoSortSeriesBooks(seriesId)
            if (result.success) {
                toast.success("Livres triés par date de publication")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Erreur lors du tri")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSave = async () => {
        try {
            setIsSubmitting(true)
            const bookIds = orderedBooks.map(b => b.id)
            const result = await reorderSeriesBooks(seriesId, bookIds)
            if (result.success) {
                toast.success("Ordre enregistré avec succès")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Erreur lors de l'enregistrement")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset local state when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setOrderedBooks(books)
        }
        setOpen(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <ListOrdered className="h-4 w-4" />
                    Organiser
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Organiser la saga</DialogTitle>
                    <DialogDescription>
                        Modifiez l'ordre des livres ou triez-les automatiquement.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end mb-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAutoSort}
                        disabled={isSubmitting}
                        className="gap-2"
                        title="Trier par date de publication"
                    >
                        <Calendar className="h-3 w-3" />
                        Trier par date
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto border rounded-md divide-y">
                    {orderedBooks.map((book, index) => (
                        <div key={book.id} className="flex items-center justify-between p-3 bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {index + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-medium truncate text-sm">{book.title}</p>
                                    {book.publishedDate && (
                                        <p className="text-xs text-muted-foreground">
                                            {book.publishedDate.split('-')[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveBook(index, 'up')}
                                    disabled={index === 0 || isSubmitting}
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveBook(index, 'down')}
                                    disabled={index === orderedBooks.length - 1 || isSubmitting}
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting} className="gap-2">
                        <Save className="h-4 w-4" />
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
