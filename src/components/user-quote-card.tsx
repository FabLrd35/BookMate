"use client"

import { useState } from "react"
import { Quote as QuoteIcon, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Quote {
    id: string
    content: string
    page: number | null
    createdAt: Date
    book: {
        id: string
        title: string
        coverUrl: string | null
        author: {
            name: string
        }
    }
}

interface UserQuoteCardProps {
    quote: Quote
}

export function UserQuoteCard({ quote }: UserQuoteCardProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Card
                className="hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4 items-center">
                        {/* 1. Book Cover - Left */}
                        <Link
                            href={`/books/${quote.book.id}`}
                            className="flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-md overflow-hidden shadow-md group-hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                                {quote.book.coverUrl ? (
                                    <Image
                                        src={quote.book.coverUrl}
                                        alt={quote.book.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 56px, 64px"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </Link>

                        {/* 2. Book Info - Middle */}
                        <div className="flex flex-col justify-center min-w-0 w-24 sm:w-32 flex-shrink-0">
                            <Link
                                href={`/books/${quote.book.id}`}
                                className="group/link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 group-hover/link:text-primary transition-colors leading-tight">
                                    {quote.book.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {quote.book.author.name}
                                </p>
                            </Link>
                        </div>

                        {/* 3. Quote + Metadata - Right */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                            <blockquote className="relative italic text-xs sm:text-sm leading-relaxed text-foreground/90 line-clamp-3 break-words overflow-wrap-anywhere">
                                <QuoteIcon className="absolute -left-1 -top-1 h-3 w-3 text-primary/20" />
                                "{quote.content}"
                            </blockquote>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {quote.page && (
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                                        p. {quote.page}
                                    </span>
                                )}
                                <span className="whitespace-nowrap">
                                    {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
                                        day: 'numeric',
                                        month: 'short',
                                        year: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog pour voir la citation complète */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <div className="space-y-6 pt-2">
                        {/* Book Info with Cover */}
                        <div className="flex gap-4 items-start">
                            <Link
                                href={`/books/${quote.book.id}`}
                                className="flex-shrink-0"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="relative w-20 h-28 rounded-md overflow-hidden shadow-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                                    {quote.book.coverUrl ? (
                                        <Image
                                            src={quote.book.coverUrl}
                                            alt={quote.book.title}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/books/${quote.book.id}`}
                                    className="group/link"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <h3 className="font-bold text-lg group-hover/link:text-primary transition-colors">
                                        {quote.book.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        par {quote.book.author.name}
                                    </p>
                                </Link>

                                <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                                    {quote.page && (
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            Page {quote.page}
                                        </span>
                                    )}
                                    <span>
                                        {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Full Quote */}
                        <div className="relative">
                            <QuoteIcon className="absolute -left-2 -top-2 h-8 w-8 text-primary/10" />
                            <blockquote className="italic text-base sm:text-lg leading-relaxed text-foreground/90 pl-6">
                                "{quote.content}"
                            </blockquote>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Fermer
                            </Button>
                            <Link href={`/books/${quote.book.id}`}>
                                <Button onClick={() => setIsOpen(false)}>
                                    Voir le livre
                                </Button>
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
