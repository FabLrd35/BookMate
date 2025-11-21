"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookCard } from "./book-card"
import { BookOpen, Heart, BookMarked, CheckCircle2, XCircle } from "lucide-react"

type Book = {
    id: string
    title: string
    coverUrl: string | null
    rating: number | null
    comment: string | null
    status: "TO_READ" | "READING" | "READ" | "ABANDONED"
    currentPage: number | null
    totalPages: number | null
    startDate: Date | null
    finishDate: Date | null
    isFavorite: boolean
    author: {
        id: string
        name: string
    }
    genre: {
        id: string
        name: string
    } | null
}

interface BookListProps {
    books: Book[]
}

export function BookList({ books }: BookListProps) {
    const [activeTab, setActiveTab] = useState<"TO_READ" | "READING" | "READ" | "ABANDONED" | "FAVORITES">("TO_READ")

    const toReadBooks = books.filter((book) => book.status === "TO_READ")
    const readingBooks = books.filter((book) => book.status === "READING")
    const readBooks = books.filter((book) => book.status === "READ")
    const abandonedBooks = books.filter((book) => book.status === "ABANDONED")
    const favoriteBooks = books.filter((book) => book.isFavorite)

    const EmptyState = ({ message, icon: Icon = BookOpen }: { message: string, icon?: any }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">{message}</p>
        </div>
    )

    return (
        <div className="w-full space-y-4">
            {/* Header with Status Tabs and Favorites Toggle */}
            <div className="flex items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1 max-w-2xl">
                        <TabsTrigger value="TO_READ" className="relative flex-shrink-0 px-4 py-2.5 gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">À lire</span>
                            <span className="sm:hidden">À lire</span>
                            {toReadBooks.length > 0 && (
                                <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                                    {toReadBooks.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="READING" className="relative flex-shrink-0 px-4 py-2.5 gap-2">
                            <BookMarked className="h-4 w-4" />
                            <span className="hidden sm:inline">En cours</span>
                            <span className="sm:hidden">En cours</span>
                            {readingBooks.length > 0 && (
                                <span className="ml-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                                    {readingBooks.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="READ" className="relative flex-shrink-0 px-4 py-2.5 gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Lu</span>
                            <span className="sm:hidden">Lu</span>
                            {readBooks.length > 0 && (
                                <span className="ml-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                                    {readBooks.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="ABANDONED" className="relative flex-shrink-0 px-4 py-2.5 gap-2">
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Abandonnés</span>
                            <span className="sm:hidden">Abandon.</span>
                            {abandonedBooks.length > 0 && (
                                <span className="ml-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {abandonedBooks.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Favorites Toggle Button */}
                <button
                    onClick={() => setActiveTab("FAVORITES")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${activeTab === "FAVORITES"
                            ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700"
                        }`}
                >
                    <Heart className={`h-4 w-4 ${activeTab === "FAVORITES" ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline font-medium">Favoris</span>
                    {favoriteBooks.length > 0 && (
                        <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                            {favoriteBooks.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab Contents */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsContent value="TO_READ" className="mt-0">
                    {toReadBooks.length === 0 ? (
                        <EmptyState message="Pas encore de livres dans votre liste de lecture. Commencez par en ajouter !" />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {toReadBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="READING" className="mt-0">
                    {readingBooks.length === 0 ? (
                        <EmptyState message="Aucun livre en cours de lecture. Choisissez-en un dans votre liste !" />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {readingBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="READ" className="mt-0">
                    {readBooks.length === 0 ? (
                        <EmptyState message="Pas encore de livres terminés. Continuez à lire !" />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {readBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="ABANDONED" className="mt-0">
                    {abandonedBooks.length === 0 ? (
                        <EmptyState message="Aucun livre abandonné. C'est une bonne chose !" />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {abandonedBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="FAVORITES" className="mt-0">
                    {favoriteBooks.length === 0 ? (
                        <EmptyState message="Aucun livre favori pour le moment. Ajoutez-en un en cliquant sur le cœur !" icon={Heart} />
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {favoriteBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
