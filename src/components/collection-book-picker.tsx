"use client"

import { useState, useTransition } from "react"
import { Check, Search, Plus, BookOpen } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addMultipleBooksToCollection } from "@/app/actions/collections"
import { toast } from "sonner"
import { useConfetti } from "@/hooks/use-confetti"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Book {
    id: string
    title: string
    author: { name: string }
    coverUrl: string | null
}

interface CollectionBookPickerProps {
    collectionId: string
    availableBooks: Book[]
    trigger?: React.ReactNode
    emptyState?: boolean
}

export function CollectionBookPicker({ collectionId, availableBooks, trigger, emptyState }: CollectionBookPickerProps) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()
    const { quickCelebrate } = useConfetti()

    const filteredBooks = availableBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleToggleBook = (bookId: string) => {
        const newSelected = new Set(selectedBookIds)
        if (newSelected.has(bookId)) {
            newSelected.delete(bookId)
        } else {
            newSelected.add(bookId)
        }
        setSelectedBookIds(newSelected)
    }

    const handleSubmit = () => {
        if (selectedBookIds.size === 0) return

        startTransition(async () => {
            try {
                await addMultipleBooksToCollection(collectionId, Array.from(selectedBookIds))
                toast.success(`${selectedBookIds.size} livre${selectedBookIds.size > 1 ? 's' : ''} ajouté${selectedBookIds.size > 1 ? 's' : ''} à la collection`)
                quickCelebrate()
                setOpen(false)
                setSelectedBookIds(new Set())
                setSearchQuery("")
            } catch (error) {
                toast.error("Une erreur est survenue lors de l'ajout des livres")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant={emptyState ? "default" : "outline"}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter des livres
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Ajouter des livres à la collection</DialogTitle>
                    <DialogDescription>
                        Sélectionnez les livres que vous souhaitez ajouter.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un livre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
                        {filteredBooks.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? "Aucun livre trouvé" : "Aucun livre disponible"}
                            </div>
                        ) : (
                            filteredBooks.map((book) => {
                                const isSelected = selectedBookIds.has(book.id)
                                return (
                                    <div
                                        key={book.id}
                                        className={cn(
                                            "relative group cursor-pointer rounded-lg border overflow-hidden transition-all",
                                            isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                                        )}
                                        onClick={() => handleToggleBook(book.id)}
                                    >
                                        <div className="aspect-[2/3] relative bg-muted">
                                            {book.coverUrl ? (
                                                <Image
                                                    src={book.coverUrl}
                                                    alt={book.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                        <Check className="h-6 w-6" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 text-sm">
                                            <p className="font-medium truncate">{book.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{book.author.name}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="flex items-center justify-between sm:justify-between border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedBookIds.size} livre{selectedBookIds.size > 1 ? 's' : ''} sélectionné{selectedBookIds.size > 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedBookIds.size === 0 || isPending}
                        >
                            {isPending ? "Ajout..." : "Ajouter"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
