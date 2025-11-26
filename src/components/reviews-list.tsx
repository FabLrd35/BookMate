"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Search, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ExpandableText } from "@/components/expandable-text"
import { StarRating } from "@/components/star-rating"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Review = {
    id: string
    title: string
    coverUrl: string | null
    rating: number | null
    comment: string | null
    finishDate: Date | null
    author: {
        id: string
        name: string
    }
    genre: {
        id: string
        name: string
    } | null
}

interface ReviewsListProps {
    reviews: Review[]
}

const REVIEWS_PER_PAGE = 10

export function ReviewsList({ reviews }: ReviewsListProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [ratingFilter, setRatingFilter] = useState<string>("ALL")

    // Filter reviews based on search and rating
    const filteredReviews = reviews.filter((review) => {
        const matchesSearch =
            review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.author.name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRating =
            ratingFilter === "ALL" ||
            (review.rating && Math.round(review.rating) === parseInt(ratingFilter))

        return matchesSearch && matchesRating
    })

    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE
    const endIndex = startIndex + REVIEWS_PER_PAGE
    const currentReviews = filteredReviews.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleRatingChange = (value: string) => {
        setRatingFilter(value)
        setCurrentPage(1)
    }

    if (reviews.length === 0) {
        return (
            <Card className="p-8 sm:p-12">
                <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Aucune critique enregistrée pour le moment.</p>
                    <p className="text-xs sm:text-sm mt-2">Ajoutez des notes et commentaires à vos livres lus !</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 bg-card p-3 md:p-4 rounded-lg border shadow-sm">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par titre ou auteur..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
                <Select value={ratingFilter} onValueChange={handleRatingChange}>
                    <SelectTrigger className="gap-2 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <SelectValue placeholder="Note" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Toutes les notes</SelectItem>
                        <SelectItem value="5">5 étoiles</SelectItem>
                        <SelectItem value="4">4 étoiles</SelectItem>
                        <SelectItem value="3">3 étoiles</SelectItem>
                        <SelectItem value="2">2 étoiles</SelectItem>
                        <SelectItem value="1">1 étoile</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredReviews.length === 0 ? (
                <Card className="p-8 sm:p-12">
                    <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Aucune critique ne correspond à vos critères.</p>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 sm:gap-6">
                        {currentReviews.map((book) => (
                            <Card key={book.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-4 sm:pt-6">
                                    <div className="flex gap-3 sm:gap-6">
                                        {/* Book Cover */}
                                        <Link href={`/books/${book.id}`} className="flex-shrink-0">
                                            {book.coverUrl ? (
                                                <Image
                                                    src={book.coverUrl}
                                                    alt={book.title}
                                                    width={80}
                                                    height={120}
                                                    className="rounded-lg shadow-md object-cover sm:w-[120px] sm:h-[180px]"
                                                />
                                            ) : (
                                                <div className="w-[80px] h-[120px] sm:w-[120px] sm:h-[180px] rounded-lg bg-muted flex items-center justify-center">
                                                    <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                                                </div>
                                            )}
                                        </Link>

                                        {/* Review Content */}
                                        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                                            <div>
                                                <Link
                                                    href={`/books/${book.id}`}
                                                    className="text-lg sm:text-2xl font-bold hover:text-primary transition-colors line-clamp-2"
                                                >
                                                    {book.title}
                                                </Link>
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                                    par {book.author.name}
                                                    {book.genre && ` • ${book.genre.name}`}
                                                </p>
                                            </div>

                                            {/* Rating */}
                                            {book.rating && (
                                                <StarRating rating={book.rating} size="md" />
                                            )}

                                            {/* Comment */}
                                            {book.comment && (
                                                <ExpandableText text={book.comment} />
                                            )}

                                            {/* Date */}
                                            {book.finishDate && (
                                                <p className="text-xs text-muted-foreground">
                                                    Lu le {new Date(book.finishDate).toLocaleDateString("fr-FR")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                            />

                            <p className="text-center text-sm text-muted-foreground">
                                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredReviews.length)} sur {filteredReviews.length} critique{filteredReviews.length > 1 ? 's' : ''}
                            </p>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
