"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createCustomChallenge } from "@/app/actions/challenges"
import { toast } from "sonner"

export function CreateChallengeDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [selectedPeriod, setSelectedPeriod] = useState("ANYTIME")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const period = formData.get("period") as string

        const data: any = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            challengeType: formData.get("challengeType") as string,
            target: parseInt(formData.get("target") as string),
            period: period === "CUSTOM" ? "ANYTIME" : period,
            icon: formData.get("icon") as string || "🎯",
        }

        if (period === "CUSTOM") {
            const startDateStr = formData.get("startDate") as string
            const endDateStr = formData.get("endDate") as string

            if (startDateStr) data.startDate = new Date(startDateStr)
            if (endDateStr) data.endDate = new Date(endDateStr)
        }

        const result = await createCustomChallenge(data)

        if (result.success) {
            toast.success("Défi créé avec succès!")
            setOpen(false)
            setSelectedPeriod("ANYTIME")
                ; (e.target as HTMLFormElement).reset()
        } else {
            toast.error(result.error || "Erreur lors de la création du défi")
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un défi
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Créer un défi personnalisé</DialogTitle>
                    <DialogDescription>
                        Définissez votre propre défi de lecture
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">Titre du défi</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Ex: Lire tous les classiques"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Décrivez votre défi..."
                            required
                            rows={3}
                        />
                    </div>

                    {/* Icon */}
                    <div>
                        <Label htmlFor="icon">Icône (emoji)</Label>
                        <Input
                            id="icon"
                            name="icon"
                            placeholder="📚"
                            maxLength={2}
                        />
                    </div>

                    {/* Challenge Type */}
                    <div>
                        <Label htmlFor="challengeType">Type de défi</Label>
                        <Select name="challengeType" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BOOK_COUNT">Nombre de livres</SelectItem>
                                <SelectItem value="PAGE_COUNT">Nombre de pages</SelectItem>
                                <SelectItem value="GENRE_DIVERSITY">Diversité de genres</SelectItem>
                                <SelectItem value="AUTHOR_DIVERSITY">Diversité d'auteurs</SelectItem>
                                <SelectItem value="LONG_BOOKS">Livres longs (+500 pages)</SelectItem>
                                <SelectItem value="REVIEW_COUNT">Nombre de critiques</SelectItem>
                                <SelectItem value="QUOTE_COUNT">Nombre de citations</SelectItem>
                                <SelectItem value="READING_STREAK">Jours consécutifs</SelectItem>
                                <SelectItem value="COLLECTION_SIZE">Taille de collection</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target */}
                    <div>
                        <Label htmlFor="target">Objectif</Label>
                        <Input
                            id="target"
                            name="target"
                            type="number"
                            min="1"
                            placeholder="Ex: 10"
                            required
                        />
                    </div>

                    {/* Period */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="period">Période</Label>
                            <Select
                                name="period"
                                value={selectedPeriod}
                                onValueChange={setSelectedPeriod}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANYTIME">Sans limite</SelectItem>
                                    <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                                    <SelectItem value="MONTHLY">Mensuel</SelectItem>
                                    <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                                    <SelectItem value="YEARLY">Annuel</SelectItem>
                                    <SelectItem value="CUSTOM">Personnalisé (Dates précises)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedPeriod === "CUSTOM" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">Date de début</Label>
                                    <Input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        required
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">Date de fin</Label>
                                    <Input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Création..." : "Créer le défi"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
