import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Star, Calendar, ArrowLeft, Trash2, Edit, BookOpen, Info, Languages } from "lucide-react"
import { QuoteList } from "@/components/quote-list"
import { AddToCollection } from "@/components/add-to-collection"
import { CurrentPageUpdater } from "@/components/current-page-updater"
import { getCollections } from "@/app/actions/collections"
import { ExpandableText } from "@/components/expandable-text"
import { BookStatusActions } from "@/components/book-status-actions"
import { AddWordDialog } from "@/components/add-word-dialog"
import { BookGallery } from "@/components/book-gallery"
import { FavoriteButton } from "@/components/favorite-button"
import { BackButton } from "@/components/back-button"
import { DeleteBookDialog } from "@/components/delete-book-dialog"
import { StarRating } from "@/components/star-rating"

interface BookDetailsPageProps {
    params: Promise<{ id: string }>
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
    const { id } = await params

    const [book, allCollections] = await Promise.all([
        prisma.book.findUnique({
            where: { id },
            include: {
                author: true,
                genre: true,
                quotes: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                words: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                images: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                collections: true,
            },
        }).then(b => b ? ({
            ...b,
            rating: b.rating === null ? null : Number(b.rating)
        }) : null),
        getCollections(),
    ])

    if (!book) {
        notFound()
    }

    const statusColors = {
        TO_READ: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        READING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        READ: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        ABANDONED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    }

    const statusLabels = {
        TO_READ: "À lire",
        READING: "En cours",
        READ: "Terminé",
        ABANDONED: "Abandonné",
    }

    // Calculate progress percentage
    const progressPercentage = book.currentPage && book.totalPages && book.totalPages > 0
        ? Math.min(Math.round((book.currentPage / book.totalPages) * 100), 100)
        : null

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <BackButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                {/* Main Content Column */}
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                        {/* Cover Image */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <div className="relative w-48 aspect-[2/3] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg overflow-hidden shadow-xl">
                                {book.coverUrl ? (
                                    <Image
                                        src={book.coverUrl}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center p-6">
                                        <p className="text-center text-lg font-medium text-muted-foreground">
                                            {book.title}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Book Info & Actions */}
                        <div className="flex-1 space-y-6 text-center sm:text-left">
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                                        {book.title}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap self-center sm:self-start ${statusColors[book.status]}`}>
                                        {statusLabels[book.status]}
                                    </span>
                                </div>
                                <Link
                                    href={`/authors/${book.author.id}`}
                                    className="text-xl text-muted-foreground hover:text-foreground hover:underline transition-colors block"
                                >
                                    par {book.author.name}
                                </Link>
                            </div>

                            {/* Rating */}
                            {book.rating && (
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <StarRating rating={book.rating} size="lg" />
                                    <span className="text-lg font-semibold">
                                        {book.rating}/5
                                    </span>
                                </div>
                            )}

                            {/* Horizontal Action Bar */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <BookStatusActions
                                    bookId={book.id}
                                    status={book.status}
                                    currentRating={book.rating}
                                    currentComment={book.comment}
                                    finishDate={book.finishDate}
                                    title={book.title}
                                />
                                <FavoriteButton bookId={book.id} isFavorite={book.isFavorite} />
                                <AddToCollection
                                    bookId={book.id}
                                    availableCollections={allCollections}
                                    bookCollections={book.collections}
                                />
                                <Link href={`/books/${book.id}/edit`}>
                                    <Button variant="outline" size="icon" title="Modifier">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <DeleteBookDialog
                                    bookId={book.id}
                                    title={book.title}
                                    trigger={
                                        <Button variant="destructive" size="icon" title="Supprimer">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    {book.summary && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                Résumé
                            </h2>
                            <Card className="p-6">
                                <ExpandableText text={book.summary} className="text-base leading-relaxed text-muted-foreground" />
                            </Card>
                        </div>
                    )}

                    {/* Review */}
                    {book.comment && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                Mon avis
                            </h2>
                            <Card className="p-6 bg-muted/30">
                                <ExpandableText text={book.comment} className="text-base italic text-muted-foreground" />
                            </Card>
                        </div>
                    )}

                    {/* Quotes Section */}
                    <div className="space-y-3">
                        <QuoteList bookId={book.id} quotes={book.quotes} />
                    </div>

                    {/* Gallery Section */}
                    <div className="space-y-3">
                        <BookGallery bookId={book.id} images={book.images} />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Reading Progress Card */}
                    {book.status === "READING" && (
                        <Card className="p-5 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                <BookOpen className="h-4 w-4" />
                                Lecture en cours
                            </h3>

                            <div className="space-y-4">
                                {progressPercentage !== null && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {progressPercentage}%
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {book.currentPage} / {book.totalPages}
                                            </span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                        <p className="text-xs text-muted-foreground text-center">
                                            {book.totalPages && book.currentPage
                                                ? `${book.totalPages - book.currentPage} pages restantes`
                                                : null}
                                        </p>
                                    </div>
                                )}

                                <div className={progressPercentage !== null ? "pt-4 border-t border-orange-200 dark:border-orange-800" : ""}>
                                    <CurrentPageUpdater bookId={book.id} initialPage={book.currentPage} />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Book Info Card */}
                    <Card className="p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Informations
                        </h3>
                        <div className="space-y-4 text-sm">
                            {book.genre && (
                                <div className="flex justify-between py-2 border-b last:border-0">
                                    <span className="text-muted-foreground">Genre</span>
                                    <span className="font-medium">{book.genre.name}</span>
                                </div>
                            )}
                            {book.totalPages && (
                                <div className="flex justify-between py-2 border-b last:border-0">
                                    <span className="text-muted-foreground">Pages</span>
                                    <span className="font-medium">{book.totalPages}</span>
                                </div>
                            )}
                            {book.startDate && (
                                <div className="flex justify-between py-2 border-b last:border-0">
                                    <span className="text-muted-foreground">Commencé le</span>
                                    <span className="font-medium">
                                        {new Date(book.startDate).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            )}
                            {book.finishDate && (
                                <div className="flex justify-between py-2 border-b last:border-0">
                                    <span className="text-muted-foreground">Terminé le</span>
                                    <span className="font-medium">
                                        {new Date(book.finishDate).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-b last:border-0">
                                <span className="text-muted-foreground">Ajouté le</span>
                                <span className="font-medium">
                                    {new Date(book.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Vocabulary Widget */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Languages className="h-4 w-4" />
                                Vocabulaire
                            </h3>
                            <AddWordDialog bookId={book.id} />
                        </div>

                        {book.words.length > 0 ? (
                            <div className="space-y-2">
                                {book.words.slice(0, 3).map((word) => (
                                    <Card key={word.id} className="p-3 text-sm hover:bg-accent transition-colors cursor-default">
                                        <div className="font-medium capitalize">{word.text}</div>
                                        {word.definition && (
                                            <div className="text-muted-foreground line-clamp-1 text-xs mt-1">
                                                {word.definition}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                                {book.words.length > 3 && (
                                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                                        Voir les {book.words.length} mots
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Card className="p-4 border-dashed text-center">
                                <p className="text-xs text-muted-foreground">Aucun mot enregistré</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
