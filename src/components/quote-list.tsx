"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Quote as QuoteIcon, Trash2, Plus, Edit2 } from "lucide-react"
import { addQuote, deleteQuote, updateQuote } from "@/app/actions/quotes"
import { Quote } from "@prisma/client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface QuoteListProps {
    bookId: string
    quotes: Quote[]
}

export function QuoteList({ bookId, quotes }: QuoteListProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null)
    const [content, setContent] = useState("")
    const [page, setPage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    function startEditing(quote: Quote) {
        setEditingQuoteId(quote.id)
        setContent(quote.content)
        setPage(quote.page || "")
        setIsAdding(false)
    }

    function cancelEdit() {
        setEditingQuoteId(null)
        setContent("")
        setPage("")
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            if (editingQuoteId) {
                await updateQuote(editingQuoteId, bookId, content, page)
                setEditingQuoteId(null)
            } else {
                await addQuote(bookId, content, page)
                setIsAdding(false)
            }
            setContent("")
            setPage("")
        } catch (error) {
            console.error("Failed to save quote:", error)
        } finally {
            setIsSubmitting(false)
        }
    }



    return (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <QuoteIcon className="h-5 w-5" />
                    Citations & Notes
                </CardTitle>
                {!isAdding && !editingQuoteId && (
                    <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {(isAdding || editingQuoteId) && (
                    <form onSubmit={handleSubmit} className="space-y-4 bg-muted/50 p-4 rounded-lg border">
                        <div className="space-y-2">
                            <Label htmlFor="content">Citation ou Note</Label>
                            <Textarea
                                id="content"
                                placeholder="Entrez votre citation ici..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="page">Page / Emplacement (optionnel)</Label>
                            <Input
                                id="page"
                                placeholder="ex: Page 42, Chapitre 3..."
                                value={page}
                                onChange={(e) => setPage(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={editingQuoteId ? cancelEdit : () => setIsAdding(false)}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Enregistrement..." : (editingQuoteId ? "Modifier" : "Enregistrer")}
                            </Button>
                        </div>
                    </form>
                )}

                {quotes.length === 0 && !isAdding ? (
                    <p className="text-center text-muted-foreground py-8">
                        Aucune citation enregistrée pour ce livre.
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {quotes.map((quote) => (
                            <div
                                key={quote.id}
                                className="relative group bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <blockquote className="italic text-lg text-foreground/90 mb-2 border-l-4 border-primary pl-4">
                                    "{quote.content}"
                                </blockquote>
                                <div className="flex items-center justify-between text-sm text-muted-foreground pl-4">
                                    <span>
                                        {quote.page ? `Page ${quote.page}` : "Emplacement non spécifié"}
                                    </span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs mr-2">
                                            {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => startEditing(quote)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            <span className="sr-only">Modifier</span>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Supprimer</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action est irréversible. Cela supprimera définitivement cette citation.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteQuote(quote.id, bookId)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
