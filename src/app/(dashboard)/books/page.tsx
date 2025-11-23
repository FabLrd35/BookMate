import { prisma } from "@/lib/prisma"
import { BookList } from "@/components/book-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function BooksPage() {
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

    const books = await prisma.book.findMany({
        where: { userId: user.id },
        include: {
            author: true,
            genre: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    }).then(books => books.map(book => ({
        ...book,
        rating: book.rating === null ? null : Number(book.rating)
    })))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Livres</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Gérez et organisez votre collection de lecture.
                    </p>
                </div>
                <Link href="/books/add">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un livre
                    </Button>
                </Link>
            </div>

            {/* Book List with Tabs */}
            <BookList books={books} />
        </div>
    )
}
