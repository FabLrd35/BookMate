"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronUp, ChevronDown, Trophy, X, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateTopBooks } from "@/app/actions/top-books"
import { toast } from "sonner"

type Book = {
    id: string
    title: string
    coverUrl: string | null
    rating: number | null
    author: {
        name: string
    }
}

type TopBooksEditorProps = {
    year: number
    availableBooks: Book[]
    initialSelection: string[]
    onSave: () => void
    onCancel: () => void
}

export function TopBooksEditor({ year, availableBooks, initialSelection, onSave, onCancel }: TopBooksEditorProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const selectedBooks = selectedIds
        .map(id => availableBooks.find(b => b.id === id))
        .filter(Boolean) as Book[]

    const filteredAvailableBooks = availableBooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.name.toLowerCase().includes(searchQuery.toLowerCase())
        const notSelected = !selectedIds.includes(book.id)
        return matchesSearch && notSelected
    })

    const handleAddBook = (bookId: string) => {
        if (selectedIds.length < 10) {
            setSelectedIds([...selectedIds, bookId])
        }
    }

    const handleRemoveBook = (bookId: string) => {
        setSelectedIds(selectedIds.filter(id => id !== bookId))
    }

    const handleMoveUp = (index: number) => {
        if (index > 0) {
            const newIds = [...selectedIds]
                ;[newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]]
            setSelectedIds(newIds)
        }
    }

    const handleMoveDown = (index: number) => {
        if (index < selectedIds.length - 1) {
            const newIds = [...selectedIds]
                ;[newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]]
            setSelectedIds(newIds)
        }
    }

    const handleSave = async () => {
        if (selectedIds.length !== 10) {
            toast.error("Vous devez sélectionner exactement 10 livres")
            return
        }

        setIsSaving(true)
        const result = await updateTopBooks(year, selectedIds)
        setIsSaving(false)

        if (result.success) {
            toast.success("Top 10 sauvegardé !")
            onSave()
        } else {
            toast.error(result.error || "Erreur lors de la sauvegarde")
        }
    }

    return (
        <div className="space-y-6">
            {/* Selected Books */}
            <div>
                <h3 className="text-lg font-semibold mb-3">
                    Votre Top 10 ({selectedIds.length}/10)
                </h3>
                <div className="space-y-2">
                    {selectedBooks.map((book, index) => (
                        <Card key={book.id} className="border-2 border-primary/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    {/* Position */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30">
                                        <span className="text-lg font-bold text-primary">
                                            {index + 1}
                                        </span>
                                    </div>

                                    {/* Cover */}
                                    {book.coverUrl ? (
                                        <Image
                                            src={book.coverUrl}
                                            alt={book.title}
                                            width={40}
                                            height={60}
                                            className="w-10 h-15 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-15 bg-muted rounded flex items-center justify-center">
                                            <Trophy className="h-4 w-4" />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                                        <p className="text-xs text-muted-foreground">{book.author.name}</p>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            title="Monter"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === selectedIds.length - 1}
                                            title="Descendre"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveBook(book.id)}
                                            title="Retirer"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {selectedIds.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Sélectionnez vos 10 livres préférés ci-dessous
                        </div>
                    )}
                </div>
            </div>

            {/* Available Books */}
            <div>
                <h3 className="text-lg font-semibold mb-3">
                    Livres disponibles
                </h3>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un livre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                    {filteredAvailableBooks.map((book) => (
                        <Card
                            key={book.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleAddBook(book.id)}
                        >
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    {book.coverUrl ? (
                                        <Image
                                            src={book.coverUrl}
                                            alt={book.title}
                                            width={40}
                                            height={60}
                                            className="w-10 h-15 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-15 bg-muted rounded flex items-center justify-center">
                                            <Trophy className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                                        <p className="text-xs text-muted-foreground">{book.author.name}</p>
                                    </div>
                                    {book.rating && (
                                        <div className="text-xs flex items-center gap-1">
                                            ⭐ {book.rating}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={selectedIds.length !== 10 || isSaving}
                >
                    {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
            </div>
        </div>
    )
}
