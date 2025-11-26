"use client"

import Image from "next/image"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"

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
    }
}

type TopBooksPodiumProps = {
    topBooks: TopBookWithBook[]
}

export function TopBooksPodium({ topBooks }: TopBooksPodiumProps) {
    const first = topBooks.find(tb => tb.position === 1)
    const second = topBooks.find(tb => tb.position === 2)
    const third = topBooks.find(tb => tb.position === 3)

    if (!first && !second && !third) {
        return null
    }

    return (
        <div className="flex items-end justify-center gap-4 md:gap-8 mb-8">
            {/* 2nd Place */}
            {second && (
                <PodiumCard
                    book={second.book}
                    position={2}
                    medal="🥈"
                    height="h-48"
                    gradient="from-gray-300 to-gray-400"
                />
            )}

            {/* 1st Place */}
            {first && (
                <PodiumCard
                    book={first.book}
                    position={1}
                    medal="🥇"
                    height="h-64"
                    gradient="from-yellow-400 to-yellow-600"
                />
            )}

            {/* 3rd Place */}
            {third && (
                <PodiumCard
                    book={third.book}
                    position={3}
                    medal="🥉"
                    height="h-40"
                    gradient="from-orange-400 to-orange-600"
                />
            )}
        </div>
    )
}

type PodiumCardProps = {
    book: {
        id: string
        title: string
        coverUrl: string | null
        rating: number | null
        author: {
            name: string
        }
    }
    position: number
    medal: string
    height: string
    gradient: string
}

function PodiumCard({ book, position, medal, height, gradient }: PodiumCardProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            {/* Book Cover */}
            <Link href={`/books/${book.id}`} className="group relative">
                <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    {book.coverUrl ? (
                        <Image
                            src={book.coverUrl}
                            alt={book.title}
                            width={150}
                            height={225}
                            className="w-32 h-48 object-cover"
                        />
                    ) : (
                        <div className="w-32 h-48 bg-muted flex items-center justify-center">
                            <Trophy className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </Card>
                {/* Medal Badge */}
                <div className="absolute -top-3 -right-3 text-4xl animate-bounce">
                    {medal}
                </div>
            </Link>

            {/* Podium */}
            <div className={`w-32 ${height} bg-gradient-to-b ${gradient} rounded-t-lg shadow-lg flex flex-col items-center justify-start pt-4 transition-all duration-300`}>
                <div className="text-white font-bold text-3xl mb-2">{position}</div>
                <div className="text-white/90 text-xs text-center px-2 line-clamp-2 font-medium">
                    {book.title}
                </div>
                <div className="text-white/70 text-xs mt-1">
                    {book.author.name}
                </div>
                {book.rating && (
                    <div className="text-white/90 text-sm mt-2 flex items-center gap-1">
                        ⭐ {book.rating}
                    </div>
                )}
            </div>
        </div>
    )
}
