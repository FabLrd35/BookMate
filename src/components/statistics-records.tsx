"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Timer, BookOpen, Star, Flame, Zap } from "lucide-react"
import Image from "next/image"

interface RecordItemProps {
    title: string
    value: string | number
    subtext?: string
    icon: React.ReactNode
    book?: {
        title: string
        coverUrl: string | null
        author: { name: string } | null
    } | null
    color: string
}

function RecordItem({ title, value, subtext, icon, book, color }: RecordItemProps) {
    return (
        <Card className="overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-3 opacity-10 ${color}`}>
                {icon}
            </div>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className={`p-2 rounded-lg w-fit ${color} bg-opacity-10`}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <h4 className="text-2xl font-bold mt-1">{value}</h4>
                            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                        </div>
                    </div>
                    {book && (
                        <div className="relative w-12 h-16 rounded overflow-hidden shadow-sm flex-shrink-0 ml-4">
                            {book.coverUrl ? (
                                <Image
                                    src={book.coverUrl}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-[8px] text-center p-1">
                                    {book.title}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {book && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{book.author?.name}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface StatisticsRecordsProps {
    records: any
    streaks: {
        current: number
        longest: number
    }
}

export function StatisticsRecords({ records, streaks }: StatisticsRecordsProps) {
    if (!records) return null

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Records & Exploits</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <RecordItem
                    title="Série Actuelle"
                    value={`${streaks.current} jours`}
                    subtext="Continuez comme ça !"
                    icon={<Flame className="h-5 w-5 text-orange-500" />}
                    color="bg-orange-500 text-orange-500"
                />
                <RecordItem
                    title="Plus Longue Série"
                    value={`${streaks.longest} jours`}
                    subtext="Votre meilleur record"
                    icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    color="bg-yellow-500 text-yellow-500"
                />
                <RecordItem
                    title="Lecture la plus rapide"
                    value={records.fastestRead ? `${records.fastestRead.duration} jours` : "-"}
                    subtext="Du début à la fin"
                    icon={<Zap className="h-5 w-5 text-blue-500" />}
                    book={records.fastestRead}
                    color="bg-blue-500 text-blue-500"
                />
                <RecordItem
                    title="Le plus gros pavé"
                    value={records.thickestBook ? `${records.thickestBook.totalPages} pages` : "-"}
                    subtext="Un vrai défi !"
                    icon={<BookOpen className="h-5 w-5 text-purple-500" />}
                    book={records.thickestBook}
                    color="bg-purple-500 text-purple-500"
                />
                <RecordItem
                    title="Livre le mieux noté"
                    value={records.highestRatedBook ? `${Number(records.highestRatedBook.rating)}/5` : "-"}
                    subtext="Votre coup de cœur"
                    icon={<Star className="h-5 w-5 text-pink-500" />}
                    book={records.highestRatedBook}
                    color="bg-pink-500 text-pink-500"
                />
                <RecordItem
                    title="Lecture la plus longue"
                    value={records.slowestRead ? `${records.slowestRead.duration} jours` : "-"}
                    subtext="Une lecture savourée"
                    icon={<Timer className="h-5 w-5 text-green-500" />}
                    book={records.slowestRead}
                    color="bg-green-500 text-green-500"
                />
            </div>
        </div>
    )
}
