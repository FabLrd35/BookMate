"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus } from "lucide-react"

interface DiscoveredBook {
    id: string
    title: string
    authors: string[]
    coverUrl: string | null
    description: string | null
}

interface DiscoveredBookCardProps {
    book: DiscoveredBook
    authorName: string
    hideAddButton?: boolean
}

export function DiscoveredBookCard({ book, authorName, hideAddButton }: DiscoveredBookCardProps) {
    // Create URL params for pre-filling the add book form
    const addBookUrl = `/books/add?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(authorName)}&cover=${encodeURIComponent(book.coverUrl || '')}`

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 flex-1">
                <div className="relative w-full h-48 mb-3 rounded-md overflow-hidden bg-muted">
                    {book.coverUrl ? (
                        <Image
                            src={book.coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>
                    )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {book.authors.join(", ")}
                </p>
                {book.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                        {book.description}
                    </p>
                )}
            </CardContent>
            {!hideAddButton && (
                <CardFooter className="p-4 pt-0">
                    <Button asChild size="sm" className="w-full">
                        <Link href={addBookUrl}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
