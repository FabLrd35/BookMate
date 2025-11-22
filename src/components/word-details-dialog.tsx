"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen } from "lucide-react"
import Link from "next/link"

interface Word {
    id: string
    text: string
    definition: string | null
    bookId: string | null
    book?: {
        title: string
    } | null
    createdAt: Date
}

interface WordDetailsDialogProps {
    word: Word | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WordDetailsDialog({ word, open, onOpenChange }: WordDetailsDialogProps) {
    if (!word) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl capitalize flex items-center gap-2">
                        {word.text}
                    </DialogTitle>
                    <DialogDescription>
                        Ajouté le {new Date(word.createdAt).toLocaleDateString('fr-FR')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Définition
                        </h4>
                        <div className="p-4 bg-muted/50 rounded-lg text-base leading-relaxed">
                            {word.definition || "Aucune définition enregistrée."}
                        </div>
                    </div>

                    {word.book && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>Vu dans : <span className="font-medium text-foreground">{word.book.title}</span></span>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Link
                            href={`https://fr.wiktionary.org/wiki/${word.text}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Voir sur Wiktionary
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
