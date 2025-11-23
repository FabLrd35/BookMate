import { searchBooks } from "@/app/actions/books"
import { DiscoveredBookCard } from "@/components/discovered-book-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string; page?: string }>
}) {
    const { q: query, page } = await searchParams
    const currentPage = page ? parseInt(page) : 1
    const itemsPerPage = 20
    const startIndex = (currentPage - 1) * itemsPerPage

    if (!query) {
        redirect("/")
    }

    const { books, success, error, totalItems } = await searchBooks(query, startIndex)
    const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 0

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au tableau de bord
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Résultats de recherche</h1>
                        <p className="text-muted-foreground mt-1">
                            Pour "{query}" {totalItems ? `(${totalItems} résultats)` : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Results */}
            {success ? (
                books && books.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {books.map((book: any) => (
                                <Link key={book.id} href={`/search/${book.id}`} className="block h-full">
                                    <DiscoveredBookCard
                                        book={book}
                                        authorName={book.authors[0]}
                                        hideAddButton // We'll add this prop to DiscoveredBookCard
                                    />
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                asChild={currentPage > 1}
                            >
                                {currentPage > 1 ? (
                                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}>
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Précédent
                                    </Link>
                                ) : (
                                    <span className="flex items-center">
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Précédent
                                    </span>
                                )}
                            </Button>

                            <span className="text-sm text-muted-foreground mx-2">
                                Page {currentPage}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                // Google Books API often returns estimated totalItems which can be unreliable for exact last page calculation
                                // So we also check if we got a full page of results
                                disabled={books.length < itemsPerPage}
                                asChild={books.length === itemsPerPage}
                            >
                                {books.length === itemsPerPage ? (
                                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}>
                                        Suivant
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Link>
                                ) : (
                                    <span className="flex items-center">
                                        Suivant
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Nous n'avons trouvé aucun livre correspondant à votre recherche. Essayez avec d'autres mots-clés.
                        </p>
                    </div>
                )
            ) : (
                <div className="text-center py-12 text-destructive">
                    <p>Une erreur est survenue lors de la recherche : {error}</p>
                </div>
            )}
        </div>
    )
}
