import { fetchGoogleBook } from "@/app/actions/books"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"
import { AddToLibraryButton } from "@/components/add-to-library-button"
import { BookOpen, Calendar, Layers, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DiscoveredBookPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { book, success, error } = await fetchGoogleBook(id)

    if (!success || !book) {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center py-12">
                <h1 className="text-2xl font-bold text-destructive mb-4">Erreur</h1>
                <p className="text-muted-foreground mb-8">{error || "Livre introuvable"}</p>
                <Button asChild>
                    <Link href="/search">Retour à la recherche</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <BackButton />
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-8">
                {/* Left Column: Cover and Actions */}
                <div className="space-y-6">
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-xl bg-muted">
                        {book.coverUrl ? (
                            <Image
                                src={book.coverUrl}
                                alt={book.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 300px"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <BookOpen className="h-24 w-24 text-primary/40" />
                            </div>
                        )}
                    </div>

                    <AddToLibraryButton book={book} />
                </div>

                {/* Right Column: Details */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
                        <p className="text-xl text-muted-foreground">
                            par {book.authors.join(", ")}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {book.pageCount && (
                            <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/50">
                                <Layers className="h-5 w-5 mb-2 text-muted-foreground" />
                                <span className="font-semibold">{book.pageCount}</span>
                                <span className="text-xs text-muted-foreground">Pages</span>
                            </Card>
                        )}
                        {book.publishedDate && (
                            <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/50">
                                <Calendar className="h-5 w-5 mb-2 text-muted-foreground" />
                                <span className="font-semibold">{book.publishedDate.split('-')[0]}</span>
                                <span className="text-xs text-muted-foreground">Année</span>
                            </Card>
                        )}
                        {book.averageRating && (
                            <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/50">
                                <Star className="h-5 w-5 mb-2 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{book.averageRating}/5</span>
                                <span className="text-xs text-muted-foreground">{book.ratingsCount || 0} avis</span>
                            </Card>
                        )}
                    </div>

                    {/* Description */}
                    {book.description && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold">Résumé</h2>
                            <div
                                className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: book.description }}
                            />
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="space-y-3 pt-4 border-t">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Informations détaillées
                        </h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {book.publisher && (
                                <>
                                    <dt className="text-muted-foreground">Éditeur</dt>
                                    <dd className="font-medium">{book.publisher}</dd>
                                </>
                            )}
                            {book.categories && book.categories.length > 0 && (
                                <>
                                    <dt className="text-muted-foreground">Catégories</dt>
                                    <dd className="font-medium">{book.categories.join(", ")}</dd>
                                </>
                            )}
                            {book.language && (
                                <>
                                    <dt className="text-muted-foreground">Langue</dt>
                                    <dd className="font-medium uppercase">{book.language}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
