"use client"

import Image from "next/image"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type TopBookWithBook = {
    position: number
    book: {
        id: string
        title: string
        coverUrl: string | null
        rating: number | null
        author: {
            name: string
        }
        genre?: {
            name: string
        } | null
    }
}

type TopBooksListProps = {
    topBooks: TopBookWithBook[]
}

export function TopBooksList({ topBooks }: TopBooksListProps) {
    const remainingBooks = topBooks.filter(tb => tb.position > 3).sort((a, b) => a.position - b.position)

    if (remainingBooks.length === 0) {
        return null
    }

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {remainingBooks.map((topBook) => (
                <Link key={topBook.position} href={`/books/${topBook.book.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                {/* Position Badge */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30">
                                    <span className="text-xl font-bold text-primary">
                                        {topBook.position}
                                    </span>
                                </div>

                                {/* Book Cover */}
                                <div className="flex-shrink-0">
                                    {topBook.book.coverUrl ? (
                                        <Image
                                            src={topBook.book.coverUrl}
                                            alt={topBook.book.title}
                                            width={60}
                                            height={90}
                                            className="w-16 h-24 object-cover rounded shadow-md"
                                        />
                                    ) : (
                                        <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                                            <Trophy className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                {/* Book Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                        {topBook.book.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {topBook.book.author.name}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {topBook.book.rating && (
                                            <div className="flex items-center gap-1 text-xs">
                                                <span>⭐</span>
                                                <span className="font-medium">{topBook.book.rating}</span>
                                            </div>
                                        )}
                                        {topBook.book.genre && (
                                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                                {topBook.book.genre.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
