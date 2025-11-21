"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { getReadingActivityForDay } from "@/app/actions/reading-activity"
import { BookOpen, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface DayActivityDialogProps {
    date: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Activity = {
    id: string
    activityType: string
    book: {
        id: string
        title: string
        coverUrl: string | null
        author: {
            name: string
        }
    }
}

export function DayActivityDialog({ date, open, onOpenChange }: DayActivityDialogProps) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && date) {
            loadActivities()
        }
    }, [open, date])

    async function loadActivities() {
        if (!date) return

        setLoading(true)
        const result = await getReadingActivityForDay(date)
        if (result.success) {
            setActivities(result.activities as Activity[])
        }
        setLoading(false)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getActivityLabel = (type: string) => {
        switch (type) {
            case 'STARTED':
                return '📖 Commencé'
            case 'READING':
                return '📚 Lu'
            case 'FINISHED':
                return '✅ Terminé'
            default:
                return '📖 Lu'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {date ? formatDate(date) : 'Activité du jour'}
                    </DialogTitle>
                    <DialogDescription>
                        Votre activité de lecture pour cette journée
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Aucune activité enregistrée ce jour
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {activities.map((activity) => (
                            <Link
                                key={activity.id}
                                href={`/books/${activity.book.id}`}
                                className="flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex-shrink-0 w-12 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded overflow-hidden relative">
                                    {activity.book.coverUrl ? (
                                        <Image
                                            src={activity.book.coverUrl}
                                            alt={activity.book.title}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm line-clamp-2">
                                        {activity.book.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {activity.book.author.name}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {getActivityLabel(activity.activityType)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
