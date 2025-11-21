"use client"

import { QuickAddBookDialog } from "@/components/quick-add-book-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddToLibraryButtonProps {
    book: {
        id: string
        title: string
        authors: string[]
        coverUrl: string | null
        description: string | null
        pageCount: number | null
        categories: string[]
    }
}

export function AddToLibraryButton({ book }: AddToLibraryButtonProps) {
    return (
        <QuickAddBookDialog
            book={book}
            trigger={
                <Button size="lg" className="w-full">
                    <Plus className="mr-2 h-5 w-5" />
                    Ajouter à ma bibliothèque
                </Button>
            }
        />
    )
}
