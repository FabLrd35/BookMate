import Image from "next/image"
import { BookOpen } from "lucide-react"

interface Book {
    id: string
    title: string
    coverUrl: string | null
}

interface BookshelfPreviewProps {
    books: Book[]
    totalCount: number
}

export function BookshelfPreview({ books, totalCount }: BookshelfPreviewProps) {
    if (books.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun livre</p>
                </div>
            </div>
        )
    }

    const displayBooks = books.slice(0, 4)
    const remainingCount = totalCount - displayBooks.length

    return (
        <div className="relative h-32 flex items-center justify-center gap-1 px-4 py-2">
            <div className="flex items-end gap-1 perspective-1000">
                {displayBooks.map((book, index) => (
                    <div
                        key={book.id}
                        className="relative group transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                        style={{
                            zIndex: index,
                            transform: `translateX(${index * -8}px)`,
                        }}
                    >
                        <div className="relative w-16 h-24 rounded-sm shadow-lg overflow-hidden border border-border/50 bg-muted">
                            {book.coverUrl ? (
                                <Image
                                    src={book.coverUrl}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                    <BookOpen className="h-6 w-6 text-primary/40" />
                                </div>
                            )}
                        </div>
                        {/* Subtle spine effect */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/20 to-transparent" />
                    </div>
                ))}

                {remainingCount > 0 && (
                    <div className="flex items-center justify-center w-16 h-24 ml-2 rounded-sm border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">
                            +{remainingCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
