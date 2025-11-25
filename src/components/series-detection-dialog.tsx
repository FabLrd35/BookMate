"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Loader2, Check, X } from "lucide-react"
import { detectSeries, acceptSeriesSuggestion } from "@/app/actions/series"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type SeriesSuggestion = {
    seriesName: string
    books: Array<{ id: string; title: string; suggestedOrder: number }>
}

export function SeriesDetectionDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<SeriesSuggestion[]>([])
    const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set())

    const handleDetect = async () => {
        setLoading(true)
        try {
            const result = await detectSeries()
            if (result.success && result.suggestions) {
                setSuggestions(result.suggestions)
                if (result.suggestions.length === 0) {
                    toast.info("Aucune série détectée", {
                        description: "Essayez d'ajouter plus de livres du même auteur."
                    })
                }
            } else {
                toast.error(result.error || "Échec de la détection")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (suggestion: SeriesSuggestion) => {
        try {
            const result = await acceptSeriesSuggestion(
                suggestion.seriesName,
                suggestion.books.map(b => ({ id: b.id, order: b.suggestedOrder }))
            )

            if (result.success) {
                toast.success("Série créée avec succès")
                setAcceptedSuggestions(prev => new Set([...prev, suggestion.seriesName]))
            } else {
                toast.error(result.error || "Échec de la création de la série")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        }
    }

    const handleReject = (seriesName: string) => {
        setSuggestions(prev => prev.filter(s => s.seriesName !== seriesName))
        toast.info("Suggestion ignorée")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Détecter les séries
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Détection automatique des séries</DialogTitle>
                    <DialogDescription>
                        Analysez votre bibliothèque pour identifier automatiquement les séries de livres.
                    </DialogDescription>
                </DialogHeader>

                {suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Sparkles className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground text-center">
                            Cliquez sur le bouton ci-dessous pour analyser votre bibliothèque
                        </p>
                        <Button onClick={handleDetect} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lancer la détection
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {suggestions.length} série{suggestions.length > 1 ? 's' : ''} détectée{suggestions.length > 1 ? 's' : ''}
                            </p>
                            <Button onClick={handleDetect} variant="outline" size="sm" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Relancer
                            </Button>
                        </div>

                        {suggestions.map((suggestion) => {
                            const isAccepted = acceptedSuggestions.has(suggestion.seriesName)
                            return (
                                <Card key={suggestion.seriesName} className={isAccepted ? "opacity-50" : ""}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{suggestion.seriesName}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {suggestion.books.length} livre{suggestion.books.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            {isAccepted && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Check className="h-3 w-3" />
                                                    Acceptée
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 mb-4">
                                            {suggestion.books
                                                .sort((a, b) => a.suggestedOrder - b.suggestedOrder)
                                                .map((book) => (
                                                    <div
                                                        key={book.id}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <Badge variant="outline" className="w-8 justify-center">
                                                            {book.suggestedOrder}
                                                        </Badge>
                                                        <span>{book.title}</span>
                                                    </div>
                                                ))}
                                        </div>
                                        {!isAccepted && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleAccept(suggestion)}
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Accepter
                                                </Button>
                                                <Button
                                                    onClick={() => handleReject(suggestion.seriesName)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Ignorer
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
