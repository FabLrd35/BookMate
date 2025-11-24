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
        <Link href={`/authors/${author.id}`} className="group h-full">
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-muted/60">
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-background shadow-lg ring-1 ring-muted">
                            {author.photoUrl ? (
                                <Image
                                    src={author.photoUrl}
                                    alt={author.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="96px"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <User className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                            {author.name}
                        </h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t">
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{author.totalBooks}</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <BookCheck className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{author.booksRead}</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Lus</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="p-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                                <Star className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">
                                    {author.averageRating > 0 ? author.averageRating.toFixed(1) : "-"}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Note</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
