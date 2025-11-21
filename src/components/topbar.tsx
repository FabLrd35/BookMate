"use client"

import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./UserMenu"
import { Search, Loader2, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { searchBooks } from "@/app/actions/books"
import Image from "next/image"

type BookSuggestion = {
    id: string
    title: string
    authors: string[]
    coverUrl: string | null
    description: string | null
}

interface TopbarProps {
    user?: {
        name: string | null
        email: string | null
        image: string | null
    } | null
}

export function Topbar({ user }: TopbarProps) {
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (searchQuery.trim().length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const result = await searchBooks(searchQuery)
                if (result.success && result.books) {
                    setSuggestions(result.books)
                    setShowSuggestions(result.books.length > 0)
                }
            } catch (error) {
                console.error("Error searching books:", error)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function handleSelectBook(book: BookSuggestion) {
        setSearchQuery("")
        setShowSuggestions(false)
        setSuggestions([])
        router.push(`/search/${book.id}`)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            const target = e.currentTarget
            if (target.value.trim()) {
                setShowSuggestions(false)
                router.push(`/search?q=${encodeURIComponent(target.value.trim())}`)
            }
        }
    }

    return (
        <div className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
            {/* Search */}
            <div className="flex flex-1 items-center gap-4">
                {/* Spacer for mobile hamburger menu */}
                <div className="w-10 lg:hidden" />

                <div className="relative w-full max-w-md" ref={dropdownRef}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher..."
                        className="pl-10 pr-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                            {suggestions.map((book) => (
                                <button
                                    key={book.id}
                                    type="button"
                                    onClick={() => handleSelectBook(book)}
                                    className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                                >
                                    {/* Book Cover Thumbnail */}
                                    <div className="flex-shrink-0 w-12 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded overflow-hidden relative">
                                        {book.coverUrl ? (
                                            <Image
                                                src={book.coverUrl}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm line-clamp-2">
                                            {book.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {book.authors.join(", ")}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 lg:gap-4 ml-2">
                <ThemeToggle />
                {user && <UserMenu user={user} />}
            </div>
        </div>
    )
}
