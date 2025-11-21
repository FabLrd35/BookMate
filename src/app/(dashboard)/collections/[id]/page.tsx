import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { BookCard } from "@/components/book-card"

interface CollectionPageProps {
    params: Promise<{ id: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { id } = await params

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

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/collections">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux collections
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-3 border-b pb-4">
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

            {collection.books.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Cette collection est vide.</p>
                    <Button asChild className="mt-4" variant="outline">
                        <Link href="/books">
                            Parcourir ma bibliothèque
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {collection.books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            )}
        </div>
    )
}
