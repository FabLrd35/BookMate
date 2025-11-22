"use client"

import { useState } from "react"
import { Check, Plus, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
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
import { addBookToCollection, removeBookFromCollection, createCollection } from "@/app/actions/collections"
import { Collection } from "@prisma/client"

interface AddToCollectionProps {
    bookId: string
    availableCollections: Collection[]
    bookCollections: Collection[]
}

export function AddToCollection({ bookId, availableCollections, bookCollections }: AddToCollectionProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newCollectionName, setNewCollectionName] = useState("")
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const bookCollectionIds = new Set(bookCollections.map(c => c.id))

    async function handleToggleCollection(collectionId: string, isSelected: boolean) {
        if (isSelected) {
            await removeBookFromCollection(collectionId, bookId)
            setSuccessMessage("Livre retiré de la collection")
        } else {
            await addBookToCollection(collectionId, bookId)
            setSuccessMessage("Livre ajouté à la collection")
        }
        setTimeout(() => setSuccessMessage(null), 2000)
    }

    async function handleCreateCollection() {
        if (!newCollectionName.trim()) return
        await createCollection(newCollectionName, undefined, bookId)
        setNewCollectionName("")
        setIsCreateOpen(false)
        setSuccessMessage("Collection créée et livre ajouté")
        setTimeout(() => setSuccessMessage(null), 2000)
    }

    const collectionCount = bookCollections.length

    return (
        <>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={collectionCount > 0 ? "secondary" : "outline"} className="w-full">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            {collectionCount > 0
                                ? `Dans ${collectionCount} collection${collectionCount > 1 ? 's' : ''}`
                                : "Ajouter à une collection"
                            }
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Mes Collections</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableCollections.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                                Aucune collection
                            </div>
                        ) : (
                            availableCollections.map((collection) => {
                                const isSelected = bookCollectionIds.has(collection.id)
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={collection.id}
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleCollection(collection.id, isSelected)}
                                    >
                                        {collection.name}
                                    </DropdownMenuCheckboxItem>
                                )
                            })
                        )}
                        <DropdownMenuSeparator />
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle collection
                            </DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>

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
