"use client"

import { useState } from "react"
import { updateCurrentPage } from "@/app/actions/books"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Pencil, BookOpen } from "lucide-react"

interface CurrentPageUpdaterProps {
    bookId: string
    initialPage: number | null
}

export function CurrentPageUpdater({ bookId, initialPage }: CurrentPageUpdaterProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [currentPage, setCurrentPage] = useState(initialPage || 0)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateCurrentPage(bookId, currentPage)
            setIsEditing(false)
        } catch (error) {
            console.error("Error updating current page:", error)
            alert("Échec de la mise à jour de la page")
        } finally {
            setIsSaving(false)
        }
    }

    if (!isEditing) {
        return (
            <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                    Page {currentPage}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="ml-2"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="currentPageInput" className="sr-only">
                Page actuelle
            </Label>
            <Input
                id="currentPageInput"
                type="number"
                min="0"
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                className="w-24"
                autoFocus
            />
            <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    setCurrentPage(initialPage || 0)
                    setIsEditing(false)
                }}
                disabled={isSaving}
            >
                Annuler
            </Button>
        </div>
    )
}
