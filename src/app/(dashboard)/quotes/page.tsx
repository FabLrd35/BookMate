import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Quote as QuoteIcon, BookOpen } from "lucide-react"
import Link from "next/link"

export default async function QuotesPage() {
    const quotes = await prisma.quote.findMany({
        include: {
            book: {
                include: {
                    author: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Citations</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Toutes vos citations préférées en un seul endroit.
                </p>
            </div>

            {/* Quotes List */}
            {quotes.length === 0 ? (
                <Card className="p-8 sm:p-12">
                    <div className="text-center text-muted-foreground">
                        <QuoteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Aucune citation enregistrée pour le moment.</p>
                        <p className="text-xs sm:text-sm mt-2">Ajoutez des citations depuis les pages de vos livres !</p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6">
                    {quotes.map((quote) => (
                        <Card key={quote.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-4 sm:pt-6">
                                <blockquote className="italic text-base sm:text-lg text-foreground/90 mb-3 sm:mb-4 border-l-4 border-primary pl-3 sm:pl-4">
                                    "{quote.content}"
                                </blockquote>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                                    <Link
                                        href={`/books/${quote.book.id}`}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors min-w-0"
                                    >
                                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="font-medium truncate">{quote.book.title}</span>
                                        <span className="hidden sm:inline">par {quote.book.author.name}</span>
                                    </Link>
                                    <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground text-xs">
                                        {quote.page && (
                                            <span>Page {quote.page}</span>
                                        )}
                                        <span>
                                            {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
