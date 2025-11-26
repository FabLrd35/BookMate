"use client"

import { useState } from "react"
import { AuthorCard } from "@/components/author-card"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Search, Users } from "lucide-react"

interface AuthorWithStats {
    id: string
    name: string
    photoUrl: string | null
    totalBooks: number
    booksRead: number
    averageRating: number
}

interface AuthorsGridProps {
    authors: AuthorWithStats[]
}

const AUTHORS_PER_PAGE = 12

export function AuthorsGrid({ authors }: AuthorsGridProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const filteredAuthors = authors.filter(author =>
        author.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredAuthors.length / AUTHORS_PER_PAGE)
    const startIndex = (currentPage - 1) * AUTHORS_PER_PAGE
    const endIndex = startIndex + AUTHORS_PER_PAGE
    const currentAuthors = filteredAuthors.slice(startIndex, endIndex)

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1) // Reset to page 1 when search changes
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un auteur..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {filteredAuthors.length} auteur{filteredAuthors.length > 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {filteredAuthors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Aucun auteur trouvé</h3>
                    <p className="text-muted-foreground">
                        Essayez une autre recherche.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {currentAuthors.map((author) => (
                            <AuthorCard key={author.id} author={author} />
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
                                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAuthors.length)} sur {filteredAuthors.length} auteur{filteredAuthors.length > 1 ? 's' : ''}
                            </p>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
