import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Star, Calendar, ArrowLeft, Trash2, Edit } from "lucide-react"
import { deleteBook } from "@/app/actions/books"
import { QuoteList } from "@/components/quote-list"
import { AddToCollection } from "@/components/add-to-collection"
import { CurrentPageUpdater } from "@/components/current-page-updater"
import { getCollections } from "@/app/actions/collections"
import { ExpandableText } from "@/components/expandable-text"
import { BookStatusActions } from "@/components/book-status-actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { AddWordDialog } from "@/components/add-word-dialog"
import { BookGallery } from "@/components/book-gallery"
import { FavoriteButton } from "@/components/favorite-button"
import { BackButton } from "@/components/back-button"

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
        }),
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
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <BackButton />
            </div>

            {/* Main Content */}
            <Card className="overflow-hidden">
                <div className="grid md:grid-cols-[300px_1fr] gap-8 p-8">
                    {/* Book Cover */}
                    <div className="space-y-4">
                        <div className="relative aspect-[2/3] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg overflow-hidden shadow-lg">
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

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
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
                            <AddWordDialog bookId={book.id} />
                            <Link href={`/books/${book.id}/edit`}>
                                <Button variant="outline" className="w-full">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier le livre
                                </Button>
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer le livre
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Cela supprimera définitivement le livre
                                            "{book.title}" de votre collection.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <form action={deleteBook.bind(null, book.id)}>
                                            <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Supprimer
                                            </AlertDialogAction>
                                        </form>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* Book Details */}
                    <div className="space-y-6">
                        {/* Title and Status */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-4xl font-bold tracking-tight">
                                    {book.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusColors[book.status]}`}>
                                    {statusLabels[book.status]}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xl text-muted-foreground">
                                    par {book.author.name}
                                </p>
                                {book.genre && (
                                    <p className="text-sm text-muted-foreground">
                                        Genre : {book.genre.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        {book.summary && (
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Résumé
                                </h2>
                                <ExpandableText text={book.summary} className="text-sm text-muted-foreground" />
                            </div>
                        )}

                        {/* Unified Progress Section (only for books being read) */}
                        {book.status === "READING" && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Progression
                                </h2>

                                <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                    {/* Progress Bar (if totalPages available) */}
                                    {progressPercentage !== null && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                    {progressPercentage}%
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {book.currentPage} / {book.totalPages} pages
                                                </span>
                                            </div>
                                            <Progress value={progressPercentage} className="h-3" />
                                            <p className="text-xs text-muted-foreground">
                                                {book.totalPages && book.currentPage
                                                    ? `Plus que ${book.totalPages - book.currentPage} pages à lire!`
                                                    : null}
                                            </p>
                                        </div>
                                    )}

                                    {/* Page Updater */}
                                    <div className={progressPercentage !== null ? "pt-3 border-t border-orange-200 dark:border-orange-800" : ""}>
                                        <CurrentPageUpdater bookId={book.id} initialPage={book.currentPage} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rating */}
                        {book.rating && (
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Ma note
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-6 w-6 ${i < book.rating!
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-semibold">
                                        {book.rating}/5
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Comment/Review */}
                        {book.comment && (
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Mon avis
                                </h2>
                                <Card className="p-4 bg-muted/50">
                                    <ExpandableText text={book.comment} className="text-sm" />
                                </Card>
                            </div>
                        )}

                        {/* Reading Dates */}
                        {(book.startDate || book.finishDate) && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Chronologie de lecture
                                </h2>
                                <div className="space-y-2">
                                    {book.startDate && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Commencé le :</span>
                                            <span className="text-muted-foreground">
                                                {new Date(book.startDate).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {book.finishDate && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Terminé le :</span>
                                            <span className="text-muted-foreground">
                                                {new Date(book.finishDate).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quotes Section */}
                        <QuoteList bookId={book.id} quotes={book.quotes} />

                        {/* Gallery Section */}
                        <div className="pt-6 border-t">
                            <BookGallery bookId={book.id} images={book.images} />
                        </div>

                        {/* Vocabulary Section */}
                        {book.words.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Vocabulaire
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {book.words.map((word) => (
                                        <Card key={word.id} className="p-4">
                                            <h3 className="font-semibold capitalize mb-1">{word.text}</h3>
                                            <p className="text-sm text-muted-foreground">{word.definition || 'Pas de définition'}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="pt-4 border-t space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Ajouté le {new Date(book.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {book.updatedAt.getTime() !== book.createdAt.getTime() && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Dernière mise à jour le {new Date(book.updatedAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
