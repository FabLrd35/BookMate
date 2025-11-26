"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit } from "lucide-react"
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
import { updateSeries } from "@/app/actions/series"
import { toast } from "sonner"

interface RenameSeriesDialogProps {
    seriesId: string
    currentName: string
}

export function RenameSeriesDialog({ seriesId, currentName }: RenameSeriesDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(currentName)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        try {
            setIsSubmitting(true)
            const result = await updateSeries(seriesId, name)

            if (result.success) {
                toast.success("Saga renommée avec succès")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Erreur lors du renommage")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Renommer">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Renommer la saga</DialogTitle>
                    <DialogDescription>
                        Modifiez le nom de votre saga ci-dessous.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de la saga</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nom de la saga"
                            disabled={isSubmitting}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
