import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, BookOpen, BookCheck, Star } from "lucide-react"

interface AuthorCardProps {
    author: {
        id: string
        name: string
        photoUrl: string | null
        totalBooks: number
        booksRead: number
        averageRating: number
    }
}

export function AuthorCard({ author }: AuthorCardProps) {
    return (
        <Link href={`/authors/${author.id}`}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="relative p-2 bg-primary/10 rounded-full overflow-hidden">
                            {author.photoUrl ? (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                    <Image
                                        src={author.photoUrl}
                                        alt={author.name}
                                        fill
                                        className="object-cover"
                                        sizes="32px"
                                    />
                                </div>
                            ) : (
                                <User className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <span className="truncate">{author.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span>Total</span>
                            </div>
                            <span className="font-semibold">{author.totalBooks} livre{author.totalBooks > 1 ? "s" : ""}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookCheck className="h-4 w-4" />
                                <span>Lus</span>
                            </div>
                            <span className="font-semibold">{author.booksRead}</span>
                        </div>

                        {author.averageRating > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Star className="h-4 w-4" />
                                    <span>Note moyenne</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">{author.averageRating.toFixed(1)}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
