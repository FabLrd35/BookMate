import { seedDatabase } from "../actions/seed"
import { redirect } from "next/navigation"

export default async function SeedPage() {
    const result = await seedDatabase()

    if (result.success) {
        redirect('/books')
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Seeding Database...</h1>
                <p className="text-muted-foreground">{result.message}</p>
            </div>
        </div>
    )
}
