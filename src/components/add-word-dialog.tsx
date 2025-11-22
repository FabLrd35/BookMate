'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Loader2 } from 'lucide-react'
import { addWord, fetchDefinition } from '@/app/actions/words'
import { toast } from "sonner"

interface AddWordDialogProps {
    bookId?: string
    trigger?: React.ReactNode
}

export function AddWordDialog({ bookId, trigger }: AddWordDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [definition, setDefinition] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const handleFetchDefinition = async () => {
        if (!text) return
        setFetching(true)
        try {
            const result = await fetchDefinition(text)
            if (result.success && result.definition) {
                setDefinition(result.definition)
                toast.success('Définition trouvée', {
                    description: 'La définition a été récupérée avec succès.',
                })
            } else {
                toast.error('Définition non trouvée', {
                    description: 'Impossible de trouver une définition pour ce mot.',
                })
            }
        } catch (error) {
            toast.error('Erreur', {
                description: 'Une erreur est survenue lors de la recherche.',
            })
        } finally {
            setFetching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await addWord({ text, definition, bookId })
            if (result.success) {
                toast.success('Mot ajouté', {
                    description: 'Le mot a été ajouté à votre lexique.',
                })
                setOpen(false)
                setText('')
                setDefinition('')
                router.refresh()
            } else {
                toast.error('Erreur', {
                    description: 'Impossible d\'ajouter le mot.',
                })
            }
        } catch (error) {
            toast.error('Erreur', {
                description: 'Une erreur est survenue.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un mot
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un nouveau mot</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="text">Mot</Label>
                        <div className="flex gap-2">
                            <Input
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Ex: Sérendipité"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleFetchDefinition}
                                disabled={!text || fetching}
                                title="Chercher la définition"
                            >
                                {fetching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="definition">Définition</Label>
                        <Textarea
                            id="definition"
                            value={definition}
                            onChange={(e) => setDefinition(e.target.value)}
                            placeholder="La définition du mot..."
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
