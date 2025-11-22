"use client"

import { useState, useEffect, useRef } from "react"
import { createBook, fetchBookCover, searchBooks, updateBook } from "@/app/actions/books"
import { fetchBookByISBN } from "@/app/actions/isbn"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2, Search, BookOpen, CalendarIcon } from "lucide-react"
import Image from "next/image"
import { BarcodeScanner } from "./barcode-scanner"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

type Author = {
    id: string
    name: string
}

type Genre = {
    id: string
    name: string
}

type BookSuggestion = {
    id: string
    title: string
    authors: string[]
    coverUrl: string | null
    description: string | null
    pageCount: number | null
    categories: string[]
}

interface BookFormProps {
    authors: Author[]
    genres: Genre[]
    initialData?: {
        id: string
        title: string
        author: { name: string }
        genre: { name: string } | null
        coverUrl: string | null
        summary: string | null
        status: "TO_READ" | "READING" | "READ" | "ABANDONED"
        currentPage: number | null
        totalPages: number | null
        rating: number | null
        comment: string | null
        finishDate?: Date | null
    }
    prefillData?: {
        title: string
        author: string
        coverUrl: string
        totalPages?: string
        summary?: string
    }
}

export function BookForm({ authors, genres, initialData, prefillData }: BookFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFetchingCover, setIsFetchingCover] = useState(false)
    const [rating, setRating] = useState<number | null>(initialData?.rating ?? null)
    const [status, setStatus] = useState<"TO_READ" | "READING" | "READ" | "ABANDONED">(initialData?.status ?? "TO_READ")
    const [coverUrl, setCoverUrl] = useState((prefillData?.coverUrl || initialData?.coverUrl) ?? "")
    const [title, setTitle] = useState((prefillData?.title || initialData?.title) ?? "")
    const [author, setAuthor] = useState((prefillData?.author || initialData?.author.name) ?? "")
    const [summary, setSummary] = useState((prefillData?.summary || initialData?.summary) ?? "")
    const [finishDate, setFinishDate] = useState<Date | undefined>(initialData?.finishDate ? new Date(initialData.finishDate) : (status === "READ" ? new Date() : undefined))

    // Autocomplete state
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            if (initialData) {
                await updateBook(initialData.id, formData)
            } else {
                await createBook(formData)
            }
        } catch (error) {
            console.error("Error saving book:", error)
            setIsSubmitting(false)
        }
    }

    async function handleFetchCover() {
        if (!title || !author) {
            alert("Veuillez d'abord entrer le titre et l'auteur")
            return
        }

        setIsFetchingCover(true)
        try {
            const result = await fetchBookCover(title, author)
            if (result.success) {
                if (result.coverUrl) {
                    setCoverUrl(result.coverUrl)
                }
                // Auto-fill page count if available and not already set
                if (result.pageCount) {
                    const totalPagesInput = document.getElementById('totalPages') as HTMLInputElement
                    if (totalPagesInput && !totalPagesInput.value) {
                        totalPagesInput.value = result.pageCount.toString()
                    }
                }
                // Auto-fill summary if available and not already set
                if (result.description && !summary) {
                    setSummary(result.description)
                }

                if (!result.coverUrl && result.pageCount) {
                    alert(`Couverture non trouvée, mais ${result.pageCount} pages détectées`)
                }
            } else {
                alert(result.error || "Impossible de trouver une couverture pour ce livre")
            }
        } catch (error) {
            console.error("Error fetching cover:", error)
            alert("Échec de la récupération de la couverture")
        } finally {
            setIsFetchingCover(false)
        }
    }

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
        setTitle(book.title)
        setAuthor(book.authors[0] || "")
        if (book.coverUrl) {
            setCoverUrl(book.coverUrl)
        }
        if (book.description) {
            setSummary(book.description)
        }
        // Auto-fill page count if available
        if (book.pageCount) {
            const totalPagesInput = document.getElementById('totalPages') as HTMLInputElement
            if (totalPagesInput) {
                totalPagesInput.value = book.pageCount.toString()
            }
        }
        // Auto-fill genre from first category if available
        if (book.categories && book.categories.length > 0) {
            const genreInput = document.getElementById('genre') as HTMLInputElement
            if (genreInput) {
                genreInput.value = book.categories[0]
            }
        }
        setSearchQuery("")
        setShowSuggestions(false)
        setSuggestions([])
    }

    async function handleISBNScan(isbn: string) {
        toast.loading("Recherche du livre...")
        const result = await fetchBookByISBN(isbn)

        if (result.success && result.book) {
            setTitle(result.book.title)
            setAuthor(result.book.author)
            if (result.book.coverUrl) {
                setCoverUrl(result.book.coverUrl)
            }
            if (result.book.totalPages) {
                const totalPagesInput = document.getElementById('totalPages') as HTMLInputElement
                if (totalPagesInput) {
                    totalPagesInput.value = result.book.totalPages.toString()
                }
            }
            if (result.book.genre) {
                const genreInput = document.getElementById('genre') as HTMLInputElement
                if (genreInput) {
                    genreInput.value = result.book.genre
                }
            }
            if (result.book.summary) {
                setSummary(result.book.summary)
            }
            toast.dismiss()
            toast.success("Livre trouvé et formulaire pré-rempli !")
        } else {
            toast.dismiss()
            toast.error(result.error || "Livre non trouvé")
        }
    }

    return (
        <Card className="p-6">
            <form action={handleSubmit} className="space-y-6">
                {/* Book Search Autocomplete - Only show for new books or if explicitly wanted? Let's keep it available. */}
                {!initialData && (
                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <Label htmlFor="search" className="text-base font-semibold">
                            Rechercher un livre
                        </Label>
                        <div className="relative">
                            <Input
                                id="search"
                                type="text"
                                placeholder="Rechercher par titre ou auteur..."
                                className="text-base pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!isSearching && searchQuery && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Commencez à taper pour rechercher sur Google Books et remplir automatiquement les détails
                        </p>

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
                )}

                {/* Barcode Scanner - Only for new books */}
                {!initialData && (
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">
                            Ou scanner un code-barres
                        </Label>
                        <BarcodeScanner onScanSuccess={handleISBNScan} />
                        <p className="text-xs text-muted-foreground">
                            Scannez le code-barres ISBN au dos du livre pour remplir automatiquement les informations
                        </p>
                    </div>
                )}

                {!initialData && <div className="border-t pt-4" />}

                <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">
                        Titre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="Entrez le titre du livre"
                        required
                        className="text-base"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Author */}
                <div className="space-y-2">
                    <Label htmlFor="author" className="text-base font-semibold">
                        Auteur <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="author"
                        name="author"
                        placeholder="Entrez le nom de l'auteur"
                        required
                        list="authors-list"
                        className="text-base"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                    <datalist id="authors-list">
                        {authors.map((author) => (
                            <option key={author.id} value={author.name} />
                        ))}
                    </datalist>
                    <p className="text-xs text-muted-foreground">
                        Commencez à taper pour voir les auteurs existants ou en entrer un nouveau
                    </p>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                    <Label htmlFor="genre" className="text-base font-semibold">
                        Genre
                    </Label>
                    <Input
                        id="genre"
                        name="genre"
                        placeholder="Entrez le genre (optionnel)"
                        list="genres-list"
                        className="text-base"
                        defaultValue={initialData?.genre?.name}
                    />
                    <datalist id="genres-list">
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.name} />
                        ))}
                    </datalist>
                </div>

                {/* Cover URL */}
                <div className="space-y-2">
                    <Label htmlFor="coverUrl" className="text-base font-semibold">
                        URL de l'image de couverture
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="coverUrl"
                            name="coverUrl"
                            type="url"
                            placeholder="https://exemple.com/cover.jpg (optionnel)"
                            className="text-base flex-1"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleFetchCover}
                            disabled={isFetchingCover || !title || !author}
                        >
                            {isFetchingCover ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Récupérer
                                </>
                            )}
                        </Button>
                    </div>
                    {!initialData && (
                        <p className="text-xs text-muted-foreground">
                            Entrez le titre et l'auteur, puis cliquez sur "Récupérer" pour trouver automatiquement la couverture
                        </p>
                    )}
                </div>

                {/* Summary */}
                <div className="space-y-2">
                    <Label htmlFor="summary" className="text-base font-semibold">
                        Résumé
                    </Label>
                    <Textarea
                        id="summary"
                        name="summary"
                        placeholder="Résumé du livre..."
                        rows={4}
                        className="text-base resize-none"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                </div>

                {/* Reading Status */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">
                        Statut de lecture <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <label
                            className={`relative flex items-center justify-center rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all ${status === "TO_READ"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-border hover:border-blue-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="status"
                                value="TO_READ"
                                checked={status === "TO_READ"}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="sr-only"
                            />
                            <span className="font-medium text-sm sm:text-base">À lire</span>
                        </label>
                        <label
                            className={`relative flex items-center justify-center rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all ${status === "READING"
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                : "border-border hover:border-orange-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="status"
                                value="READING"
                                checked={status === "READING"}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="sr-only"
                            />
                            <span className="font-medium text-sm sm:text-base">En cours</span>
                        </label>
                        <label
                            className={`relative flex items-center justify-center rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all ${status === "READ"
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-border hover:border-green-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="status"
                                value="READ"
                                checked={status === "READ"}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="sr-only"
                            />
                            <span className="font-medium text-sm sm:text-base">Terminé</span>
                        </label>
                        <label
                            className={`relative flex items-center justify-center rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all ${status === "ABANDONED"
                                ? "border-gray-500 bg-gray-50 dark:bg-gray-950/20"
                                : "border-border hover:border-gray-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="status"
                                value="ABANDONED"
                                checked={status === "ABANDONED"}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="sr-only"
                            />
                            <span className="font-medium text-sm sm:text-base">Abandonné</span>
                        </label>
                    </div>
                </div>

                {/* Total Pages */}
                <div className="space-y-2">
                    <Label htmlFor="totalPages" className="text-base font-semibold">
                        Nombre de pages
                    </Label>
                    <Input
                        id="totalPages"
                        name="totalPages"
                        type="number"
                        min="0"
                        placeholder="Nombre total de pages"
                        className="text-base"
                        defaultValue={initialData?.totalPages || ""}
                    />
                    <p className="text-xs text-muted-foreground">
                        Optionnel - pour suivre vos statistiques de lecture
                    </p>
                </div>

                {/* Current Page (only for books being read) */}
                {status === "READING" && (
                    <div className="space-y-2">
                        <Label htmlFor="currentPage" className="text-base font-semibold">
                            Page actuelle
                        </Label>
                        <Input
                            id="currentPage"
                            name="currentPage"
                            type="number"
                            min="0"
                            placeholder="Entrez la page actuelle"
                            className="text-base"
                            defaultValue={initialData?.currentPage || ""}
                        />
                        <p className="text-xs text-muted-foreground">
                            Suivez votre progression dans le livre
                        </p>
                    </div>
                )}

                {/* Rating (only for completed books) */}
                {status === "READ" && (
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Note</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${rating && star <= rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                </button>
                            ))}
                            {rating && (
                                <button
                                    type="button"
                                    onClick={() => setRating(null)}
                                    className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Effacer
                                </button>
                            )}
                        </div>
                        <input type="hidden" name="rating" value={rating || ""} />
                    </div>
                )}

                {/* Comment (only for completed books) */}
                {status === "READ" && (
                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-base font-semibold">
                            Critique / Commentaire
                        </Label>
                        <Textarea
                            id="comment"
                            name="comment"
                            placeholder="Partagez vos pensées sur ce livre..."
                            rows={4}
                            className="text-base resize-none"
                            defaultValue={initialData?.comment || ""}
                        />
                    </div>
                )}

                {/* Finish Date (only for completed books) */}
                {status === "READ" && (
                    <div className="space-y-2">
                        <Label htmlFor="finishDate" className="text-base font-semibold">
                            Date de lecture
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !finishDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {finishDate ? format(finishDate, "d MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={finishDate}
                                    onSelect={(d) => d && setFinishDate(d)}
                                    initialFocus
                                    locale={fr}
                                />
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name="finishDate" value={finishDate ? finishDate.toISOString() : ""} />
                    </div>
                )}

                {/* Submit Button - Sticky on mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t lg:relative lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:pt-4 z-10">
                    <div className="flex gap-4 max-w-2xl mx-auto">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                            size="lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {initialData ? "Enregistrement..." : "Ajout en cours..."}
                                </>
                            ) : (
                                initialData ? "Enregistrer les modifications" : "Ajouter le livre"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => window.history.back()}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                    </div>
                </div>

                {/* Spacer for fixed buttons on mobile */}
                <div className="h-32 lg:hidden" />
            </form>
        </Card>
    )
}
