import { prisma } from "@/lib/prisma"
import { QuotesList } from "@/components/quotes-list"
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

            {/* Quotes List with Pagination */}
            <QuotesList quotes={quotes} />
        </div>
    )
}
