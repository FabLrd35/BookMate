'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, BookOpen } from 'lucide-react'
import { deleteWord } from '@/app/actions/words'
import { toast } from "sonner"
import Link from 'next/link'

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

interface WordListProps {
    initialWords: Word[]
}

export function WordList({ initialWords }: WordListProps) {
    const [words, setWords] = useState(initialWords)
    const [search, setSearch] = useState('')

    const filteredWords = words.filter((word) =>
        word.text.toLowerCase().includes(search.toLowerCase()) ||
        word.definition?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteWord(id)
            if (result.success) {
                setWords(words.filter((w) => w.id !== id))
                toast.success('Mot supprimé', {
                    description: 'Le mot a été retiré de votre lexique.',
                })
            } else {
                toast.error('Erreur', {
                    description: 'Impossible de supprimer le mot.',
                })
            }
        } catch (error) {
            toast.error('Erreur', {
                description: 'Une erreur est survenue.',
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <Input
                    placeholder="Rechercher un mot..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWords.map((word) => (
                    <Card key={word.id} className="relative group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl capitalize">{word.text}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive/90"
                                    onClick={() => handleDelete(word.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm mb-4 min-h-[3rem]">
                                {word.definition || 'Pas de définition'}
                            </p>
                            {word.book && (
                                <div className="flex items-center text-xs text-muted-foreground mt-2 pt-2 border-t">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    <span className="truncate">Vu dans : {word.book.title}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredWords.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Aucun mot trouvé.
                </div>
            )}
        </div>
    )
}
