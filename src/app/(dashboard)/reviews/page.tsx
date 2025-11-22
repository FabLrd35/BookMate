import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ExpandableText } from "@/components/expandable-text"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ReviewsPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        redirect("/login")
    }

    const reviews = await prisma.book.findMany({
        where: {
            userId: user.id,
            status: "READ",
            comment: { not: null },
        },
        include: {
            author: true,
            genre: true,
        },
        orderBy: {
            finishDate: 'desc',
        },
    })


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Critiques</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Vos avis et notes sur les livres que vous avez lus.
                </p>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Card className="p-8 sm:p-12">
                    <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Aucune critique enregistrée pour le moment.</p>
                        <p className="text-xs sm:text-sm mt-2">Ajoutez des notes et commentaires à vos livres lus !</p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6">
                    {reviews.map((book) => (
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
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 sm:h-5 sm:w-5 ${i < book.rating!
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-muted-foreground"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
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
            )}
        </div>
    )
}
