import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { BookCard } from "@/components/book-card"
import { auth } from "@/auth"
import { CollectionBookPicker } from "@/components/collection-book-picker"

interface CollectionPageProps {
    params: Promise<{ id: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return null
    }

    const collection = await prisma.collection.findUnique({
        where: { id },
        include: {
            books: {
                include: {
                    author: true,
                    genre: true,
                },
            },
        },
    })

    if (!collection) {
        notFound()
    }

    // Fetch all user books to determine which ones can be added
    const allUserBooks = await prisma.book.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            title: true,
            author: { select: { name: true } },
            coverUrl: true,
        },
        orderBy: { title: 'asc' }
    })

    // Filter out books already in the collection
    const collectionBookIds = new Set(collection.books.map(b => b.id))
    const availableBooks = allUserBooks.filter(book => !collectionBookIds.has(book.id))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/collections">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour aux collections
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <FolderOpen className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
                        <p className="text-muted-foreground">
                            {collection.books.length} livre{collection.books.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                {collection.books.length > 0 && (
                    <CollectionBookPicker
                        collectionId={collection.id}
                        availableBooks={availableBooks}
                    />
                )}
            </div>

            {collection.books.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Cette collection est vide.</p>
                    <div className="mt-4 flex justify-center">
                        <CollectionBookPicker
                            collectionId={collection.id}
                            availableBooks={availableBooks}
                            emptyState={true}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {collection.books.map((book) => (
                        <BookCard
                            key={book.id}
                            book={{
                                ...book,
                                rating: book.rating ? Number(book.rating) : null
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
