import { getAuthors, getGenres } from "@/app/actions/books"
import { BookForm } from "@/components/book-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface AddBookPageProps {
    searchParams: Promise<{ title?: string; author?: string; coverUrl?: string; totalPages?: string }>
}

// Force rebuild
export default async function AddBookPage({ searchParams }: AddBookPageProps) {
    const authors = await getAuthors()
    const genres = await getGenres()
    const params = await searchParams

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" asChild>
                <Link href="/books" className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Retour aux livres
                </Link>
            </Button>

            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Ajouter un nouveau livre</h1>
                <p className="text-muted-foreground mt-2">
                    Ajoutez manuellement un livre à votre collection.
                </p>
            </div>

            {/* Form */}
            <BookForm
                authors={authors}
                genres={genres}
                prefillData={params.title || params.author || params.coverUrl || params.totalPages ? {
                    title: params.title || "",
                    author: params.author || "",
                    coverUrl: params.coverUrl || "",
                    totalPages: params.totalPages || "",
                } : undefined}
            />
        </div>
    )
}
