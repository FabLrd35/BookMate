import { getAuthorsWithStats } from "@/app/actions/authors"
import { AuthorCard } from "@/components/author-card"
import { Users } from "lucide-react"

export default async function AuthorsPage() {
    const authors = await getAuthorsWithStats()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Auteurs</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Découvrez vos auteurs préférés et leurs statistiques.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">{authors.length} auteur{authors.length > 1 ? "s" : ""}</span>
                </div>
            </div>

            {authors.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Aucun auteur</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        Ajoutez des livres pour voir vos auteurs apparaître ici !
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {authors.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            )}
        </div>
    )
}
