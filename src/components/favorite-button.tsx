"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleBookFavorite } from "@/app/actions/books"
import { toast } from "sonner"

interface FavoriteButtonProps {
    bookId: string
    isFavorite: boolean
}

export function FavoriteButton({ bookId, isFavorite: initialIsFavorite }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [isPending, startTransition] = useTransition()

    const handleToggleFavorite = async () => {
        const newStatus = !isFavorite
        setIsFavorite(newStatus)

        startTransition(async () => {
            const result = await toggleBookFavorite(bookId)
            if (!result.success) {
                setIsFavorite(!newStatus)
                toast.error("Erreur lors de la mise à jour des favoris")
            } else {
                toast.success(newStatus ? "Ajouté aux favoris" : "Retiré des favoris")
            }
        })
    }

    return (
        <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleToggleFavorite}
            disabled={isPending}
        >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        </Button>
    )
}
