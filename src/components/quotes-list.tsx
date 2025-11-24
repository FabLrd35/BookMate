"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Quote as QuoteIcon } from "lucide-react"
import { UserQuoteCard } from "@/components/user-quote-card"
import { Pagination } from "@/components/ui/pagination"

type Quote = {
    id: string
    content: string
    page: string | null
    createdAt: Date
    book: {
        id: string
        title: string
        coverUrl: string | null
        author: {
            id: string
            name: string
        }
    }
}

interface QuotesListProps {
    quotes: Quote[]
}

const QUOTES_PER_PAGE = 12

export function QuotesList({ quotes }: QuotesListProps) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(quotes.length / QUOTES_PER_PAGE)
    const startIndex = (currentPage - 1) * QUOTES_PER_PAGE
    const endIndex = startIndex + QUOTES_PER_PAGE
    const currentQuotes = quotes.slice(startIndex, endIndex)

    if (quotes.length === 0) {
        return (
            <Card className="p-8 sm:p-12">
                <div className="text-center text-muted-foreground">
                    <QuoteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Aucune citation enregistrée pour le moment.</p>
                    <p className="text-xs sm:text-sm mt-2">Ajoutez des citations depuis les pages de vos livres !</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:gap-6">
                {currentQuotes.map((quote) => (
                    <UserQuoteCard key={quote.id} quote={quote} />
                ))}
            </div>

            {totalPages > 1 && (
                <>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                    />

                    <p className="text-center text-sm text-muted-foreground">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, quotes.length)} sur {quotes.length} citation{quotes.length > 1 ? 's' : ''}
                    </p>
                </>
            )}
        </div>
    )
}
