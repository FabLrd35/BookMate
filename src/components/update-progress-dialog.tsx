"use client"

import { useState } from "react"
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
import { updateCurrentPage } from "@/app/actions/books"
import { BookOpen } from "lucide-react"

interface UpdateProgressDialogProps {
    bookId: string
    currentProgress: number
    title: string
    trigger?: React.ReactNode
}

export function UpdateProgressDialog({ bookId, currentProgress, title, trigger }: UpdateProgressDialogProps) {
    const [open, setOpen] = useState(false)
    const [page, setPage] = useState(currentProgress)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await updateCurrentPage(bookId, page)
            setOpen(false)
        } catch (error) {
            console.error("Error updating progress:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 mt-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <BookOpen className="h-3 w-3" />
                        Mettre à jour la page
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Mettre à jour la progression</DialogTitle>
                    <DialogDescription>
                        Où en êtes-vous dans "{title}" ?
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="page" className="text-right">
                                Page
                            </Label>
                            <Input
                                id="page"
                                type="number"
                                min="0"
                                value={page}
                                onChange={(e) => setPage(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
