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
            })

            if (result.success && result.bookId) {
                toast.success("Livre ajouté à votre bibliothèque!")
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ajouter à ma bibliothèque</DialogTitle>
                    <DialogDescription>
                        Choisissez le statut de lecture pour ce livre
                    </DialogDescription>
                </DialogHeader>

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

                {/* Actions */}
                <div className="flex gap-3 pt-4">
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
