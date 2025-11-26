"use client"

import { useState } from "react"
import { Check, Plus, FolderPlus } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { updateBookCollections, createCollection } from "@/app/actions/collections"
import { Collection } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddToCollectionProps {
    bookId: string
    availableCollections: Collection[]
    bookCollections: Collection[]
}

export function AddToCollection({ bookId, availableCollections, bookCollections }: AddToCollectionProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newCollectionName, setNewCollectionName] = useState("")
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // État temporaire pour les sélections (IDs des collections)
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(
        new Set(bookCollections.map(c => c.id))
    )

    const collectionCount = bookCollections.length

    // Réinitialiser les sélections quand on ouvre le dialog
    function handleOpenChange(open: boolean) {
        if (open) {
            setSelectedCollectionIds(new Set(bookCollections.map(c => c.id)))
        }
        setIsOpen(open)
    }

    // Toggle une collection dans l'état temporaire
    function toggleCollection(collectionId: string) {
        setSelectedCollectionIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId)
            } else {
                newSet.add(collectionId)
            }
            return newSet
        })
    }

    // Valider les modifications
    async function handleValidate() {
        setIsLoading(true)

        const currentIds = new Set(bookCollections.map(c => c.id))
        const collectionIdsToAdd = Array.from(selectedCollectionIds).filter(id => !currentIds.has(id))
        const collectionIdsToRemove = Array.from(currentIds).filter(id => !selectedCollectionIds.has(id))

        await updateBookCollections(bookId, collectionIdsToAdd, collectionIdsToRemove)

        setIsLoading(false)
        setIsOpen(false)

        // Message de succès
        const addedCount = collectionIdsToAdd.length
        const removedCount = collectionIdsToRemove.length

        if (addedCount > 0 && removedCount > 0) {
            setSuccessMessage(`${addedCount} collection(s) ajoutée(s), ${removedCount} retirée(s)`)
        } else if (addedCount > 0) {
            setSuccessMessage(`Livre ajouté à ${addedCount} collection(s)`)
        } else if (removedCount > 0) {
            setSuccessMessage(`Livre retiré de ${removedCount} collection(s)`)
        } else {
            setSuccessMessage("Aucune modification")
        }

        setTimeout(() => setSuccessMessage(null), 2000)
    }

    async function handleCreateCollection() {
        if (!newCollectionName.trim()) return

        const formData = new FormData()
        formData.append("name", newCollectionName)
        formData.append("bookId", bookId)

        await createCollection(formData)
        setNewCollectionName("")
        setIsCreateOpen(false)
        setSuccessMessage("Collection créée et livre ajouté")
        setTimeout(() => setSuccessMessage(null), 2000)
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant={collectionCount > 0 ? "secondary" : "outline"} className="w-full">
                        <FolderPlus className="mr-2 h-4 w-4" />
                        {collectionCount > 0
                            ? `Dans ${collectionCount} collection${collectionCount > 1 ? 's' : ''}`
                            : "Ajouter à une collection"
                        }
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Gérer les collections</DialogTitle>
                        <DialogDescription>
                            Sélectionnez les collections auxquelles ajouter ce livre.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[300px] pr-4">
                        <div className="space-y-3 py-4">
                            {availableCollections.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    Aucune collection disponible
                                </div>
                            ) : (
                                availableCollections.map((collection) => (
                                    <div key={collection.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={collection.id}
                                            checked={selectedCollectionIds.has(collection.id)}
                                            onCheckedChange={() => toggleCollection(collection.id)}
                                        />
                                        <label
                                            htmlFor={collection.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {collection.name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="border-t pt-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle collection
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleValidate} disabled={isLoading}>
                            {isLoading ? "Enregistrement..." : "Valider"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog pour créer une nouvelle collection */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer une nouvelle collection</DialogTitle>
                        <DialogDescription>
                            Donnez un nom à votre nouvelle collection pour organiser vos livres.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input
                                id="name"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                className="col-span-3"
                                placeholder="ex: Favoris, Science-Fiction..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateCollection}>Créer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de succès */}
            <Dialog open={!!successMessage} onOpenChange={() => setSuccessMessage(null)}>
                <DialogContent className="sm:max-w-[300px] text-center">
                    <div className="py-4 flex flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-medium">{successMessage}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
