"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSeries } from "@/app/actions/series"
import { DeleteSeriesButton } from "@/components/delete-series-button"

export function SeriesList() {
    const [series, setSeries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchSeries() {
            const result = await getSeries()
            if (result.success && result.series) {
                setSeries(result.series)
            } else {
                console.error(result.error)
            }
            setLoading(false)
        }
        fetchSeries()
    }, [])

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
                ))}
            </div>
        )
    }

    if (series.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune saga pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Utilisez la détection automatique ou créez une saga manuellement
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {series.map((s: any) => (
                <Link key={s.id} href={`/series/${s.id}`} className="block min-w-0 w-full">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="relative">
                            <div className="absolute top-4 right-4 z-10">
                                <DeleteSeriesButton seriesId={s.id} seriesName={s.name} />
                            </div>
                            <CardTitle className="line-clamp-1 pr-10">{s.name}</CardTitle>
                            {s.description && (
                                <CardDescription className="line-clamp-2">
                                    {s.description}
                                </CardDescription>
                            )}
                            <Badge variant="secondary" className="w-fit">
                                {s.books.length} livre{s.books.length > 1 ? 's' : ''}
                            </Badge>
                        </CardHeader>
                        <CardContent className="overflow-hidden">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent max-w-full">
                                {s.books.slice(0, 5).map((book: any) => (
                                    <div key={book.id} className="relative flex-shrink-0 group">
                                        <div className="relative w-16 h-24 rounded overflow-hidden bg-muted">
                                            {book.coverUrl ? (
                                                <Image
                                                    src={book.coverUrl}
                                                    alt={book.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        {book.seriesOrder && (
                                            <Badge
                                                variant="secondary"
                                                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                            >
                                                {book.seriesOrder}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                                {s.books.length > 5 && (
                                    <div className="flex-shrink-0 w-16 h-24 rounded bg-muted flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground">+{s.books.length - 5}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
