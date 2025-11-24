import { getAuthorsWithStats } from "@/app/actions/authors"
import { AuthorsGrid } from "@/components/authors-grid"

export default async function AuthorsPage() {
    const authors = await getAuthorsWithStats()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Auteurs</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Découvrez vos auteurs préférés et leurs statistiques.
                </p>
            </div>

            <AuthorsGrid authors={authors} />
        </div>
    )
}
