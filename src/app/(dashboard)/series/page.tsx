import { Suspense } from "react"
import { SeriesList } from "@/components/series-list"
import { SeriesDetectionDialog } from "@/components/series-detection-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Sagas - ELOBOOK",
    description: "Gérez vos sagas de livres",
}

export default function SeriesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mes Sagas</h1>
                    <p className="text-muted-foreground mt-2">
                        Organisez vos livres en sagas
                    </p>
                </div>
                <div className="flex gap-2">
                    <SeriesDetectionDialog />
                    {/* Future: Add manual series creation button */}
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-48 rounded-lg bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                }
            >
                <SeriesList />
            </Suspense>
        </div>
    )
}
