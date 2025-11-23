"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { deleteBook } from "@/app/actions/books"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteBookDialogProps {
    bookId: string
    title: string
    trigger?: React.ReactNode
}

export function DeleteBookDialog({ bookId, title, trigger }: DeleteBookDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteBook(bookId)
                if (result.success) {
                    toast.success("Livre supprimé")
                    setOpen(false)
                    router.push("/books")
                } else {
                    toast.error(result.error || "Erreur lors de la suppression")
                }
            } catch (error) {
                toast.error("Erreur lors de la suppression")
                console.error(error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="h-3 w-3" /> Supprimer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Supprimer ce livre</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{title}" ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? "Suppression..." : "Supprimer définitivement"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
