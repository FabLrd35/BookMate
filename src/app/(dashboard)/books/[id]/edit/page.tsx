import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getAuthors, getGenres } from "@/app/actions/books"
import { BookForm } from "@/components/book-form"

interface EditBookPageProps {
    params: Promise<{ id: string }>
}

export default async function EditBookPage({ params }: EditBookPageProps) {
    const { id } = await params

    const book = await prisma.book.findUnique({
        where: { id },
        include: {
            author: true,
            genre: true,
        },
    }).then(b => b ? ({
        ...b,
        rating: b.rating === null ? null : Number(b.rating)
    }) : null)

    if (!book) {
        notFound()
    }

    const authors = await getAuthors()
    const genres = await getGenres()

    // Transform book data to match form expectations
    const initialData = {
        id: book.id,
        title: book.title,
        author: { name: book.author.name },
        genre: book.genre ? { name: book.genre.name } : null,
        coverUrl: book.coverUrl,
        summary: book.summary,
        status: book.status,
        currentPage: book.currentPage,
        totalPages: book.totalPages,
        rating: book.rating,
        comment: book.comment,
        startDate: book.startDate,
        finishDate: book.finishDate,
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Modifier le livre</h1>
                <p className="text-muted-foreground mt-2">
                    Mettez à jour les informations de votre livre.
                </p>
            </div>

            {/* Form */}
            <BookForm authors={authors} genres={genres} initialData={initialData} />
        </div>
    )
}
