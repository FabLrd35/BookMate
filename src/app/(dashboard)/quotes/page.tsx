import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Quote as QuoteIcon } from "lucide-react"
import { UserQuoteCard } from "@/components/user-quote-card"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function QuotesPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        redirect("/login")
    }

    const quotes = await prisma.quote.findMany({
        where: { userId: user.id },
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
                        <UserQuoteCard key={quote.id} quote={quote} />
                    ))}
                </div>
            )}
        </div>
    )
}
