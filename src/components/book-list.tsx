"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BookCard } from "./book-card"
import { BookListItem } from "./book-list-item"
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
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabParam = searchParams.get('tab') as "TO_READ" | "READING" | "READ" | "ABANDONED" | "FAVORITES" | null
    const activeTab = tabParam || "TO_READ"

    const setActiveTab = (tab: "TO_READ" | "READING" | "READ" | "ABANDONED" | "FAVORITES") => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const toReadBooks = books.filter((book) => book.status === "TO_READ")
    const readingBooks = books.filter((book) => book.status === "READING")
    const readBooks = books.filter((book) => book.status === "READ")
    const abandonedBooks = books.filter((book) => book.status === "ABANDONED")
    const favoriteBooks = books.filter((book) => book.isFavorite)

    type ColorKey = "blue" | "orange" | "green" | "gray" | "red"

    const filters = [
        {
            id: "TO_READ" as const,
            label: "À lire",
            icon: BookOpen,
            count: toReadBooks.length,
            color: "blue" as ColorKey,
            books: toReadBooks,
        },
        {
            id: "READING" as const,
            label: "En cours",
            icon: BookMarked,
            count: readingBooks.length,
            color: "orange" as ColorKey,
            books: readingBooks,
        },
        {
            id: "READ" as const,
            label: "Lu",
            icon: CheckCircle2,
            count: readBooks.length,
            color: "green" as ColorKey,
            books: readBooks,
        },
        {
            id: "ABANDONED" as const,
            label: "Abandonné",
            icon: XCircle,
            count: abandonedBooks.length,
            color: "gray" as ColorKey,
            books: abandonedBooks,
        },
        {
            id: "FAVORITES" as const,
            label: "Favoris",
            icon: Heart,
            count: favoriteBooks.length,
            color: "red" as ColorKey,
            books: favoriteBooks,
        },
    ]

    const activeFilter = filters.find(f => f.id === activeTab)!

    const colorClasses = {
        blue: {
            active: "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
            inactive: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/30",
            badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
        },
        orange: {
            active: "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
            inactive: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/30",
            badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
        },
        green: {
            active: "bg-green-500 text-white shadow-lg shadow-green-500/30",
            inactive: "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/30",
            badge: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
        },
        gray: {
            active: "bg-gray-500 text-white shadow-lg shadow-gray-500/30",
            inactive: "bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-950/30",
            badge: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        },
        red: {
            active: "bg-red-500 text-white shadow-lg shadow-red-500/30",
            inactive: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/30",
            badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
        },
    }

    const EmptyState = ({ message, icon: Icon = BookOpen }: { message: string, icon?: any }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">{message}</p>
        </div>
    )

    return (
        <div className="w-full space-y-6">
            {/* Filter Pills */}
            <div className="flex overflow-x-auto pb-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:pb-0 no-scrollbar">
                {filters.map((filter) => {
                    const Icon = filter.icon
                    const isActive = activeTab === filter.id
                    const colors = colorClasses[filter.color]

                    return (
                        <button
                            key={filter.id}
                            onClick={() => setActiveTab(filter.id)}
                            className={`
                                relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200 font-medium whitespace-nowrap flex-shrink-0
                                ${isActive ? colors.active : colors.inactive}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <Icon className={`h-5 w-5 ${filter.id === "FAVORITES" ? "fill-current" : ""}`} />
                                <span className="text-sm font-semibold">{filter.label}</span>
                            </div>
                            {filter.count > 0 && (
                                <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-bold ml-2
                                    ${isActive ? "bg-white/20" : colors.badge}
                                `}>
                                    {filter.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Book Grid */}
            <div>
                {activeFilter.books.length === 0 ? (
                    <EmptyState
                        message={
                            activeTab === "TO_READ" ? "Pas encore de livres dans votre liste de lecture." :
                                activeTab === "READING" ? "Aucun livre en cours de lecture." :
                                    activeTab === "READ" ? "Pas encore de livres terminés." :
                                        activeTab === "ABANDONED" ? "Aucun livre abandonné." :
                                            "Aucun livre favori pour le moment."
                        }
                        icon={activeFilter.icon}
                    />
                ) : (
                    <div className="flex flex-col bg-card rounded-lg border shadow-sm">
                        {activeFilter.books.map((book) => (
                            <BookListItem key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
