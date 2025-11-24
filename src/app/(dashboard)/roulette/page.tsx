import { ReadingRouletteDialog } from "@/components/reading-roulette-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Dices, Sparkles, TrendingUp } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Roulette de Lecture | BookMate",
    description: "Laissez le hasard choisir votre prochain livre !",
}

export default async function RoulettePage() {
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

    // Get statistics
    const toReadCount = await prisma.book.count({
        where: {
            userId: user.id,
            status: "TO_READ"
        }
    })

    const genresCount = await prisma.genre.count({
        where: {
            books: {
                some: {
                    userId: user.id,
                    status: "TO_READ"
                }
            }
        }
    })

    const totalBooks = await prisma.book.count({
        where: { userId: user.id }
    })

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
                <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900/20 dark:to-orange-900/20 rounded-full">
                        <Dices className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Roulette de Lecture
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Vous ne savez pas quel livre lire ensuite ? Laissez le hasard choisir parmi vos livres à lire !
                    Lancez la roulette et découvrez votre prochaine lecture.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Livres à lire
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{toReadCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Dans votre bibliothèque
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Genres disponibles
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{genresCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Catégories différentes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de livres
                        </CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBooks}</div>
                        <p className="text-xs text-muted-foreground">
                            Dans votre collection
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Roulette Section */}
            <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Prêt à tenter votre chance ?</CardTitle>
                    <CardDescription>
                        Choisissez vos préférences et laissez la magie opérer
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <ReadingRouletteDialog />
                </CardContent>
            </Card>

            {/* How it works */}
            <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-center">Comment ça marche ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</span>
                                </div>
                            </div>
                            <CardTitle className="text-center">Choisissez vos filtres</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Sélectionnez le genre et la longueur parmi vos livres à lire
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</span>
                                </div>
                            </div>
                            <CardTitle className="text-center">Lancez la roulette</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Cliquez sur le bouton et profitez de l'animation
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
                                </div>
                            </div>
                            <CardTitle className="text-center">Découvrez votre livre</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Consultez le livre sélectionné ou relancez pour une autre suggestion
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
