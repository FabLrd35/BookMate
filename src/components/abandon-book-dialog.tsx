"use client"

import { useState, useTransition } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateBookStatus } from "@/app/actions/books"
import { XCircle } from "lucide-react"

interface AbandonBookDialogProps {
    bookId: string
    title: string
    trigger?: React.ReactNode
}

export function AbandonBookDialog({ bookId, title, trigger }: AbandonBookDialogProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleAbandon = () => {
        startTransition(async () => {
            await updateBookStatus(bookId, "ABANDONED", {
                comment: reason.trim() || undefined
            })
            setOpen(false)
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    >
                        <XCircle className="h-3 w-3" /> Abandonner
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Abandonner ce livre</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir abandonner "{title}" ? Vous pourrez toujours le reprendre plus tard.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Raison (optionnelle)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Pourquoi abandonnez-vous ce livre ? (ex: Pas accroché à l'histoire...)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleAbandon} disabled={isPending}>
                        {isPending ? "Abandon en cours..." : "Confirmer l'abandon"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
