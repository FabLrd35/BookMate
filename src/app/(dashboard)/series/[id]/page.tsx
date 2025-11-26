import { getSeriesById } from "@/app/actions/series"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RenameSeriesDialog } from "@/components/rename-series-dialog"
import { DeleteSeriesButton } from "@/components/delete-series-button"
import { StarRating } from "@/components/star-rating"
import { SeriesOrderEditor } from "@/components/series-order-editor"

export default async function SeriesDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.email) {
        redirect("/login")
    }

    const { id } = await params
    const result = await getSeriesById(id)

    if (!result.success || !result.series) {
        notFound()
    }

    const series = result.series
    const author = series.books[0]?.author

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/series">
                    <Button variant="ghost" className="mb-4 -ml-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux sagas
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{series.name}</h1>
                        {author && (
                            <p className="text-muted-foreground mt-2">
                                par {author.name}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <RenameSeriesDialog seriesId={series.id} currentName={series.name} />
                        <DeleteSeriesButton seriesId={series.id} seriesName={series.name} />
                    </div>
                </div>
                {series.description && (
                    <p className="text-muted-foreground mt-2">
                        {series.description}
                    </p>
                )}
                <Badge variant="secondary" className="mt-4">
                    {series.books.length} livre{series.books.length > 1 ? 's' : ''} dans votre bibliothèque
                </Badge>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Livres de la saga</h2>
                    {series.books.length > 1 && (
                        <SeriesOrderEditor seriesId={series.id} books={series.books} />
                    )}
                </div>

                {series.books.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Aucun livre dans cette saga pour le moment
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {series.books.map((book: any) => (
                            <Link key={book.id} href={`/books/${book.id}?from=/series/${series.id}`}>
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                                    <div className="flex gap-4 p-4">
                                        <div className="relative w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-muted">
                                            {book.coverUrl ? (
                                                <Image
                                                    src={book.coverUrl}
                                                    alt={book.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            {book.seriesOrder && (
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center"
                                                >
                                                    {book.seriesOrder}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold line-clamp-2 mb-1">
                                                {book.title}
                                            </h3>
                                            {book.genre && (
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {book.genre.name}
                                                </p>
                                            )}
                                            {book.rating && (
                                                <StarRating rating={Number(book.rating)} size="sm" />
                                            )}
                                            <Badge
                                                variant={
                                                    book.status === 'READ' ? 'default' :
                                                        book.status === 'READING' ? 'secondary' :
                                                            'outline'
                                                }
                                                className="mt-2"
                                            >
                                                {book.status === 'READ' ? 'Lu' :
                                                    book.status === 'READING' ? 'En cours' :
                                                        book.status === 'TO_READ' ? 'À lire' :
                                                            'Abandonné'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
