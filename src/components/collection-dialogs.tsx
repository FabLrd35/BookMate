"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { CollectionForm } from "./collection-form"

interface CreateCollectionDialogProps {
    createAction: (formData: FormData) => Promise<void>
}

export function CreateCollectionDialog({ createAction }: CreateCollectionDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Nouvelle Collection</span>
                    <span className="sm:hidden">Nouvelle</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer une collection</DialogTitle>
                    <DialogDescription>
                        Créez une nouvelle liste pour regrouper vos livres.
                    </DialogDescription>
                </DialogHeader>
                <CollectionForm
                    action={createAction}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

interface EditCollectionDialogProps {
    collection: {
        id: string
        name: string
        description: string | null
        color: string | null
        coverUrl: string | null
    }
    updateAction: (formData: FormData) => Promise<void>
    trigger?: React.ReactNode
}

export function EditCollectionDialog({ collection, updateAction, trigger }: EditCollectionDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier la collection</DialogTitle>
                </DialogHeader>
                <CollectionForm
                    action={updateAction}
                    defaultValues={{
                        name: collection.name,
                        description: collection.description || "",
                        color: collection.color || "",
                        coverUrl: collection.coverUrl || ""
                    }}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
