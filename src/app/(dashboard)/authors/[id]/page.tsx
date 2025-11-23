import { getAuthorById, discoverAuthorBooks } from "@/app/actions/authors"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, BookOpen, BookCheck, Star, Sparkles } from "lucide-react"
import { BookCard } from "@/components/book-card"
import { DiscoveredBookCard } from "@/components/discovered-book-card"

interface AuthorPageProps {
    params: Promise<{ id: string }>
}

export default async function AuthorPage({ params }: AuthorPageProps) {
    const { id } = await params

    const author = await getAuthorById(id)

    if (!author) {
        notFound()
    }

    // Calculate statistics
    const totalBooks = author.books.length
    const readBooks = author.books.filter(book => book.status === "READ")
    const booksRead = readBooks.length
    const ratingsSum = readBooks.reduce((sum, book) => sum + (book.rating ? Number(book.rating) : 0), 0)
    const averageRating = booksRead > 0 ? ratingsSum / booksRead : 0

    // Discover other books by this author
    const discoveredBooksResult = await discoverAuthorBooks(author.name, author.id)
    const discoveredBooks = discoveredBooksResult.success ? discoveredBooksResult.books : []

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/authors">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux auteurs
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-3 border-b pb-4">
                <div className="relative p-3 bg-primary/10 rounded-full overflow-hidden">
                    {author.photoUrl ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                                src={author.photoUrl}
                                alt={author.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </div>
                    ) : (
                        <User className="h-8 w-8 text-primary" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{author.name}</h1>
                    <p className="text-muted-foreground">
                        {totalBooks} livre{totalBooks > 1 ? "s" : ""} dans votre bibliothèque
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total de livres</p>
                        <p className="text-2xl font-bold">{totalBooks}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <BookCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Livres lus</p>
                        <p className="text-2xl font-bold">{booksRead}</p>
                    </div>
                </div>

                {averageRating > 0 && (
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                        <div className="p-2 bg-yellow-500/10 rounded-full">
                            <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Note moyenne</p>
                            <p className="text-2xl font-bold">{averageRating.toFixed(1)} ⭐</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Books */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Livres de {author.name}</h2>
                {author.books.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">Aucun livre pour cet auteur.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {author.books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </div>

            {/* Discovered Books */}
            {discoveredBooks.length > 0 && (
                <div className="border-t pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Découvrir d'autres livres de {author.name}</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Ces livres ne sont pas encore dans votre bibliothèque. Ajoutez-les facilement !
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {discoveredBooks.map((book: any) => (
                            <DiscoveredBookCard key={book.id} book={book} authorName={author.name} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
